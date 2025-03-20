/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
    let len = nums.length;
    let ans = len + 1;

    let left = 0;

    let sum = 0;
    for (let right = 0; right < len; right++) {
        sum += nums[right];
        while (sum >= target) {
            ans = Math.min(ans, right - left + 1);
            sum -= nums[left++];
        }
    }
    return ans == len + 1 ? 0 : ans;
};

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]))