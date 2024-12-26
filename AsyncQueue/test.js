const AsyncQueue = require('./AsyncQueue');

// 创建一个异步队列实例，设置最大并发数为2
const queue = new AsyncQueue({ parallelism: 2, name: '测试队列' });

// 模拟异步任务
const createTask = (id, delay) => {
    return async () => {
        console.log(`任务 ${id} 开始执行`);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`任务 ${id} 执行完成`);
        return `任务 ${id} 的结果`;
    };
};

// 测试代码
async function test() {
    try {
        // 添加多个任务
        const promises = [
            queue.add(createTask(1, 2000), 1),  // 优先级1
            queue.add(createTask(2, 1000), 2),  // 优先级2
            queue.add(createTask(3, 3000), 0),  // 优先级0
            queue.add(createTask(4, 1500), 3)   // 优先级3
        ];

        // 等待所有任务完成
        const results = await Promise.all(promises);
        console.log('所有任务执行结果:', results);
        console.log('队列中存储的结果:', queue.getResults());
    } catch (error) {
        console.error('发生错误:', error);
    }
}

// 运行测试
test();
