const ConcurrencyQueue = require('./index');
const delay = require('delay');


test('.push()', (done) => {
  const queue = new ConcurrencyQueue();
  const input = new Promise((resolve, reject) => {
    queue.push(() => {
      try {
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  })

  return input.then(() => {
    expect(queue.queue.length).toBe(0);
    expect(queue.count).toBe(0);
    expect(queue.stopped).toBe(true);
    done()
  })
  .catch(err => {done(err)});
});


test('.push(), autostart - off', () => {
  const queue = new ConcurrencyQueue(0, false);
  queue.push(() => true);
  
  expect(queue.queue.length).toBe(1);
  expect(queue.count).toBe(0);
  expect(queue.stopped).toBe(true);
});


test('.push(), concurrency = 1', (done) => {
  const CONCURRENCY = 1;
  const NUMBER_TASKS = 10;
  const DELAY = 50;
  const queue = new ConcurrencyQueue(CONCURRENCY);
  
  const input = Array.from({length: NUMBER_TASKS}, (i, index) => new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        if (index) {
          expect(queue.queue.length).toBe(NUMBER_TASKS - 1 - index);
        }
        expect(queue.count).toBeLessThanOrEqual(CONCURRENCY);
        expect(queue.stopped).toBe(false);
        await delay(DELAY);
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  }));

	return Promise.all(input).then(() => {done()}).catch(err => {done(err)});
});


test('.push(), concurrency = 5', (done) => {
  const CONCURRENCY = 5;
  const NUMBER_TASKS = 100;
  const DELAY = 20;
  const queue = new ConcurrencyQueue(CONCURRENCY);
  let running = 0;

  const input = Array.from({length: NUMBER_TASKS}, () => new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        running++;
        expect(running).toBeLessThanOrEqual(CONCURRENCY);
        expect(queue.count).toBeLessThanOrEqual(CONCURRENCY);
        if (running <= CONCURRENCY) {
          expect(queue.stopped).toBe(false);
        }
        await delay(DELAY);
        running--;
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  }));

	return Promise.all(input).then(() => {done()}).catch(err => {done(err)});
});


test('.pushAll(), concurrency = 1', (done) => {
  const CONCURRENCY = 1;
  const NUMBER_TASKS = 10;
  const DELAY = 50;
  const queue = new ConcurrencyQueue(CONCURRENCY);
  
  const input = new Promise((resolve, reject) => {
    const tasks = Array.from({length: NUMBER_TASKS}, (i, index) => async () => {
      try {
        if (index) {
          expect(queue.queue.length).toBe(NUMBER_TASKS - 1 - index);
        }
        expect(queue.count).toBeLessThanOrEqual(CONCURRENCY);
        expect(queue.stopped).toBe(false);
        await delay(DELAY);
        if (index === NUMBER_TASKS - 1) {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
    queue.pushAll(tasks)
  })

	return input.then(() => {done()}).catch(err => {done(err)});
});