import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem";

dotenv.config();

async function verifyDatabase() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CodePrep";
        await mongoose.connect(mongoUri);
        console.log("✓ Connected to MongoDB");

        // Count problems
        const count = await Problem.countDocuments();
        console.log(`\n📊 Total problems in database: ${count}`);

        // Fetch all problems
        const problems = await Problem.find({});

        if (problems.length === 0) {
            console.log("\n❌ No problems found in database!");
            console.log("Run: npx ts-node src/scripts/seed-problems.ts");
        } else {
            console.log("\n✅ Problems found:");
            problems.forEach((p, index) => {
                console.log(`${index + 1}. ${p.title} (${p.difficulty}) - ${p.slug}`);
                console.log(`   Companies: ${p.companies.join(', ')}`);
                console.log(`   Tags: ${p.tags.join(', ')}`);
            });
        }

    } catch (error) {
        console.error("❌ Error verifying database:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed");
    }
}

// Run the verification
verifyDatabase();
