// define([], function () {
//   return 1
// })

// define(function(require, exports, module) {
//   // exports.method = function() {};
//   // 或者
//   module.exports = {val:1};
// });

var compress = function(chars) {
  const n = chars.length;
  let write = 0, left = 0;
  for (let read = 0; read < n; read++) {
      if (read === n - 1 || chars[read] !== chars[read + 1]) {
          chars[write++] = chars[read];
          let num = read - left + 1;
          if (num > 1) {
              String(num).split('').forEach(c=>{
                  chars[write++] = `${c}`
              })
          }
          left = read + 1;
      }
  }
  return write;
};
console.log(compress(["a","a","a","b","b","a","a"]));
