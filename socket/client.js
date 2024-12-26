const net = require('net');

// 创建一个TCP客户端实例
const client = new net.Socket();

// 连接到服务器
client.connect(6789, 'localhost', () => {
  console.log('已连接到服务器');
});

// 接收服务器发送的数据
client.on('data', (data) => {
  console.log(`接收到服务器数据：${data}`);
});

// 连接结束时触发
client.on('end', () => {
  console.log('已从服务器断开连接');
});

// 设置一个定时器，发送数据到服务器
setTimeout(() => {
  client.write('Hello, server!');
}, 1000);

// 设置另一个定时器，一段时间后关闭连接
setTimeout(() => {
  client.end();
}, 5000);
