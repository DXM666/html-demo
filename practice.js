// 给定一个经过编码的字符串，返回它解码后的字符串。
// 编码规则为: k[encoded_string]，表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。
// 你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。
// 此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 k ，例如不会出现像 3a 或 2[4] 的输入。
/**
 * @param {string} s
 * @return {string}
 */
var decodeString = function (s) {
    let stack = [];
    for (let val of s) {
        if (val === ']') {
            let str = '';
            while (stack.length && stack[stack.length - 1] !== '[') {
                str = stack.pop() + str;
            }
            stack.pop(); // 弹出 '['
            
            let num = '';
            while (stack.length && !isNaN(stack[stack.length - 1])) {
                num = stack.pop() + num;
            }
            
            stack.push(str.repeat(Number(num)));
        } else {
            stack.push(val);
        }
    }
    return stack.join('');
};
console.log(decodeString("2[20[bc]31[xy]]xd4[rt]"));