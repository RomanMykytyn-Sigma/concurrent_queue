class ConcurrencyQueue {

  constructor(concurrency = 0, autoStart = true) {
    this.concurrency = concurrency;
    this.queue = [];
    this.count = 0;
    this.stopped = true;
    this.autoStart = autoStart;
  }

  start() {
    if (!this.stopped) {
      return
    }
    this.stopped = false;
    this.run();
  }

  stop() {
    this.stopped = true;
  }

  push(task) {
    this.queue.push(task);
    if (this.autoStart) {
      this.start();
    }
  }

  pushAll(tasks) {
    this.queue.push(...tasks);
    if (this.autoStart) {
      this.start();
    }
  }

  runTask() {
    if (!this.queue.length || this.stopped) {
      return
    }
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
      if (!this.queue.length) {
        this.stop();
        return;
      } 
      this.run();
    })
      .catch((err) => {
        console.error(err);
        this.count -= 1;
        this.stop();
      });
  }

  run() {
    while (this.queue.length > 0 && !this.stopped) {
      if (this.count >= this.concurrency && this.concurrency !== 0) {
        return
      }
      this.runTask();
    }
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

const func4 = async () => {
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

const q = new ConcurrencyQueue(1);
q.push(func1);
q.push(func2);
q.push(func3);
//q.run();


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/

module.exports = ConcurrencyQueue;