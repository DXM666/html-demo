// 不使用静态import
// import * as _ from "https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.js";

const CHUNK_SIZE = 1024 * 1024; // 1MB 的块大小
const MAX_THREAD_COUNT = navigator.hardwareConcurrency || 4;

// 动态导入SparkMD5
let SparkMD5;
(async () => {
    // 动态导入
    const script = document.createElement("script");
    script.src =
        "https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js";
    script.onload = () => {
        // 全局可用的SparkMD5
        SparkMD5 = window.SparkMD5;
        console.log("SparkMD5 loaded:", SparkMD5);
    };
    document.head.appendChild(script);
})();

export const cut = async (file) => {
    return new Promise((resolve) => {
        console.log(`文件大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        
        // 计算分块数量
        const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
        console.log(`总分块数: ${chunkCount}`);
        
        // 根据文件大小动态调整线程数
        // 确保每个线程至少处理一个块
        const threadCount = Math.min(MAX_THREAD_COUNT, chunkCount);
        console.log(`使用线程数: ${threadCount}`);
        
        // 如果文件太小，没有足够的块
        if (chunkCount === 0) {
            console.log("文件过小，无需分块");
            resolve([]);
            return;
        }
        
        const chunks = new Array(chunkCount);
        let finishedCount = 0;
        
        // 计算每个线程处理的块数
        const dealChunkCount = Math.ceil(chunkCount / threadCount);
        console.log(`每个线程处理的块数: ${dealChunkCount}`);
        
        // 创建并分配工作给线程
        for (let i = 0; i < threadCount; i++) {
            const start = i * dealChunkCount;
            let end = (i + 1) * dealChunkCount;
            
            // 确保不超出总块数
            if (end > chunkCount) {
                end = chunkCount;
            }
            
            // 如果这个线程没有工作要做，跳过
            if (start >= chunkCount || start >= end) {
                console.log(`线程 ${i} 没有工作，跳过`);
                finishedCount++;
                continue;
            }
            
            console.log(`线程 ${i} 处理块 ${start} 到 ${end-1}`);
            
            const worker = new Worker(new URL("./work.js", import.meta.url), {
                type: "module",
            });
            
            worker.postMessage({ file, start, end, CHUNK_SIZE });
            
            worker.onmessage = (e) => {
                console.log(`线程 ${i} 返回了 ${e.data.length} 个块`);
                
                // 处理返回的数据
                for (let j = 0; j < e.data.length; j++) {
                    const chunk = e.data[j];
                    if (chunk) {
                        chunks[chunk.index] = chunk;
                    }
                }

                worker.terminate();
                finishedCount++;
                console.log(`线程 ${i} 处理完成，已完成 ${finishedCount}/${threadCount} 个线程`);

                // 当所有线程完成时，返回结果
                if (finishedCount === threadCount) {
                    console.log("所有线程处理完成");
                    // 过滤掉可能的空值
                    const validChunks = chunks.filter(Boolean);
                    console.log(`有效块数: ${validChunks.length}`);
                    resolve(validChunks);
                }
            };
            
            // 添加错误处理
            worker.onerror = (error) => {
                console.error(`线程 ${i} 发生错误:`, error);
                worker.terminate();
                finishedCount++;
                
                if (finishedCount === threadCount) {
                    console.log("所有线程处理完成（含错误）");
                    resolve(chunks.filter(Boolean));
                }
            };
        }
    });
};
