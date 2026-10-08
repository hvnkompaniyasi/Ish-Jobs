require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB ulandi\n');

  const db = mongoose.connection.db;
  const collections = ['users', 'jobs', 'resumes', 'applications'];

  for (const name of collections) {
    try {
      const indexes = await db.collection(name).indexes();
      console.log(`📋 ${name.toUpperCase()} (${indexes.length} ta):`);
      indexes.forEach((i) => {
        const fields = JSON.stringify(i.key);
        const opts = [];
        if (i.unique) opts.push('UNIQUE');
        if (i.sparse) opts.push('SPARSE');
        if (i.partialFilterExpression) opts.push('PARTIAL');
        console.log(`  ${i.name} ${fields} ${opts.join(' ')}`);
      });
      console.log('');
    } catch (e) {
      console.log(`⚠️  ${name}: ${e.message}\n`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

check().catch((err) => { console.error(err); process.exit(1); });
