class ConcurrencyQueue {

  constructor(concurrency = 0) {
    this.concurrency = concurrency;
    this.queue = [];
    this.count = 0;
    this.stopped = true;
  }

  start() {
    if (this.stopped) {
      this.stopped = false;
      this.run();
    }
  }

  async push(task) {
    this.queue.push(task);
    this.start();
  }

  runTask() {
    const task = this.queue.shift();
    this.count += 1;
    const promise = new Promise((resolve, reject) => {
      try {
        resolve(task());
      } catch (error) {
        reject(new Error(error));
      }
      
    });
    promise.then(() => {
      this.count -= 1; 
      this.start();
    })
      .catch((err) => {
        console.error(err);
        this.count -= 1;
        this.stopped = true;
      });
  }

  run() {
    while (this.queue.length > 0 && !this.stopped) {
      if (this.count >= this.concurrency && this.concurrency !== 0) {
        this.stopped = true;
        return
      }
      this.runTask()
    }
    this.stopped = true;
  }
}

/*const func1 = async () => {
  //console.log('func1');
  //setTimeout(() => {console.log('func1')}, 1500);
  //return 'func1';
  //return new Promise((res) => res(setTimeout(() => {console.log('func1')}, 1500)))
  await timeout(2500);
  console.log('func1');
}

/*const func2 = () => {
  //console.log('func1');
  //setTimeout(() => {console.log('func1')}, 1500);
  //return 'func1';
  //return new Promise((res) => res(setTimeout(() => {console.log('func1')}, 1500)))
  console.log('func2');
}
const func2 = async () => {
  //console.log('func2');
  //setTimeout(() => {console.log('func2')}, 500);
  await timeout(2500);
  console.log('func2');
}

const func3 = async () => {
  //console.log('func3');
  //setTimeout(() => {console.log('func3')}, 500);
  await timeout(3000);
  console.log('func3');
}

/*const func4 = async () => {
  //console.log('func4');
  //setTimeout(() => {console.log('func4')}, 500);
  await timeout(500);
  console.log('func4');
}

const func5 = async () => {
  //console.log('func5');
  //setTimeout(() => {console.log('func5')}, 500);
  await timeout(500);
  console.log('func5');
}

const func6 = () => {
  //console.log('func5');
  //setTimeout(() => {console.log('func5')}, 500);
  //timeout(500);
  console.log('func6');
}

const q = new ConcurrencyQueue(2);
q.push(func1);
q.push(func2);
q.push(func3);
//q.run();

const xxx = async () => {
  const ccc =  await q.run([func1, func2, func3, func4, func5]);
  console.log('gh', ccc);
}

xxx();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/

module.exports = ConcurrencyQueue;