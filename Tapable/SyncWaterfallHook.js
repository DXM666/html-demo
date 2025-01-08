const Hook = require('./Hook');

class SyncWaterfallHook extends Hook {
    call(...args) {
        if (args.length < this.args.length) {
            throw new Error('参数不足');
        }

        const taps = this.taps;
        let result = args[0]; // 初始值

        for (const tap of taps) {
            // 触发拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, result, ...args.slice(1));
                }
            }
            // 执行回调并传递结果
            result = tap.fn(result, ...args.slice(1));
        }

        return result;
    }
}

module.exports = SyncWaterfallHook;
