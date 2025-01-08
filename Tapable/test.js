const SyncHook = require('./SyncHook');
const SyncWaterfallHook = require('./SyncWaterfallHook');
const AsyncParallelHook = require('./AsyncParallelHook');
const AsyncSeriesHook = require('./AsyncSeriesHook');

// 测试同步钩子
console.log('=== 测试 SyncHook ===');
const syncHook = new SyncHook(['name']);
syncHook.tap('1', (name) => {
    console.log('同步钩子1:', name);
});
syncHook.tap('2', (name) => {
    console.log('同步钩子2:', name);
});
syncHook.call('张三');

// 测试同步瀑布钩子
console.log('\n=== 测试 SyncWaterfallHook ===');
const waterfallHook = new SyncWaterfallHook(['data']);
waterfallHook.tap('1', (data) => {
    console.log('瀑布钩子1:', data);
    return data + ' -> 处理1';
});
waterfallHook.tap('2', (data) => {
    console.log('瀑布钩子2:', data);
    return data + ' -> 处理2';
});
const waterfallResult = waterfallHook.call('原始数据');
console.log('瀑布最终结果:', waterfallResult);

// 测试异步并行钩子
console.log('\n=== 测试 AsyncParallelHook ===');
const parallelHook = new AsyncParallelHook(['data']);
parallelHook.tapPromise('1', async (data) => {
    console.log('并行钩子1开始:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('并行钩子1完成');
});
parallelHook.tapPromise('2', async (data) => {
    console.log('并行钩子2开始:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('并行钩子2完成');
});
parallelHook.promise('异步数据').then(() => {
    console.log('所有并行任务完成');
});

// 测试异步串行钩子
console.log('\n=== 测试 AsyncSeriesHook ===');
const seriesHook = new AsyncSeriesHook(['data']);
seriesHook.tapPromise('1', async (data) => {
    console.log('串行钩子1开始:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('串行钩子1完成');
});
seriesHook.tapPromise('2', async (data) => {
    console.log('串行钩子2开始:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('串行钩子2完成');
});
seriesHook.promise('异步数据').then(() => {
    console.log('所有串行任务完成');
});
