// 先定义三个常量表示状态
var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

function FakePromise(fn) {
  this.status = PENDING;    // 初始状态为pending
  this.value = null;        // 初始化value
  this.reason = null;       // 初始化reason

  // 构造函数里面添加两个数组存储成功和失败的回调
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  // 存一下this,以便resolve和reject里面访问
  var that = this;
  // resolve方法参数是value
  function resolve(value) {
    if (that.status === PENDING) {
      that.status = FULFILLED;
      that.value = value;

      // resolve里面将所有成功的回调拿出来执行
      that.onFulfilledCallbacks.forEach(callback => {
        callback(that.value);
      });
    }
  }

  // reject方法参数是reason
  function reject(reason) {
    if (that.status === PENDING) {
      that.status = REJECTED;
      that.reason = reason;

      // resolve里面将所有失败的回调拿出来执行
      that.onRejectedCallbacks.forEach(callback => {
        callback(that.reason);
      });
    }
  }

  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (x instanceof FakePromise) {
    // 如果 x 为 Promise ，则使 promise 接受 x 的状态
    // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
    // 这个if跟下面判断then然后拿到执行其实重复了，可有可无
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject);
    }, reject);
  }
  // 如果 x 为对象或者函数
  else if (typeof x === 'object' || typeof x === 'function') {
    // 这个坑是跑测试的时候发现的，如果x是null，应该直接resolve
    if (x === null) {
      return resolve(x);
    }

    try {
      // 把 x.then 赋值给 then
      var then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      var called = false;
      // 将 x 作为函数的作用域 this 调用之
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      // 名字重名了，我直接用匿名函数了
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          function (y) {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 e：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        if (called) return;

        // 否则以 e 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}

FakePromise.prototype.then = function (onFulfilled, onRejected) {
  // 如果onFulfilled不是函数，给一个默认函数，返回value
  // 后面返回新promise的时候也做了onFulfilled的参数检查，这里可以删除，暂时保留是为了跟规范一一对应，看得更直观
  var realOnFulfilled = onFulfilled;
  if (typeof realOnFulfilled !== 'function') {
    realOnFulfilled = function (value) {
      return value;
    }
  }

  // 如果onRejected不是函数，给一个默认函数，返回reason的Error
  // 后面返回新promise的时候也做了onRejected的参数检查，这里可以删除，暂时保留是为了跟规范一一对应，看得更直观
  var realOnRejected = onRejected;
  if (typeof realOnRejected !== 'function') {
    realOnRejected = function (reason) {
      throw reason;
    }
  }

  var that = this;   // 保存一下this

  if (this.status === FULFILLED) {
    var promise2 = new FakePromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== 'function') {
            resolve(that.value);
          } else {
            var x = realOnFulfilled(that.value);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  if (this.status === REJECTED) {
    var promise2 = new FakePromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onRejected !== 'function') {
            reject(that.reason);
          } else {
            var x = realOnRejected(that.reason);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  // 如果还是PENDING状态，将回调保存下来
  if (this.status === PENDING) {
    var promise2 = new FakePromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(that.value);
            } else {
              var x = realOnFulfilled(that.value);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
      that.onRejectedCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (typeof onRejected !== 'function') {
              reject(that.reason);
            } else {
              var x = realOnRejected(that.reason);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (error) {
            reject(error);
          }
        }, 0)
      });
    });

    return promise2;
  }
}

FakePromise.deferred = function () {
  var result = {};
  result.promise = new FakePromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

FakePromise.resolve = function (parameter) {
  if (parameter instanceof FakePromise) {
    return parameter;
  }

  return new FakePromise(function (resolve) {
    resolve(parameter);
  });
}

FakePromise.reject = function (reason) {
  return new FakePromise(function (resolve, reject) {
    reject(reason);
  });
}

FakePromise.all = function (promiseList) {
  var resPromise = new FakePromise(function (resolve, reject) {
    var count = 0;
    var result = [];
    var length = promiseList.length;

    if (length === 0) {
      return resolve(result);
    }

    promiseList.forEach(function (promise, index) {
      FakePromise.resolve(promise).then(function (value) {
        count++;
        result[index] = value;
        if (count === length) {
          resolve(result);
        }
      }, function (reason) {
        reject(reason);
      });
    });
  });

  return resPromise;
}

FakePromise.race = function (promiseList) {
  var resPromise = new FakePromise(function (resolve, reject) {
    var length = promiseList.length;

    if (length === 0) {
      return resolve();
    } else {
      for (var i = 0; i < length; i++) {
        FakePromise.resolve(promiseList[i]).then(function (value) {
          return resolve(value);
        }, function (reason) {
          return reject(reason);
        });
      }
    }
  });

  return resPromise;
}

FakePromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected);
}

FakePromise.prototype.finally = function (fn) {
  return this.then(function (value) {
    return FakePromise.resolve(fn()).then(function () {
      return value;
    });
  }, function (error) {
    return FakePromise.resolve(fn()).then(function () {
      throw error
    });
  });
}

FakePromise.allSettled = function (promiseList) {
  return new FakePromise(function (resolve) {
    var length = promiseList.length;
    var result = [];
    var count = 0;

    if (length === 0) {
      return resolve(result);
    } else {
      for (var i = 0; i < length; i++) {

        (function (i) {
          var currentPromise = FakePromise.resolve(promiseList[i]);

          currentPromise.then(function (value) {
            count++;
            result[i] = {
              status: 'fulfilled',
              value: value
            }
            if (count === length) {
              return resolve(result);
            }
          }, function (reason) {
            count++;
            result[i] = {
              status: 'rejected',
              reason: reason
            }
            if (count === length) {
              return resolve(result);
            }
          });
        })(i)
      }
    }
  });
}

const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

function isPromise(obj) {
  return !!(
    obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

class FakePromiseCpy {
  constructor(executor) {
    this._state = STATE.PENDING;
    this._value = null;
    this.queue = [];
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (reason) {
      this._reject(reason);
    }
  }

  _runMicroTask(fn) {
    if (process && process.nextTick) {
      process.nextTick(fn);
    } else if (MutationObserver) {
      let observer = new MutationObserver(fn);
      let textNode = document.createTextNode(1);
      observer.observe(textNode, { characterData: true });
      textNode.data = 2;
    } else if (window && window.queueMicrotask) {
      window.queueMicrotask(fn);
    } else {
      setTimeout(fn, 0);
    }
  }

  _runTasks() {
    if (this._state === STATE.PENDING) {
      return;
    }

    while (this.queue.length) {
      let task = this.queue.shift();
      this._runMicroTask(() => {
        this._runTask(task);
      });
    }
  }

  _runTask({ onFulfilled, onRejected, resolve, reject }) {
    if (this._state === STATE.FULFILLED) {
      if (typeof onFulfilled === "function") {
        try {
          let result = onFulfilled(this._value);
          if (isPromise(result)) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (reason) {
          reject(reason);
        }
      } else {
        resolve(this._value);
      }
    } else if (this._state === STATE.REJECTED) {
      if (typeof onRejected === "function") {
        try {
          let result = onRejected(this._value);
          resolve(result);
        } catch (reason) {
          reject(reason);
        }
      } else {
        reject(this._value);
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new FakePromiseCpy((resolve, reject) => {
      this.queue.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });
      this._runTasks();
    });
  }

  catch(onRejected) {
    return new FakePromiseCpy((resolve, reject) => {
      this.queue.push({
        onFulfilled: null,
        onRejected,
        resolve,
        reject,
      });
      this._runTasks();
    });
  }

  _changeState(state, value) {
    if (this._state != STATE.PENDING) {
      return;
    }
    this._state = state;
    this._value = value;
    this._runTasks();
  }

  _resolve(data) {
    this._changeState(STATE.FULFILLED, data);
  }

  _reject(reason) {
    this._changeState(STATE.REJECTED, reason);
  }
}

module.exports = {
  FakePromise,
  FakePromiseCpy
};
