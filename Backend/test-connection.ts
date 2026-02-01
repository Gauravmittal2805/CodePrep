import mongoose from 'mongoose';

// Add type for process.env
declare const process: {
  env: {
    MONGODB_URI?: string;
  };
};

async function listAllProblems() {
  try {
    // Use dynamic import to avoid TypeScript errors
    const { default: Problem } = await import('./src/models/Problem');
    const problems = await Problem.find({});
    
    console.log('\n📋 Found', problems.length, 'problems in the database:');
    problems.forEach((problem: any, index: number) => {
      console.log(`\nProblem ${index + 1}:`);
      console.log(`  ID: ${problem.id || problem._id}`);
      console.log(`  Title: ${problem.title}`);
      console.log(`  Difficulty: ${problem.difficulty}`);
      console.log(`  Created At: ${problem.createdAt}`);
    });
    
    return problems;
  } catch (error) {
    console.error('Error listing problems:', error);
    return [];
  }
}

async function testConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CodePrep";
    console.log(`🔗 Testing connection to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);
    
    console.log("✅ Successfully connected to MongoDB");
    
    // List all problems after connecting
    await listAllProblems();
    
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📋 Collections in database:");
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Check if problems collection exists
    const hasProblems = collections.some(coll => coll.name === 'problems');
    console.log(hasProblems ? "\n✅ 'problems' collection exists" : "\n❌ 'problems' collection does not exist");
    
    // If problems collection exists, show count
    if (hasProblems) {
      const Problem = mongoose.model('Problem');
      const count = await Problem.countDocuments();
      console.log(`📊 Number of problems in collection: ${count}`);
      
      if (count > 0) {
        const problem = await Problem.findOne();
        console.log(`\n📝 Sample problem details:`);
        console.log(`- Title: ${problem.title}`);
        console.log(`- Test Cases: ${problem.test_cases?.length || 0}`);
        console.log(`- Hidden Test Cases: ${problem.hidden_test_cases?.length || 0}`);
      }
    }
    
  } catch (error: any) {
    console.error("\n❌ Connection error:");
    if (error.name === 'MongoServerError') {
      console.error(`MongoDB Error (${error.code}): ${error.message}`);
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB server. Is it running?');
      console.error('Error details:', error.message);
    } else {
      console.error(error);
    }
  } finally {
    if (mongoose.connection.readyState === 1) { // 1 = connected
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the test
testConnection().catch(console.error);
