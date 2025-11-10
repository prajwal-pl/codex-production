"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@repo/db/client");
var prisma_1 = require("@repo/db/generated/prisma");
var problems = [
    {
        slug: "two-sum",
        title: "Two Sum",
        difficulty: prisma_1.Difficulty.EASY,
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        tags: ["array", "hash-table"],
        constraints: "- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
            },
        ],
        hints: [
            "Try using a hash table to store numbers you've seen",
            "For each number, check if target - number exists in the hash table",
        ],
        testCases: [
            { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
            { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
            { input: "3 3\n6", expectedOutput: "0 1", isHidden: true },
        ],
    },
    {
        slug: "reverse-string",
        title: "Reverse String",
        difficulty: prisma_1.Difficulty.EASY,
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        tags: ["two-pointers", "string"],
        constraints: "- 1 <= s.length <= 10^5\n- s[i] is a printable ascii character.",
        examples: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]',
            },
            {
                input: 's = ["H","a","n","n","a","h"]',
                output: '["h","a","n","n","a","H"]',
            },
        ],
        hints: [
            "Use two pointers, one at the start and one at the end",
            "Swap characters and move pointers inward",
        ],
        testCases: [
            { input: "hello", expectedOutput: "olleh", isHidden: false },
            { input: "Hannah", expectedOutput: "hannaH", isHidden: false },
            { input: "a", expectedOutput: "a", isHidden: true },
        ],
    },
    {
        slug: "palindrome-number",
        title: "Palindrome Number",
        difficulty: prisma_1.Difficulty.EASY,
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        tags: ["math"],
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [
            {
                input: "x = 121",
                output: "true",
                explanation: "121 reads as 121 from left to right and from right to left.",
            },
            {
                input: "x = -121",
                output: "false",
                explanation: "From left to right, it reads -121. From right to left, it becomes 121-.",
            },
            {
                input: "x = 10",
                output: "false",
            },
        ],
        hints: [
            "Negative numbers are not palindromes",
            "Try reversing half of the number",
        ],
        testCases: [
            { input: "121", expectedOutput: "true", isHidden: false },
            { input: "-121", expectedOutput: "false", isHidden: false },
            { input: "10", expectedOutput: "false", isHidden: false },
            { input: "12321", expectedOutput: "true", isHidden: true },
        ],
    },
    {
        slug: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: prisma_1.Difficulty.EASY,
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        tags: ["string", "stack"],
        constraints: "- 1 <= s.length <= 10^4\n- s consists of parentheses only '()[]{}'.",
        examples: [
            { input: 's = "()"', output: "true" },
            { input: 's = "()[]{}"', output: "true" },
            { input: 's = "(]"', output: "false" },
        ],
        hints: [
            "Use a stack data structure",
            "Push opening brackets onto the stack",
            "When you see a closing bracket, check if it matches the top of the stack",
        ],
        testCases: [
            { input: "()", expectedOutput: "true", isHidden: false },
            { input: "()[]{}", expectedOutput: "true", isHidden: false },
            { input: "(]", expectedOutput: "false", isHidden: false },
            { input: "([)]", expectedOutput: "false", isHidden: true },
            { input: "{[]}", expectedOutput: "true", isHidden: true },
        ],
    },
    {
        slug: "merge-two-sorted-lists",
        title: "Merge Two Sorted Lists",
        difficulty: prisma_1.Difficulty.EASY,
        description: "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        tags: ["linked-list", "recursion"],
        constraints: "- The number of nodes in both lists is in the range [0, 50].\n- -100 <= Node.val <= 100\n- Both list1 and list2 are sorted in non-decreasing order.",
        examples: [
            {
                input: "list1 = [1,2,4], list2 = [1,3,4]",
                output: "[1,1,2,3,4,4]",
            },
            { input: "list1 = [], list2 = []", output: "[]" },
            { input: "list1 = [], list2 = [0]", output: "[0]" },
        ],
        hints: [
            "Use a dummy node to simplify edge cases",
            "Compare the values at the current positions in both lists",
        ],
        testCases: [
            { input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4", isHidden: false },
            { input: "\n", expectedOutput: "", isHidden: false },
            { input: "\n0", expectedOutput: "0", isHidden: true },
        ],
    },
    {
        slug: "longest-substring-without-repeating",
        title: "Longest Substring Without Repeating Characters",
        difficulty: prisma_1.Difficulty.MEDIUM,
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        tags: ["hash-table", "string", "sliding-window"],
        constraints: "- 0 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces.",
        examples: [
            {
                input: 's = "abcabcbb"',
                output: "3",
                explanation: 'The answer is "abc", with the length of 3.',
            },
            {
                input: 's = "bbbbb"',
                output: "1",
                explanation: 'The answer is "b", with the length of 1.',
            },
            {
                input: 's = "pwwkew"',
                output: "3",
                explanation: 'The answer is "wke", with the length of 3.',
            },
        ],
        hints: [
            "Use a sliding window approach",
            "Keep track of characters you've seen with a hash set or hash map",
            "Move the left pointer when you encounter a duplicate",
        ],
        testCases: [
            { input: "abcabcbb", expectedOutput: "3", isHidden: false },
            { input: "bbbbb", expectedOutput: "1", isHidden: false },
            { input: "pwwkew", expectedOutput: "3", isHidden: false },
            { input: "dvdf", expectedOutput: "3", isHidden: true },
        ],
    },
    {
        slug: "3sum",
        title: "3Sum",
        difficulty: prisma_1.Difficulty.MEDIUM,
        description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        tags: ["array", "two-pointers", "sorting"],
        constraints: "- 3 <= nums.length <= 3000\n- -10^5 <= nums[i] <= 10^5",
        examples: [
            {
                input: "nums = [-1,0,1,2,-1,-4]",
                output: "[[-1,-1,2],[-1,0,1]]",
                explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]. Order doesn't matter.",
            },
            { input: "nums = [0,1,1]", output: "[]" },
            { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
        ],
        hints: [
            "Sort the array first",
            "Use three pointers or fix one element and use two pointers for the rest",
            "Skip duplicates to avoid duplicate triplets",
        ],
        testCases: [
            {
                input: "-1 0 1 2 -1 -4",
                expectedOutput: "-1 -1 2\n-1 0 1",
                isHidden: false,
            },
            { input: "0 1 1", expectedOutput: "", isHidden: false },
            { input: "0 0 0", expectedOutput: "0 0 0", isHidden: true },
        ],
    },
    {
        slug: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: prisma_1.Difficulty.MEDIUM,
        description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
        tags: ["array", "two-pointers", "greedy"],
        constraints: "- n == height.length\n- 2 <= n <= 10^5\n- 0 <= height[i] <= 10^4",
        examples: [
            {
                input: "height = [1,8,6,2,5,4,8,3,7]",
                output: "49",
                explanation: "The vertical lines are at indices 1 and 8, height[1] = 8 and height[8] = 7.",
            },
            { input: "height = [1,1]", output: "1" },
        ],
        hints: [
            "Start with the widest container",
            "Move the pointer pointing to the shorter line inward",
            "The area is limited by the shorter of the two lines",
        ],
        testCases: [
            { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49", isHidden: false },
            { input: "1 1", expectedOutput: "1", isHidden: false },
            { input: "4 3 2 1 4", expectedOutput: "16", isHidden: true },
        ],
    },
    {
        slug: "binary-tree-inorder-traversal",
        title: "Binary Tree Inorder Traversal",
        difficulty: prisma_1.Difficulty.EASY,
        description: "Given the `root` of a binary tree, return the inorder traversal of its nodes' values.",
        tags: ["tree", "depth-first-search", "binary-tree"],
        constraints: "- The number of nodes in the tree is in the range [0, 100].\n- -100 <= Node.val <= 100",
        examples: [
            {
                input: "root = [1,null,2,3]",
                output: "[1,3,2]",
            },
            { input: "root = []", output: "[]" },
            { input: "root = [1]", output: "[1]" },
        ],
        hints: [
            "Inorder traversal: left -> root -> right",
            "Can be solved recursively or iteratively with a stack",
        ],
        testCases: [
            { input: "1 null 2 3", expectedOutput: "1 3 2", isHidden: false },
            { input: "", expectedOutput: "", isHidden: false },
            { input: "1", expectedOutput: "1", isHidden: true },
        ],
    },
    {
        slug: "maximum-subarray",
        title: "Maximum Subarray",
        difficulty: prisma_1.Difficulty.MEDIUM,
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        tags: ["array", "divide-and-conquer", "dynamic-programming"],
        constraints: "- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
        examples: [
            {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
            },
            { input: "nums = [1]", output: "1" },
            { input: "nums = [5,4,-1,7,8]", output: "23" },
        ],
        hints: [
            "Use Kadane's algorithm",
            "Keep track of the maximum sum ending at the current position",
            "Update the global maximum as you go",
        ],
        testCases: [
            {
                input: "-2 1 -3 4 -1 2 1 -5 4",
                expectedOutput: "6",
                isHidden: false,
            },
            { input: "1", expectedOutput: "1", isHidden: false },
            { input: "5 4 -1 7 8", expectedOutput: "23", isHidden: true },
        ],
    },
    {
        slug: "median-of-two-sorted-arrays",
        title: "Median of Two Sorted Arrays",
        difficulty: prisma_1.Difficulty.HARD,
        description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        tags: ["array", "binary-search", "divide-and-conquer"],
        constraints: "- nums1.length == m\n- nums2.length == n\n- 0 <= m <= 1000\n- 0 <= n <= 1000\n- 1 <= m + n <= 2000\n- -10^6 <= nums1[i], nums2[i] <= 10^6",
        examples: [
            {
                input: "nums1 = [1,3], nums2 = [2]",
                output: "2.00000",
                explanation: "merged array = [1,2,3] and median is 2.",
            },
            {
                input: "nums1 = [1,2], nums2 = [3,4]",
                output: "2.50000",
                explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
            },
        ],
        hints: [
            "Use binary search on the smaller array",
            "Partition both arrays such that left half has same number of elements as right half",
            "Ensure all elements in left half are smaller than right half",
        ],
        testCases: [
            { input: "1 3\n2", expectedOutput: "2.0", isHidden: false },
            { input: "1 2\n3 4", expectedOutput: "2.5", isHidden: false },
            { input: "1 2 3 4 5\n6 7 8", expectedOutput: "4.5", isHidden: true },
        ],
    },
    {
        slug: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: prisma_1.Difficulty.HARD,
        description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
        tags: ["array", "two-pointers", "dynamic-programming", "stack"],
        constraints: "- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5",
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
            },
            { input: "height = [4,2,0,3,2,5]", output: "9" },
        ],
        hints: [
            "For each position, water level is determined by min(max_left, max_right)",
            "Use two pointers approach",
            "Keep track of maximum height seen from left and right",
        ],
        testCases: [
            {
                input: "0 1 0 2 1 0 1 3 2 1 2 1",
                expectedOutput: "6",
                isHidden: false,
            },
            { input: "4 2 0 3 2 5", expectedOutput: "9", isHidden: false },
            { input: "4 2 3", expectedOutput: "1", isHidden: true },
        ],
    },
];
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, problems_1, problemData, testCases, problem, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Starting database seed...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, 10, 12]);
                    // Clear existing DSA data
                    console.log("Clearing existing DSA data...");
                    return [4 /*yield*/, client_1.default.dSASubmission.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, client_1.default.dSATestCase.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, client_1.default.dSAProblem.deleteMany()];
                case 4:
                    _a.sent();
                    console.log("Creating DSA problems...");
                    _i = 0, problems_1 = problems;
                    _a.label = 5;
                case 5:
                    if (!(_i < problems_1.length)) return [3 /*break*/, 8];
                    problemData = problems_1[_i];
                    testCases = problemData.testCases, problem = __rest(problemData, ["testCases"]);
                    return [4 /*yield*/, client_1.default.dSAProblem.create({
                            data: __assign(__assign({}, problem), { testCases: {
                                    create: testCases.map(function (tc) { return ({
                                        input: tc.input,
                                        expectedOutput: tc.expectedOutput,
                                        isHidden: tc.isHidden,
                                    }); }),
                                } }),
                        })];
                case 6:
                    _a.sent();
                    console.log("  \u2713 Created: ".concat(problem.title));
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("\n✅ Seed completed successfully!");
                    console.log("\uD83D\uDCCA Created ".concat(problems.length, " problems"));
                    console.log("   - ".concat(problems.filter(function (p) { return p.difficulty === prisma_1.Difficulty.EASY; }).length, " EASY"));
                    console.log("   - ".concat(problems.filter(function (p) { return p.difficulty === prisma_1.Difficulty.MEDIUM; }).length, " MEDIUM"));
                    console.log("   - ".concat(problems.filter(function (p) { return p.difficulty === prisma_1.Difficulty.HARD; }).length, " HARD"));
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _a.sent();
                    console.error("❌ Seed failed:", error_1);
                    throw error_1;
                case 10: return [4 /*yield*/, client_1.default.$disconnect()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
seed()
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
