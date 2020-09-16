const ConcurrencyQueue = require('./index');
const delay = require('delay');

test('.push()', () => {
  const queue = new ConcurrencyQueue();
  queue.push(() => true);
  expect(queue.queue.length).toBe(0);
  expect(queue.count).toBe(1);
  expect(queue.stopped).toBe(true);
});

test('.push(), concurrency = 1', (done) => {
  const concurrency = 1;
  const queue = new ConcurrencyQueue(concurrency);
  
  for (let i = 0; i < 10; i++) {
    const task = async () => {
      try {
        expect(queue.queue.length).toBe(i);
        expect(queue.count).toBeLessThanOrEqual(concurrency);
        expect(queue.stopped).toBe(false);
        done();
        await delay(50);
      } catch (error) {
        done(error);
      }
    };
    queue.push(task);
  }

  expect(queue.queue.length).toBe(9);
  expect(queue.count).toBeLessThanOrEqual(concurrency);
  expect(queue.stopped).toBe(true);
});

test('.push(), concurrency = 5', (done) => {
  const concurrency = 5;
  const queue = new ConcurrencyQueue(concurrency);
  let running = 0;

	new Array(100).fill(0).forEach( () => queue.push( () => {
    try {
      running++;
      expect(running).toBeLessThanOrEqual(concurrency);
      expect(queue.count).toBeLessThanOrEqual(concurrency);
      running--;
      done();
    } catch (error) {
      done(error);
    }
	}));
});
