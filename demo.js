let STATUS = {
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
};

const isFn = (fn) => {
    return typeof fn === "function";
};

function isPromise(obj) {
    return !!(
        obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function"
    );
}

class MyPromise {
    constructor(fn) {
        this.status = STATUS.PENDING;
        this.value = undefined;
        this.queue = [];
        try {
            fn(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }

    resolve(value) {
        this.changeStatus({
            status: STATUS.FULFILLED,
            value,
        });
    }
    reject(value) {
        this.changeStatus({
            status: STATUS.REJECTED,
            value,
        });
    }

    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    changeStatus({ status, value }) {
        if (this.status != STATUS.PENDING) {
            return;
        }
        this.status = status;
        this.value = value;
        // then 执行
        this.runTasks();
    }

    runMicroTask(fn) {
        if (typeof window !== "undefined" && window.MutationObserver) {
            const ob = new MutationObserver(fn);
            const textNode = document.createTextNode("1");
            ob.observe(textNode, {
                characterData: true,
            });
            textNode.data = "2";
        } else if (typeof window !== "undefined" && window.queueMicrotask) {
            window.queueMicrotask(fn);
        } else if (process && process.nextTick) {
            process.nextTick(fn);
        } else {
            setTimeout(fn, 0);
        }
    }

    runTasks() {
        if (this.status === STATUS.PENDING) {
            return;
        }
        while (this.queue.length) {
            let task = this.queue.shift();
            this.runMicroTask(() => {
                this.runTask(task);
            });
        }
    }

    checkCircular(promise, returnValue) {
        return (
            isPromise(promise) &&
            isPromise(returnValue) &&
            promise === returnValue
        );
    }

    resolvePromise({ promise, x, resolve, reject }) {
        if (promise === x) {
            reject(new TypeError("The promise and the return value are the same"));
            return;
        }

        let called = false;
        try {
            if (x !== null && (typeof x === "object" || typeof x === "function")) {
                const then = x.then;
                if (typeof then === "function") {
                    then.call(
                        x,
                        (y) => {
                            if (called) return;
                            called = true;
                            this.resolvePromise({ promise, x: y, resolve, reject });
                        },
                        (r) => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    );
                    return;
                }
            }
            resolve(x);
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    }

    runTask({ onFulfilled, onRejected, resolve, reject, getNewPromise }) {
        if (this.status === STATUS.FULFILLED) {
            if (isFn(onFulfilled)) {
                try {
                    let result = onFulfilled(this.value);
                    let newPromise = getNewPromise();
                    this.resolvePromise({
                        promise: newPromise,
                        x: result,
                        resolve,
                        reject,
                    });
                } catch (reason) {
                    reject(reason);
                }
            } else {
                resolve(this.value);
            }
        } else if (this.status === STATUS.REJECTED) {
            if (isFn(onRejected)) {
                try {
                    let result = onRejected(this.value);
                    let newPromise = getNewPromise();
                    this.resolvePromise({
                        promise: newPromise,
                        x: result,
                        resolve,
                        reject,
                    });
                } catch (reason) {
                    reject(reason);
                }
            } else {
                reject(this.value);
            }
        }
    }

    then(onFulfilled, onRejected) {
        var newPromise = new MyPromise((resolve, reject) => {
            this.queue.push({
                onFulfilled,
                onRejected,
                resolve,
                reject,
                getNewPromise: () => {
                    return newPromise;
                },
            });
            this.runTasks();
        });
        return newPromise;
    }
}

MyPromise.resolve = function (value) {
    if (value instanceof MyPromise) {
        return value;
    }
    return new MyPromise((resolve) => {
        this.prototype.resolvePromise({
            promise: null,
            x: value,
            resolve,
            reject: (reason) => {
                throw reason;
            }
        });
    });
};

MyPromise.reject = function (value) {
    return new MyPromise((resolve, reject) => {
        reject(value);
    });
};

MyPromise.deferred = function () {
    var result = {};
    result.promise = new MyPromise(function (resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
    });

    return result;
};

module.exports = MyPromise;
