class Hook {
    constructor(args = []) {
        this.args = args;        // 参数列表
        this.taps = [];         // 存储所有的回调函数
        this.interceptors = []; // 拦截器
    }

    // 注册拦截器
    intercept(interceptor) {
        this.interceptors.push(interceptor);
    }

    // 获取回调函数的参数列表
    _getTapParams(tap) {
        return {
            name: tap.name,          // 标识符
            type: tap.type,          // 类型：sync、async、promise
            fn: tap.fn,              // 回调函数
            stage: tap.stage || 0    // 执行顺序
        };
    }

    // 注册回调函数
    _tap(type, options, fn) {
        if (typeof options === 'string') {
            options = { name: options };
        }
        
        const tapInfo = {
            ...options,
            type,
            fn
        };

        // 触发拦截器的tap事件
        for (const interceptor of this.interceptors) {
            if (interceptor.tap) {
                interceptor.tap(tapInfo);
            }
        }

        // 按stage排序
        this.taps.push(tapInfo);
        this.taps.sort((a, b) => (a.stage || 0) - (b.stage || 0));
    }

    // 同步注册
    tap(options, fn) {
        this._tap('sync', options, fn);
    }

    // 异步注册（Promise）
    tapPromise(options, fn) {
        this._tap('promise', options, fn);
    }

    // 异步注册（回调式）
    tapAsync(options, fn) {
        this._tap('async', options, fn);
    }
}

module.exports = Hook;
