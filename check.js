const MyPromise = require("./demo");

// 测试同步的 thenable
const syncThenable = {
    then: function (onFulfilled) {
        console.log('同步 thenable 的 then 被调用');
        onFulfilled({ value: "sync thenable" });
    },
};

// 测试异步的 thenable
const asyncThenable = {
    then: function (onFulfilled) {
        console.log('异步 thenable 的 then 被调用');
        setTimeout(() => {
            onFulfilled({ value: "async thenable" });
        }, 0);
    },
};

// 测试一次性的 thenable
const onceThenable = {
    called: false,
    get then() {
        console.log('一次性 thenable 的 then 被访问');
        if (!this.called) {
            this.called = true;
            return (onFulfilled) => {
                console.log('一次性 thenable 的 then 被调用');
                onFulfilled({ value: "once thenable" });
            };
        }
        return null;
    },
};

// 测试尝试多次 fulfill 的 thenable
const multiResolveThenable = {
    then: function (onFulfilled) {
        console.log('多次 resolve thenable 的 then 被调用');
        onFulfilled({ value: "first" });
        console.log('尝试第二次 resolve');
        onFulfilled({ value: "second" }); // 第二次应该被忽略
    },
};

// 测试已经 fulfilled 的 promise
const fulfilledPromise = MyPromise.resolve({ value: "already fulfilled" });

// 测试最终会 fulfilled 的 promise
const eventuallyFulfilled = new MyPromise((resolve) => {
    setTimeout(() => {
        resolve({ value: "eventually fulfilled" });
    }, 100);
});

// 运行测试
console.log("=== 测试同步 thenable ===");
MyPromise.resolve(syncThenable)
    .then(value => console.log('结果:', value));

console.log("\n=== 测试异步 thenable ===");
MyPromise.resolve(asyncThenable)
    .then(value => console.log('结果:', value));

console.log("\n=== 测试一次性 thenable ===");
MyPromise.resolve(onceThenable)
    .then(value => console.log('结果:', value));

console.log("\n=== 测试多次 resolve 的 thenable ===");
MyPromise.resolve(multiResolveThenable)
    .then(value => console.log('结果:', value));

console.log("\n=== 测试已经 fulfilled 的 promise ===");
MyPromise.resolve(fulfilledPromise)
    .then(value => console.log('结果:', value));

console.log("\n=== 测试最终会 fulfilled 的 promise ===");
MyPromise.resolve(eventuallyFulfilled)
    .then(value => console.log('结果:', value));

// 测试 Promise 解析链
console.log("\n=== 测试 Promise 解析链 ===");
MyPromise.resolve(1)
    .then(x => {
        console.log("第一个 then:", x);
        return new MyPromise(resolve => setTimeout(() => resolve(x + 1), 100));
    })
    .then(x => {
        console.log("第二个 then:", x);
        return x + 1;
    })
    .then(x => {
        console.log("第三个 then:", x);
    });
