// 在Web Worker中不能直接使用import语句导入非ES模块
// 我们需要自己实现createChunk函数

// 首先加载SparkMD5
let SparkMD5;

// 使用fetch加载SparkMD5
async function loadSparkMD5() {
  try {
    const response = await fetch("https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js");
    if (!response.ok) {
      throw new Error(`Failed to fetch SparkMD5: ${response.status} ${response.statusText}`);
    }
    const code = await response.text();
    // 使用eval执行代码（在Web Worker中是安全的）
    eval(code);
    // 现在SparkMD5应该可用了
    SparkMD5 = self.SparkMD5;
    console.log("[Worker] SparkMD5 loaded successfully");
    return SparkMD5;
  } catch (error) {
    console.error("[Worker] Error loading SparkMD5:", error);
    throw error;
  }
}

// 创建分块并计算哈希
async function createChunk(file, index, chunkSize) {
  // 确保SparkMD5已加载
  if (!SparkMD5) {
    await loadSparkMD5();
  }
  
  return new Promise((resolve, reject) => {
    try {
      const start = index * chunkSize;
      const end = Math.min((index + 1) * chunkSize, file.size);
      
      // 检查边界条件
      if (start >= file.size) {
        console.warn(`[Worker] Chunk index ${index} starts beyond file size, skipping`);
        resolve(null);
        return;
      }
      
      const blob = file.slice(start, end);
      
      // 检查blob是否有效
      if (blob.size === 0) {
        console.warn(`[Worker] Empty blob for chunk ${index}, skipping`);
        resolve(null);
        return;
      }
      
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();
      
      fileReader.onload = () => {
        try {
          spark.append(fileReader.result);
          const hash = spark.end();
          console.log(`[Worker] Processed chunk ${index}: ${start}-${end}, hash: ${hash.substr(0, 6)}...`);
          resolve({ start, end, index, hash, blob });
        } catch (error) {
          console.error(`[Worker] Error processing chunk ${index}:`, error);
          reject(error);
        }
      };
      
      fileReader.onerror = (error) => {
        console.error(`[Worker] FileReader error for chunk ${index}:`, error);
        reject(error);
      };
      
      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error(`[Worker] Error in createChunk for index ${index}:`, error);
      reject(error);
    }
  });
}

// 处理主线程消息
self.onmessage = async (e) => {
  try {
    const { file, start, end, CHUNK_SIZE } = e.data;
    console.log(`[Worker] Processing chunks ${start} to ${end-1}`);
    
    // 确保SparkMD5已加载
    await loadSparkMD5();
    
    const proms = [];
    for (let i = start; i < end; i++) {
      proms.push(createChunk(file, i, CHUNK_SIZE));
    }
    
    // 使用Promise.allSettled确保即使有些块处理失败，也能返回其他成功的块
    const results = await Promise.allSettled(proms);
    const chunks = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    console.log(`[Worker] Chunk ${start}-${end-1} processed, returning ${chunks.length} valid chunks`);
    postMessage(chunks);
  } catch (error) {
    console.error("[Worker] Error in worker:", error);
    // 即使出错也发送消息，让主线程知道这个worker已完成
    postMessage([]);
  }
};
