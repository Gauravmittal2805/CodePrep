const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/CodePrep').then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('users').updateOne(
    {email: 'gaurav@gmail.com'},
    {$set: {uid: 'L7D7sY4K9OagkF13t3eZDEy6R6u1'}}
  );
  console.log('Update result:', result);
  process.exit(0);
});
