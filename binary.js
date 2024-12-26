// 定义二叉树节点
class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// 将数组转换为二叉树
function arrayToBinaryTree(nums) {
    if (!nums || nums.length === 0) return null;

    let root = new TreeNode(nums[0]);
    let queue = [root];
    let i = 1;

    while (queue.length > 0 && i < nums.length) {
        let node = queue.shift();

        // 创建左子节点
        if (nums[i] !== null) {
            node.left = new TreeNode(nums[i]);
            queue.push(node.left);
        }
        i++;

        // 创建右子节点
        if (i < nums.length && nums[i] !== null) {
            node.right = new TreeNode(nums[i]);
            queue.push(node.right);
        }
        i++;
    }

    return root;
}

// 使用示例
let nums = [3,9,20,null,null,15,7];
let binaryTree = arrayToBinaryTree(nums);

var zigzagLevelOrder = function (root) {
    if (root == null) return [];
    let dirL2R = false;
    let res = [];
    let queue = [root];
    while (queue.length) {
        let size = queue.length;
        let list = [];
        while (size) {
            let node = queue.pop();
            if (dirL2R) {
                list.push(node.val);
            } else {
                list.unshift(node.val);
            }
            if (node.left) {
                queue.push(node.left);
            }
            if (node.right) {
                queue.push(node.right);
            }
            size--;
        }
        res.push([...list]);
        dirL2R = !dirL2R;
    }
    return res;
};
console.log(zigzagLevelOrder(binaryTree))