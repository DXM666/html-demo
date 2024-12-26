const { FakePromise, FakePromiseCpy } = require("./fakePromise");
const MyPromise = require("./demo");

var dummy = { dummy: "dummy" };
var sentinel = { sentinel: "sentinel" };
var sentinel2 = { sentinel2: "sentinel2" };
var sentinel3 = { sentinel3: "sentinel3" };

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

// MyPromise.reject(dummy)
//   .then(null, function () {
//     return sentinel;
//   })
//   .then(function (value) {
//     console.log("value", value === sentinel);
//     semiDone();
//   });

// MyPromise.reject(dummy)
//   .then(null, function () {
//     throw sentinel2;
//   })
//   .then(null, function (reason) {
//     console.log("reason", reason === sentinel2);
//     semiDone();
//   });

// MyPromise.reject(dummy)
//   .then(null, function () {
//     return sentinel3;
//   })
//   .then(function (value) {
//     console.log("value", value === sentinel3);
//     semiDone();
//   });

// var numberOfTimesThenWasRetrieved = 0;

// var promise = MyPromise.resolve(dummy).then(function() {
//   return Object.create(null, {
//     then: {
//       get: function () {
//         ++numberOfTimesThenWasRetrieved;
//         return function thenMethodForX(onFulfilled) {
//           onFulfilled();
//         };
//       },
//     },
//   });
// });

// promise.then(function () {
//   // assert.strictEqual(numberOfTimesThenWasRetrieved, 1);
//   console.log("numberOfTimesThenWasRetrieved", numberOfTimesThenWasRetrieved);
// });


var promise = MyPromise.resolve(dummy).then(function onBasePromiseFulfilled() {
  return MyPromise.resolve(sentinel);
});

promise.then(function onPromiseFulfilled(value) {
  // assert.strictEqual(value, sentinel);
  console.log("value", value === sentinel);
});