
const { DatabaseService } = require('./src/services/databaseService');
const { UserRole } = require('./src/types/enums');

async function checkResponders() {
  const db = DatabaseService.getInstance();
  await db.initialize();
  
  const query = 'SELECT email, role FROM users WHERE role = $1';
  const { rows } = await db.pool.query(query, ['RESPONDER']);
  
  if (rows.length > 0) {
    console.log('Found responders:', rows);
  } else {
    console.log('No responders found.');
  }
  process.exit(0);
}

checkResponders().catch(err => {
  console.error(err);
  process.exit(1);
});
