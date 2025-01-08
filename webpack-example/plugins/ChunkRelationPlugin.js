class ChunkRelationPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("ChunkRelationPlugin", (compilation) => {
      // 在seal阶段结束后观察关系
      compilation.hooks.afterSeal.tap("ChunkRelationPlugin", () => {
        console.log("\n=== Webpack Chunk关系分析 ===\n");

        // 1. 分析ChunkGroups
        console.log("1. ChunkGroups分析:");
        compilation.chunkGroups.forEach((chunkGroup) => {
          console.log(`\nChunkGroup: ${chunkGroup.name || "(unnamed)"}`);
          console.log("├── 包含的Chunks:");
          chunkGroup.chunks.forEach((chunk) => {
            console.log(`│   ├── Chunk: ${chunk.name || chunk.id}`);
          });

          console.log("├── 父ChunkGroup:");
          chunkGroup.getParents().forEach((parent) => {
            console.log(`│   ├── ${parent.name || "(unnamed)"}`);
          });
        });

        // 2. 分析Chunks
        console.log("\n2. Chunks分析:");
        compilation.chunks.forEach((chunk) => {
          console.log(`\nChunk: ${chunk.name || chunk.id}`);
          console.log("├── 包含的Modules:");

          // 使用ChunkGraph获取chunk中的modules
          const chunkGraph = compilation.chunkGraph;
          const modules = chunkGraph.getChunkModules(chunk);

          modules.forEach((module) => {
            console.log(
              `│   ├── Module: ${module.request || module.identifier()}`
            );

            // 显示模块的依赖
            const dependencies = module.dependencies || [];
            if (dependencies.length > 0) {
              console.log("│   │   ├── 依赖:");
              dependencies.forEach((dep) => {
                if (dep.request) {
                  console.log(`│   │   │   ├── ${dep.request}`);
                }
              });
            }
          });

          // 显示chunk的入口模块
          console.log("├── 入口模块:");
          const entryModule = chunkGraph.getChunkEntryModulesIterable(chunk);
          entryModule.length &&
            entryModule?.forEach((module) => {
              console.log(`│   ├── ${module.request || module.identifier()}`);
            });
        });

        // 3. 分析模块间的关系
        console.log("\n3. 模块关系分析:");
        compilation.modules.forEach((module) => {
          console.log(`\n模块: ${module.request || module.identifier()}`);
          // 显示此模块被哪些chunk包含
          const chunkGraph = compilation.chunkGraph;
          const containingChunks = Array.from(
            chunkGraph.getModuleChunks(module)
          );
          if (containingChunks.length > 0) {
            console.log("├── 所属Chunks:");
            containingChunks.forEach((chunk) => {
              console.log(`│   ├── ${chunk.name || chunk.id}`);
            });
          }
        });
      });
    });
  }
}

module.exports = ChunkRelationPlugin;
