// 动态导入
import('./moduleA.js').then(moduleA => {
    console.log('moduleA loaded:', moduleA);
});

// 同步导入
import { helper } from './utils.js';
helper();
