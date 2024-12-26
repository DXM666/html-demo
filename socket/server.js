const net = require('net');

// 创建一个TCP服务器实例
const server = net.createServer((socket) => {
  console.log('客户端已连接');

  // 接收数据
  socket.on('data', (data) => {
    console.log(`接收到数据：${data}`);
    console.log(`接收到数据：${socket.bytesRead}`);
    // 发送数据回客户端
    socket.write(`你发送的数据是：${data}`);
  });

  // 连接结束时触发
  socket.on('end', () => {
    console.log('客户端已断开连接');
  });
});

// 监听端口
server.listen(6789, () => {
  console.log('服务器正在监听6789端口');
});
