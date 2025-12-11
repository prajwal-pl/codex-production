import prisma from "@repo/db/client";
import { Difficulty } from "@repo/db/generated/prisma";

// ==========================================
// COMMUNITY SEED DATA - USERS, POSTS, COMMENTS
// ==========================================

const communityUsers = [
    {
        id: "seed-user-1",
        name: "Alex Chen",
        email: "alex.chen@example.com",
        passwordHash: "$2a$10$hashedpasswordplaceholder1", // placeholder
    },
    {
        id: "seed-user-2",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        passwordHash: "$2a$10$hashedpasswordplaceholder2",
    },
    {
        id: "seed-user-3",
        name: "Marcus Williams",
        email: "marcus.w@example.com",
        passwordHash: "$2a$10$hashedpasswordplaceholder3",
    },
    {
        id: "seed-user-4",
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        passwordHash: "$2a$10$hashedpasswordplaceholder4",
    },
    {
        id: "seed-user-5",
        name: "James Rodriguez",
        email: "james.r@example.com",
        passwordHash: "$2a$10$hashedpasswordplaceholder5",
    },
];

const communityPosts = [
    {
        title: "🚀 Just deployed my first AI-powered app using Codex!",
        content: `After weeks of learning and experimenting, I finally deployed my first project using Codex. The AI code generation feature is absolutely incredible - it understood my requirements and generated clean, production-ready code.

The sandbox environment made testing so much easier. I could iterate quickly without worrying about breaking my local setup.

Key takeaways:
• Start with clear prompts - the more specific, the better results
• Use the conversation feature to refine outputs
• Don't be afraid to ask for code explanations

Has anyone else built something cool with Codex recently? Would love to see what you're working on!`,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
        authorId: "seed-user-1",
        comments: [
            {
                content: "Congrats! 🎉 What kind of app did you build? I'm thinking of starting a similar project.",
                authorId: "seed-user-2",
            },
            {
                content: "The AI code generation really is a game changer. Saved me hours of boilerplate code!",
                authorId: "seed-user-3",
            },
            {
                content: "Welcome to the club! The sandbox feature is my favorite part too.",
                authorId: "seed-user-4",
            },
        ],
    },
    {
        title: "Best practices for structuring React components in 2025",
        content: `I've been refactoring a large React codebase and wanted to share some patterns that have worked well for our team:

**1. Colocation over separation**
Keep related files together. Instead of having separate folders for components, hooks, and styles, group them by feature.

**2. Prefer composition over configuration**
Instead of passing dozens of props, use compound components pattern:
\`\`\`jsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
\`\`\`

**3. Custom hooks for logic extraction**
Move business logic to custom hooks. Keep components focused on rendering.

**4. TypeScript is non-negotiable**
The type safety alone is worth the initial learning curve. Your future self will thank you.

What patterns do you follow? Always looking to learn from the community!`,
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        authorId: "seed-user-2",
        comments: [
            {
                content: "Great tips! The colocation pattern has been a game changer for our team. So much easier to find related code.",
                authorId: "seed-user-1",
            },
            {
                content: "I'd add: use server components where possible. The performance gains are significant.",
                authorId: "seed-user-5",
            },
        ],
    },
    {
        title: "How I solved the infamous 'Two Sum' problem in 3 different ways",
        content: `Just completed the Two Sum challenge on the practice section and wanted to share my journey:

**Approach 1: Brute Force O(n²)**
Nested loops comparing every pair. Works but not efficient.

**Approach 2: Two-Pass Hash Map O(n)**
First pass: build a map of values to indices
Second pass: look for complement in the map

**Approach 3: One-Pass Hash Map O(n)** ⭐
As we iterate, check if complement exists, then add current to map. Most elegant solution!

The practice environment here is fantastic - instant feedback and great test cases. Highly recommend for DSA prep!`,
        imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
        authorId: "seed-user-3",
        comments: [
            {
                content: "The one-pass solution is so clean! I was stuck on the two-pass approach for a while.",
                authorId: "seed-user-4",
            },
            {
                content: "Pro tip: In interviews, always mention the brute force first, then optimize. Shows your thought process!",
                authorId: "seed-user-1",
            },
            {
                content: "Thanks for sharing! Just solved it using your approach 3. 🙌",
                authorId: "seed-user-2",
            },
            {
                content: "The hash map insight is key for so many problems. Good explanation!",
                authorId: "seed-user-5",
            },
        ],
    },
    {
        title: "Building a real-time collaborative editor - my weekend project",
        content: `Spent the weekend building a collaborative code editor using WebSockets and CRDTs. Here's what I learned:

**Tech Stack:**
- Frontend: Next.js + Monaco Editor
- Backend: Node.js + Socket.io
- State sync: Yjs (CRDT library)

**Challenges faced:**
1. Cursor position syncing across clients
2. Handling simultaneous edits without conflicts
3. Reconnection logic and state recovery

**Key insight:** CRDTs are magic for collaborative editing. Instead of operational transforms, they provide eventual consistency with less complexity.

The AI assistant helped me understand the CRDT concepts and generate the initial boilerplate. Saved hours of reading documentation!

Would anyone be interested in a detailed tutorial?`,
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
        authorId: "seed-user-4",
        comments: [
            {
                content: "Yes please! Would love a detailed tutorial on this. Been wanting to build something similar.",
                authorId: "seed-user-3",
            },
            {
                content: "Yjs is incredible. Have you tried their prosemirror bindings? Works great for rich text too.",
                authorId: "seed-user-2",
            },
        ],
    },
    {
        title: "From bootcamp to first dev job - my 6 month journey",
        content: `6 months ago I was working in retail with zero coding experience. Today I accepted my first junior developer position! Here's my honest journey:

**Month 1-2: Foundations**
- HTML, CSS, JavaScript basics
- Lots of confusion and frustration (totally normal!)

**Month 3-4: Building**
- React fundamentals
- Built 5+ projects for portfolio
- Started using Codex for learning and practice

**Month 5-6: Job hunting**
- Applied to 100+ positions
- Got 8 interviews, 2 offers
- The DSA practice on this platform was crucial!

**Tips for others:**
1. Don't skip the fundamentals
2. Build projects you're passionate about
3. Practice DSA regularly (even 30 mins/day helps)
4. Network on LinkedIn and Twitter
5. Don't compare your journey to others

Happy to answer questions. You've got this! 💪`,
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
        authorId: "seed-user-5",
        comments: [
            {
                content: "This is so inspiring! I'm in month 3 right now and feeling discouraged. This gives me hope!",
                authorId: "seed-user-3",
            },
            {
                content: "Congratulations! 🎉 The grind is real but totally worth it. Welcome to the dev community!",
                authorId: "seed-user-1",
            },
            {
                content: "100 applications is no joke. Your persistence paid off. Good luck in your new role!",
                authorId: "seed-user-2",
            },
            {
                content: "Thanks for sharing your story. Did you do any system design prep for interviews?",
                authorId: "seed-user-4",
            },
        ],
    },
    {
        title: "Understanding async/await: A visual guide",
        content: `After struggling with Promises and async/await for months, I finally had my "aha!" moment. Let me share:

**Think of it like a restaurant:**
- \`async\` function = A waiter taking orders
- \`await\` = "Hold on, let me get that from the kitchen"
- The restaurant doesn't stop while one waiter waits

**Common mistakes I made:**
\`\`\`javascript
// ❌ Wrong - sequential execution
const data1 = await fetch('/api/1');
const data2 = await fetch('/api/2');

// ✅ Right - parallel execution
const [data1, data2] = await Promise.all([
  fetch('/api/1'),
  fetch('/api/2')
]);
\`\`\`

**Error handling:**
Always use try/catch with async/await. Unhandled promise rejections can crash your app!

What async patterns trip you up the most?`,
        imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop",
        authorId: "seed-user-1",
        comments: [
            {
                content: "The restaurant analogy is perfect! Finally makes sense to me now.",
                authorId: "seed-user-5",
            },
            {
                content: "Promise.all was a revelation for me too. So much faster than sequential awaits!",
                authorId: "seed-user-4",
            },
        ],
    },
    {
        title: "My VS Code setup for maximum productivity",
        content: `After years of tweaking, here's my VS Code setup that I use daily:

**Essential Extensions:**
• GitHub Copilot - AI pair programming
• Prettier - Code formatting
• ESLint - Linting
• GitLens - Git superpowers
• Thunder Client - API testing

**Keyboard shortcuts I can't live without:**
- \`Cmd/Ctrl + P\` - Quick file open
- \`Cmd/Ctrl + Shift + P\` - Command palette
- \`Cmd/Ctrl + D\` - Multi-cursor selection
- \`Alt + Up/Down\` - Move lines

**Settings I recommend:**
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
\`\`\`

**Theme:** Tokyo Night (easy on the eyes for long sessions)

What's your must-have extension?`,
        imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
        authorId: "seed-user-2",
        comments: [
            {
                content: "Error Lens is my must-have! Shows errors inline without hovering. Game changer.",
                authorId: "seed-user-1",
            },
            {
                content: "Tokyo Night is beautiful! I use Catppuccin which is similar vibes.",
                authorId: "seed-user-3",
            },
            {
                content: "Auto Rename Tag for HTML/JSX. Saves so much time with paired tags!",
                authorId: "seed-user-5",
            },
        ],
    },
    {
        title: "Docker for beginners: What I wish I knew earlier",
        content: `Docker confused me for the longest time. Here's the ELI5 version I wish I had:

**What is Docker?**
Think of it as a shipping container for your code. Contains everything needed to run your app, works the same everywhere.

**Key concepts:**
- **Image**: A blueprint/recipe (like a class)
- **Container**: A running instance (like an object)
- **Dockerfile**: Instructions to build an image
- **docker-compose**: Run multiple containers together

**Basic commands:**
\`\`\`bash
docker build -t myapp .        # Build image
docker run -p 3000:3000 myapp  # Run container
docker ps                       # List running containers
docker logs <container_id>      # View logs
\`\`\`

**Pro tip:** Start with docker-compose for local development. It handles networking between services automatically.

The "it works on my machine" problem is now solved! 🐳`,
        imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop",
        authorId: "seed-user-3",
        comments: [
            {
                content: "The shipping container analogy finally made it click for me. Thanks!",
                authorId: "seed-user-4",
            },
            {
                content: "Don't forget docker volume for persistent data! Learned that the hard way 😅",
                authorId: "seed-user-2",
            },
        ],
    },
    {
        title: "Why I switched from REST to GraphQL (and when I wouldn't)",
        content: `After 2 years with GraphQL in production, here are my honest thoughts:

**When GraphQL shines:**
✅ Multiple frontend clients (web, mobile, etc.)
✅ Complex data relationships
✅ Avoiding over-fetching/under-fetching
✅ Strong typing with generated types

**When REST is better:**
✅ Simple CRUD operations
✅ Caching requirements (HTTP caching is simpler)
✅ File uploads
✅ Smaller team without GraphQL experience

**Gotchas I learned:**
1. N+1 query problem is REAL - use DataLoader
2. Error handling is different - check the errors array
3. Caching needs more thought
4. Monitoring/logging requires extra setup

**My recommendation:** Start with REST. Switch to GraphQL when you feel the pain points it solves.

What's your API architecture preference?`,
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
        authorId: "seed-user-4",
        comments: [
            {
                content: "tRPC is another great option if you're using TypeScript end-to-end!",
                authorId: "seed-user-1",
            },
            {
                content: "The N+1 problem bit me hard in production. DataLoader is essential.",
                authorId: "seed-user-3",
            },
            {
                content: "Agreed on starting with REST. GraphQL has a learning curve that's not always worth it for small projects.",
                authorId: "seed-user-5",
            },
        ],
    },
    {
        title: "Completed 30 days of DSA - here's what improved",
        content: `Just finished my 30-day DSA challenge using the practice section here. Results:

**Before:**
- LeetCode easy: 50% success rate
- Time to solve: 45+ minutes
- Gave up on medium problems

**After:**
- LeetCode easy: 90%+ success rate
- Time to solve: 15-20 minutes
- Can solve ~60% of medium problems

**What worked:**
1. Consistency over intensity (1-2 problems/day)
2. Understanding patterns, not memorizing solutions
3. Reviewing mistakes the next day
4. Explaining solutions out loud (rubber duck debugging!)

**Key patterns I learned:**
- Two pointers
- Sliding window
- Hash maps for O(1) lookup
- BFS/DFS for trees/graphs

**Next goal:** Tackle hard problems and system design!

Who else is on their DSA journey?`,
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
        authorId: "seed-user-5",
        comments: [
            {
                content: "30 days is impressive! I'm on day 12 and already seeing improvement.",
                authorId: "seed-user-2",
            },
            {
                content: "The patterns approach is so much better than grinding random problems. Smart!",
                authorId: "seed-user-1",
            },
            {
                content: "Mind sharing your study schedule? I keep falling off track.",
                authorId: "seed-user-4",
            },
        ],
    },
];

// ==========================================
// DSA PROBLEMS SEED DATA
// ==========================================

const problems = [
    {
        slug: "two-sum",
        title: "Two Sum",
        difficulty: Difficulty.EASY,
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        tags: ["array", "hash-table"],
        constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
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
        difficulty: Difficulty.EASY,
        description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.`,
        tags: ["two-pointers", "string"],
        constraints: `- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.`,
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
        difficulty: Difficulty.EASY,
        description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.`,
        tags: ["math"],
        constraints: `-2^31 <= x <= 2^31 - 1`,
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
        difficulty: Difficulty.EASY,
        description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        tags: ["string", "stack"],
        constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
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
        difficulty: Difficulty.EASY,
        description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
        tags: ["linked-list", "recursion"],
        constraints: `- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.`,
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
        difficulty: Difficulty.MEDIUM,
        description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
        tags: ["hash-table", "string", "sliding-window"],
        constraints: `- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
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
        difficulty: Difficulty.MEDIUM,
        description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
        tags: ["array", "two-pointers", "sorting"],
        constraints: `- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5`,
        examples: [
            {
                input: "nums = [-1,0,1,2,-1,-4]",
                output: "[[-1,-1,2],[-1,0,1]]",
                explanation:
                    "The distinct triplets are [-1,0,1] and [-1,-1,2]. Order doesn't matter.",
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
        difficulty: Difficulty.MEDIUM,
        description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
        tags: ["array", "two-pointers", "greedy"],
        constraints: `- n == height.length
- 2 <= n <= 10^5
- 0 <= height[i] <= 10^4`,
        examples: [
            {
                input: "height = [1,8,6,2,5,4,8,3,7]",
                output: "49",
                explanation:
                    "The vertical lines are at indices 1 and 8, height[1] = 8 and height[8] = 7.",
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
        difficulty: Difficulty.EASY,
        description: `Given the \`root\` of a binary tree, return the inorder traversal of its nodes' values.`,
        tags: ["tree", "depth-first-search", "binary-tree"],
        constraints: `- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100`,
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
        difficulty: Difficulty.MEDIUM,
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
        tags: ["array", "divide-and-conquer", "dynamic-programming"],
        constraints: `- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
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
        difficulty: Difficulty.HARD,
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
        tags: ["array", "binary-search", "divide-and-conquer"],
        constraints: `- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -10^6 <= nums1[i], nums2[i] <= 10^6`,
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
        difficulty: Difficulty.HARD,
        description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
        tags: ["array", "two-pointers", "dynamic-programming", "stack"],
        constraints: `- n == height.length
- 1 <= n <= 2 * 10^4
- 0 <= height[i] <= 10^5`,
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation:
                    "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
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

async function seed() {
    console.log("🌱 Starting database seed...");

    try {
        // ==========================================
        // SEED COMMUNITY DATA
        // ==========================================
        console.log("\n📝 Seeding community data...");

        // Clear existing community data (comments first due to foreign keys)
        console.log("  Clearing existing community data...");
        await prisma.comment.deleteMany();
        await prisma.post.deleteMany();

        // Upsert seed users (won't affect real users)
        console.log("  Creating/updating seed users...");
        for (const user of communityUsers) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: { name: user.name },
                create: user,
            });
        }
        console.log(`  ✓ ${communityUsers.length} seed users ready`);

        // Create posts with comments
        console.log("  Creating posts and comments...");
        let totalComments = 0;
        for (const postData of communityPosts) {
            const { comments, ...post } = postData;

            const createdPost = await prisma.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    imageUrl: post.imageUrl,
                    authorId: post.authorId,
                    comments: {
                        create: comments.map((comment) => ({
                            content: comment.content,
                            authorId: comment.authorId,
                        })),
                    },
                },
            });

            totalComments += comments.length;
            console.log(`  ✓ Created: "${post.title.slice(0, 40)}..." with ${comments.length} comments`);
        }

        console.log(`\n✅ Community seed completed!`);
        console.log(`   📄 ${communityPosts.length} posts created`);
        console.log(`   💬 ${totalComments} comments created`);

        // ==========================================
        // SEED DSA PROBLEMS
        // ==========================================
        console.log("\n🧩 Seeding DSA problems...");

        // Clear existing DSA data
        console.log("  Clearing existing DSA data...");
        await prisma.dSASubmission.deleteMany();
        await prisma.dSATestCase.deleteMany();
        await prisma.dSAProblem.deleteMany();

        console.log("  Creating DSA problems...");
        for (const problemData of problems) {
            const { testCases, ...problem } = problemData;

            await prisma.dSAProblem.create({
                data: {
                    ...problem,
                    testCases: {
                        create: testCases.map((tc) => ({
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            isHidden: tc.isHidden,
                        })),
                    },
                },
            });

            console.log(`  ✓ Created: ${problem.title}`);
        }

        console.log("\n✅ DSA seed completed!");
        console.log(`📊 Created ${problems.length} problems`);
        console.log(
            `   - ${problems.filter((p) => p.difficulty === Difficulty.EASY).length} EASY`
        );
        console.log(
            `   - ${problems.filter((p) => p.difficulty === Difficulty.MEDIUM).length} MEDIUM`
        );
        console.log(
            `   - ${problems.filter((p) => p.difficulty === Difficulty.HARD).length} HARD`
        );

        console.log("\n🎉 All seeds completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
