// define(["c"], function (c) {
//   return 2 + c;
// });

define(function (require, exports, module) {
  var dep1 = require("./c");
  console.log(dep1)
  module.exports = { val: 2 + dep1.val };
});
