// const graph = {
//     A: ["B", "C"],
//     B: ["A", "D", "E"],
//     C: ["A", "F"],
//     D: ["B"],
//     E: ["B", "F"],
//     F: ["C", "E"],
//   };
  
//   // 深度优先搜索
//   function dfs(graph, start) {
//     let visited = new Set();
//     let result = [];
  
//     function traverse(node) {
//       if (!visited.has(node)) {
//         visited.add(node);
//         result.push(node);
//         graph[node].forEach((neighbor) => {
//           traverse(neighbor);
//         });
//       }
//     }
  
//     traverse(start);
//     return result;
//   }
  
//   // 广度优先搜索
//   function bfs(graph, start) {
//     let visited = new Set();
//     let queue = [start];
//     let result = [];
  
//     while (queue.length) {
//       let node = queue.shift();
//       if (!visited.has(node)) {
//         visited.add(node);
//         result.push(node);
//         graph[node].forEach((neighbor) => {
//           if (!visited.has(neighbor)) {
//             queue.push(neighbor);
//           }
//         });
//       }
//     }
  
//     return result;
//   }
//   // 测试用例
//   console.log("DFS starting from A:", dfs(graph, 'A')); // 应该输出 ['A', 'B', 'D', 'E', 'F', 'C']
//   console.log("BFS starting from A:", bfs(graph, 'A')); // 应该输出 ['A', 'B', 'C', 'D', 'E', 'F']
  

export const a = "a";