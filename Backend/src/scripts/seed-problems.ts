import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem";

dotenv.config();

const sampleProblem = {
    id: "CS_ARRAY_003",
    title: "Three Numbers With Zero Sum",
    slug: "three-numbers-with-zero-sum",
    difficulty: "Medium" as const,
    pattern: "Two Pointer + Sorting",
    topic: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Microsoft", "Google", "Adobe"],
    statement: "You are given an integer array nums of size N. Your task is to find all unique triplets (i, j, k) such that i != j, j != k, i != k and nums[i] + nums[j] + nums[k] = 0. The solution must not contain duplicate triplets.",
    input_format: "The first line contains an integer N representing the size of the array. The second line contains N space-separated integers representing the elements of the array.",
    output_format: "Return all unique triplets such that their sum is equal to zero. Each triplet should be in non-decreasing order.",
    constraints: [
        "3 ≤ N ≤ 10^4",
        "-10^5 ≤ nums[i] ≤ 10^5"
    ],
    sample_input: "6\n-1 0 1 2 -1 -4",
    sample_output: "[[-1, -1, 2], [-1, 0, 1]]",
    explanation: "The triplets [-1, -1, 2] and [-1, 0, 1] have a sum of zero. No other unique triplet exists.",
    approach: [
        "Sort the array",
        "Fix one element and use two pointers for the remaining part",
        "Skip duplicate elements to avoid repeated triplets"
    ],
    time_complexity: "O(N^2)",
    space_complexity: "O(1) (excluding output storage)",
    tags: ["three-sum", "company-oa", "interview"],
    test_cases: [
        {
            input: "3\n0 0 0",
            output: "[[0, 0, 0]]",
            isHidden: false
        },
        {
            input: "4\n1 2 -2 -1",
            output: "[]",
            isHidden: false
        },
        {
            input: "5\n-2 0 1 1 2",
            output: "[[-2, 0, 2], [-2, 1, 1]]",
            isHidden: false
        }
    ],
    hidden_test_cases: [
        {
            input: "6\n-1 0 1 2 -1 -4",
            output: "[[-1,-1,2],[-1,0,1]]",
            description: "Standard case with multiple valid triplets",
            points: 10
        },
        {
            input: "7\n-1 0 1 2 -1 -4 -2",
            output: "[[-2,0,2],[-1,-1,2],[-1,0,1]]",
            description: "Larger input with more valid combinations",
            points: 15
        },
        {
            input: "5\n0 0 0 0 0",
            output: "[[0,0,0]]",
            description: "All zeros",
            points: 10
        },
        {
            input: "16\n-4 -2 1 -5 -4 -4 4 -2 0 4 0 -2 3 1 -5 0",
            output: "[[-5,1,4],[-4,0,4],[-4,1,3],[-2,-2,4],[-2,1,1],[0,0,0]]",
            description: "Larger input with negative and positive numbers",
            points: 15
        },
        {
            input: "6\n3 0 -2 -1 1 2",
            output: "[[-2,-1,3],[-2,0,2],[-1,0,1]]",
            description: "Mix of positive and negative numbers",
            points: 10
        },
        {
            input: "8\n-1 0 1 2 -1 -4 2 2",
            output: "[[-4,2,2],[-1,-1,2],[-1,0,1]]",
            description: "Input with duplicate numbers",
            points: 10
        },
        {
            input: "6\n1 2 -2 -1 0 0",
            output: "[[-2,0,2],[-1,0,1]]",
            description: "Input with multiple zeros",
            points: 10
        },
        {
            input: "7\n-1 0 1 2 -1 -4 4",
            output: "[[-4,0,4],[-1,-1,2],[-1,0,1]]",
            description: "Input with a valid triplet using the largest number",
            points: 10
        },
        {
            input: "9\n-1 0 1 2 -1 -4 3 -3 0",
            output: "[[-4,1,3],[-3,0,3],[-3,1,2],[-1,-1,2],[-1,0,1]]",
            description: "Larger input with multiple valid triplets",
            points: 15
        },
        {
            input: "5\n1 2 3 4 5",
            output: "[]",
            description: "No valid triplets",
            points: 5
        }
    ],
    judge_type: "multiple-output",
    notes: "Triplets should be unique. Order of triplets does not matter.",
    source: "Company OA Inspired"
};

const sampleProblems = [
    // Existing problem
    {
        id: "CS_ARRAY_003",
        title: "Three Numbers With Zero Sum",
        slug: "three-numbers-with-zero-sum",
        difficulty: "Medium" as const,
        pattern: "Two Pointer + Sorting",
        topic: ["Array", "Two Pointers", "Sorting"],
        companies: ["Amazon", "Microsoft", "Google", "Adobe"],
        statement: "You are given an integer array nums of size N. Your task is to find all unique triplets (i, j, k) such that i != j, j != k, i != k and nums[i] + nums[j] + nums[k] = 0. The solution must not contain duplicate triplets.",
        input_format: "The first line contains an integer N representing the size of the array. The second line contains N space-separated integers representing the elements of the array.",
        output_format: "Return all unique triplets such that their sum is equal to zero. Each triplet should be in non-decreasing order.",
        constraints: [
            "3 ≤ N ≤ 10^4",
            "-10^5 ≤ nums[i] ≤ 10^5"
        ],
        sample_input: "6\n-1 0 1 2 -1 -4",
        sample_output: "[[-1, -1, 2], [-1, 0, 1]]",
        explanation: "The triplets [-1, -1, 2] and [-1, 0, 1] have a sum of zero. No other unique triplet exists.",
        approach: [
            "Sort the array",
            "Fix one element and use two pointers for the remaining part",
            "Skip duplicate elements to avoid repeated triplets"
        ],
        time_complexity: "O(N^2)",
        space_complexity: "O(1) (excluding output storage)",
        tags: ["three-sum", "company-oa", "interview"],
        test_cases: [
            {
                input: "3\n0 0 0",
                output: "[[0, 0, 0]]",
                isHidden: false
            },
            {
                input: "4\n1 2 -2 -1",
                output: "[]",
                isHidden: false
            },
            {
                input: "5\n-2 0 1 1 2",
                output: "[[-2, 0, 2], [-2, 1, 1]]",
                isHidden: false
            }
        ],
        hidden_test_cases: [
            {
                input: "6\n-1 0 1 2 -1 -4",
                output: "[[-1,-1,2],[-1,0,1]]",
                description: "Standard case with multiple valid triplets",
                points: 10
            },
            {
                input: "7\n-1 0 1 2 -1 -4 -2",
                output: "[[-2,0,2],[-1,-1,2],[-1,0,1]]",
                description: "Larger input with more valid combinations",
                points: 15
            },
            {
                input: "5\n0 0 0 0 0",
                output: "[[0,0,0]]",
                description: "All zeros",
                points: 10
            },
            {
                input: "16\n-4 -2 1 -5 -4 -4 4 -2 0 4 0 -2 3 1 -5 0",
                output: "[[-5,1,4],[-4,0,4],[-4,1,3],[-2,-2,4],[-2,1,1],[0,0,0]]",
                description: "Larger input with negative and positive numbers",
                points: 15
            },
            {
                input: "6\n3 0 -2 -1 1 2",
                output: "[[-2,-1,3],[-2,0,2],[-1,0,1]]",
                description: "Mix of positive and negative numbers",
                points: 10
            },
            {
                input: "8\n-1 0 1 2 -1 -4 2 2",
                output: "[[-4,2,2],[-1,-1,2],[-1,0,1]]",
                description: "Input with duplicate numbers",
                points: 10
            },
            {
                input: "6\n1 2 -2 -1 0 0",
                output: "[[-2,0,2],[-1,0,1]]",
                description: "Input with multiple zeros",
                points: 10
            },
            {
                input: "7\n-1 0 1 2 -1 -4 4",
                output: "[[-4,0,4],[-1,-1,2],[-1,0,1]]",
                description: "Input with a valid triplet using the largest number",
                points: 10
            },
            {
                input: "9\n-1 0 1 2 -1 -4 3 -3 0",
                output: "[[-4,1,3],[-3,0,3],[-3,1,2],[-1,-1,2],[-1,0,1]]",
                description: "Larger input with multiple valid triplets",
                points: 15
            },
            {
                input: "5\n1 2 3 4 5",
                output: "[]",
                description: "No valid triplets",
                points: 5
            }
        ],
        judge_type: "multiple-output",
        notes: "Triplets should be unique. Order of triplets does not matter.",
        source: "Company OA Inspired",
        starterCode: {
            java: "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> solve(int[] input) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}",
            python: "from typing import List\n\ndef solve(nums: List[int]) -> List[List[int]]:\n    # Your code here\n    return []",
            cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> solve(vector<int>& nums) {\n        // Your code here\n        return {};\n    }\n};"
        }
    },
    // New problem 1
    {
        id: "CS_ARRAY_004",
        title: "Subarray With Given Sum",
        slug: "subarray-with-given-sum",
        difficulty: "Medium" as const,
        pattern: "Sliding Window",
        topic: ["Array", "Sliding Window"],
        companies: ["Amazon", "Flipkart", "Google"],
        statement: "Find all contiguous subarrays with a given sum.",
        input_format: "First line N, second line array, third line target",
        output_format: "Return all valid subarrays",
        constraints: ["1 ≤ N ≤ 10^5"],
        sample_input: "5\n1 2 3 4 5\n5",
        sample_output: "[[2,3],[5]]",
        explanation: "The subarrays [2,3] and [5] have a sum of 5. These are all the contiguous subarrays that sum to the target value.",
        time_complexity: "O(N)",
        space_complexity: "O(1)",
        judge_type: "multiple-output",
        starterCode: {
            java: "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> solve(int[] arr, int target) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}",
            python: "from typing import List\n\ndef solve(arr: List[int], target: int) -> List[List[int]]:\n    # Your code here\n    return []",
            cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> solve(vector<int>& arr, int target) {\n        // Your code here\n        return {};\n    }\n};"
        },
        test_cases: [
            { "input": "3\n1 1 1\n2", "output": "[[1,1]]", "isHidden": false }
        ],
        hidden_test_cases: [
            { "input": "5\n0 0 0 0 0\n0", "output": "[[0],[0,0],[0,0,0]]", "points": 10 },
            { "input": "6\n1 -1 2 -2\n0", "output": "[[1,-1],[2,-2]]", "points": 15 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // New problem 2
    {
        id: "CS_ARRAY_005",
        title: "Pair With Given Difference",
        slug: "pair-with-given-difference",
        difficulty: "Easy" as const,
        pattern: "Sorting + Two Pointers",
        topic: ["Array", "Two Pointers"],
        companies: ["Microsoft", "Adobe"],
        statement: "Find all unique pairs with absolute difference K.",
        input_format: "First line N, second line array, third line K",
        output_format: "Return all unique pairs",
        constraints: ["1 ≤ N ≤ 10^5"],
        sample_input: "5\n1 5 3 4 2\n2",
        sample_output: "[[1,3],[2,4],[3,5]]",
        explanation: "The pairs [1,3], [2,4], and [3,5] all have an absolute difference of 2. These are all unique pairs in the array with this difference.",
        time_complexity: "O(N log N)",
        space_complexity: "O(1)",
        judge_type: "multiple-output",
        starterCode: {
            java: "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> solve(int[] arr, int k) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}",
            python: "from typing import List\n\ndef solve(arr: List[int], k: int) -> List[List[int]]:\n    # Your code here\n    return []",
            cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> solve(vector<int>& arr, int k) {\n        // Your code here\n        return {};\n    }\n};"
        },
        test_cases: [
            { "input": "4\n1 1 1 1\n0", "output": "[[1,1]]", "isHidden": false }
        ],
        hidden_test_cases: [
            { "input": "7\n1 2 2 3 3 4 4\n1", "output": "[[1,2],[2,3],[3,4]]", "points": 15 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function seedProblems() {
    try {
        console.log("🚀 Starting database seeding...");

        // Get MongoDB URI from environment or use default
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CodePrep";
        console.log(`🔗 Attempting to connect to MongoDB at: ${mongoUri}`);

        // Connect to MongoDB with options
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });

        console.log("✅ Successfully connected to MongoDB");

        // Check if the collection exists and show current count
        const countBefore = await Problem.countDocuments({});
        console.log(`📊 Current number of problems in database: ${countBefore}`);

        // Clear existing problems
        console.log("🧹 Clearing existing problems...");
        const deleteResult = await Problem.deleteMany({});
        console.log(`✓ Deleted ${deleteResult.deletedCount} existing problems`);

        // Insert all problems
        console.log("📝 Inserting problems...");
        const insertedProblems = await Problem.insertMany(sampleProblems);
        console.log(`✅ Successfully inserted ${insertedProblems.length} problems`);

        // Log each inserted problem
        insertedProblems.forEach((problem, index) => {
            console.log(`  ${index + 1}. ${problem.title} (ID: ${problem._id})`);
        });

        console.log("\n✨ Seeding completed successfully!");

    } catch (error) {
        console.error("\n❌ Error during database seeding:");
        console.error(error);

        if (error instanceof Error) {
            console.error("\nError details:");
            console.error(`- Name: ${error.name}`);
            console.error(`- Message: ${error.message}`);

            if ('code' in error) {
                console.error(`- Code: ${error.code}`);
            }
        }

        process.exit(1);
    } finally {
        try {
            await mongoose.connection.close();
            console.log("🔌 Database connection closed");
        } catch (err) {
            console.error("Error closing connection:", err);
        }
    }
}

// Run the seed function
seedProblems();
