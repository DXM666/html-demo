const Hook = require('./Hook');

class AsyncParallelHook extends Hook {
    // Promise方式调用
    promise(...args) {
        if (args.length < this.args.length) {
            throw new Error('参数不足');
        }

        const promises = this.taps.map(tap => {
            // 触发拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, ...args);
                }
            }

            // 执行异步回调
            return tap.fn(...args);
        });

        return Promise.all(promises);
    }

    // 回调方式调用
    callAsync(...args) {
        const callback = args.pop();
        if (typeof callback !== 'function') {
            throw new Error('最后一个参数必须是回调函数');
        }

        let count = this.taps.length;
        const done = () => {
            count--;
            if (count === 0) {
                callback();
            }
        };

        for (const tap of this.taps) {
            // 触发拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, ...args);
                }
            }

            // 执行异步回调
            tap.fn(...args, done);
        }
    }
}

module.exports = AsyncParallelHook;
