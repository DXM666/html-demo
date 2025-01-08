const Hook = require('./Hook');

class AsyncSeriesHook extends Hook {
    // Promise方式调用
    async promise(...args) {
        if (args.length < this.args.length) {
            throw new Error('参数不足');
        }

        for (const tap of this.taps) {
            // 触发拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, ...args);
                }
            }

            // 按顺序执行异步回调
            await tap.fn(...args);
        }
    }

    // 回调方式调用
    callAsync(...args) {
        const callback = args.pop();
        if (typeof callback !== 'function') {
            throw new Error('最后一个参数必须是回调函数');
        }

        let index = 0;
        const next = () => {
            if (index >= this.taps.length) {
                callback();
                return;
            }

            const tap = this.taps[index++];
            
            // 触发拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, ...args);
                }
            }

            // 串行执行异步回调
            tap.fn(...args, next);
        };

        next();
    }
}

module.exports = AsyncSeriesHook;
