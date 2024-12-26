class AsyncQueue {
    constructor(options = {}) {
        this.parallelism = options.parallelism || 1; // 默认并发数为1
        this.name = options.name || 'AsyncQueue';    // 队列名称
        this.queue = [];                             // 任务队列
        this.running = 0;                            // 当前正在运行的任务数
        this.error = null;                           // 存储错误信息
        this._results = [];                          // 存储任务结果
    }

    // 添加任务到队列
    add(task, priority = 0) {
        return new Promise((resolve, reject) => {
            const taskWrapper = {
                task,
                priority,
                resolve,
                reject
            };

            this.queue.push(taskWrapper);
            // 按优先级排序，优先级高的排在前面
            this.queue.sort((a, b) => b.priority - a.priority);
            
            // 尝试执行任务
            this._next();
        });
    }

    // 执行下一个任务
    async _next() {
        // 如果已经有错误，不再执行新任务
        if (this.error) return;

        // 如果正在运行的任务数达到上限，或者队列为空，则返回
        if (this.running >= this.parallelism || this.queue.length === 0) return;

        // 增加正在运行的任务计数
        this.running++;

        // 取出队列中的第一个任务
        const taskWrapper = this.queue.shift();

        try {
            // 执行任务
            const result = await taskWrapper.task();
            this._results.push(result);
            taskWrapper.resolve(result);
        } catch (err) {
            this.error = err;
            taskWrapper.reject(err);
        } finally {
            // 减少正在运行的任务计数
            this.running--;
            // 继续执行下一个任务
            this._next();
        }
    }

    // 获取所有任务的结果
    getResults() {
        return this._results;
    }

    // 清空队列
    clear() {
        this.queue = [];
        this._results = [];
        this.error = null;
    }

    // 获取队列长度
    get length() {
        return this.queue.length;
    }

    // 获取当前运行状态
    get isRunning() {
        return this.running > 0;
    }
}

module.exports = AsyncQueue;
