const { FakePromise, FakePromiseCpy } = require("./fakePromise");
const MyPromise = require("./demo");

var sentinel = { sentinel: "sentinel" };
const fn1 = () => {
  console.log("fn1");
};
const fn2 = () => {
  throw new Error("error");
};
const fn3 = () => {
  console.log("fn3");
};

var semiDone = callbackAggregator(3, fn1);
function callbackAggregator(times, ultimateCallback) {
  var soFar = 0;
  return function () {
    if (++soFar === times) {
      ultimateCallback();
    }
  };
}

const p1 = new Promise((resolve, reject) => {
  resolve(sentinel);
}).then(function () {
  return p1;
});
p1.then(null, function (reason) {
  console.log(`Promise: ${reason}`);
});

const p2 = new MyPromise((resolve, reject) => {
  resolve(sentinel);
}).then(function () {
  return p2;
});
p2.then(null, function (reason) {
  console.log(`MyPromise: ${reason}`);
});

const p3 = new FakePromise((resolve, reject) => {
  resolve(sentinel);
}).then(function () {
  return p3;
});
p3.then(null, function (reason) {
  console.log(`FakePromise ${reason}`);
});
