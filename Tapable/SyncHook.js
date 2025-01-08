const Hook = require('./Hook');

class SyncHook extends Hook {
    call(...args) {
        // 检查参数数量
        if (args.length < this.args.length) {
            throw new Error('参数不足');
        }

        const taps = this.taps;
        for (const tap of taps) {
            // 触发拦截器的call事件
            for (const interceptor of this.interceptors) {
                if (interceptor.call) {
                    interceptor.call(tap, ...args);
                }
            }
            // 执行回调
            tap.fn(...args);
        }
    }
}

module.exports = SyncHook;
