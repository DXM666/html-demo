const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncSeriesHook
} = require('tapable');

class Compiler {
    constructor() {
        // 初始化各种钩子
        this.hooks = {
            // 同步钩子
            start: new SyncHook(['config']),
            // 同步保险钩子：如果返回值不为undefined则中断
            process: new SyncBailHook(['data']),
            // 同步瀑布钩子：上一个处理函数的返回值会传给下一个处理函数
            transform: new SyncWaterfallHook(['filename']),
            // 异步并行钩子
            parallel: new AsyncParallelHook(['data']),
            // 异步串行钩子
            series: new AsyncSeriesHook(['data'])
        };
    }

    run() {
        // 触发同步钩子
        this.hooks.start.call({ entry: './src/index.js' });

        // 触发保险钩子
        const processResult = this.hooks.process.call('处理数据');
        console.log('处理结果:', processResult);

        // 触发瀑布钩子
        const filename = this.hooks.transform.call('original.js');
        console.log('最终文件名:', filename);

        // 触发异步并行钩子
        this.hooks.parallel.promise('并行数据').then(() => {
            console.log('所有并行任务完成');
        });

        // 触发异步串行钩子
        this.hooks.series.promise('串行数据').then(() => {
            console.log('所有串行任务完成');
        });
    }
}

// 创建编译器实例
const compiler = new Compiler();

// 注册同步钩子处理函数
compiler.hooks.start.tap('StartPlugin', (config) => {
    console.log('开始编译，配置:', config);
});

// 注册保险钩子处理函数
compiler.hooks.process.tap('ProcessPlugin', (data) => {
    console.log('处理数据:', data);
    // return '中断后续处理'; // 如果返回非undefined值，将中断后续处理
});

// 注册瀑布钩子处理函数
compiler.hooks.transform.tap('TransformPlugin1', (filename) => {
    return filename.replace('.js', '.processed.js');
});
compiler.hooks.transform.tap('TransformPlugin2', (filename) => {
    return filename.replace('.processed.js', '.final.js');
});

// 注册异步并行钩子处理函数
compiler.hooks.parallel.tapPromise('ParallelPlugin1', async (data) => {
    console.log('并行任务1开始:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('并行任务1完成');
});
compiler.hooks.parallel.tapPromise('ParallelPlugin2', async (data) => {
    console.log('并行任务2开始:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('并行任务2完成');
});

// 注册异步串行钩子处理函数
compiler.hooks.series.tapPromise('SeriesPlugin1', async (data) => {
    console.log('串行任务1开始:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('串行任务1完成');
});
compiler.hooks.series.tapPromise('SeriesPlugin2', async (data) => {
    console.log('串行任务2开始:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('串行任务2完成');
});

// 运行编译器
compiler.run();
