
import { DatabaseService } from './src/services/databaseService';
import { UserRole } from './src/types/enums';
import bcrypt from 'bcryptjs';

async function createResponder() {
  const db = DatabaseService.getInstance();
  await db.initialize();
  
  const email = 'responder@theeye.com';
  const password = 'password123';
  const name = 'Official Responder';
  
  // Check if exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    console.log('Responder already exists:', email);
    process.exit(0);
  }
  
  const password_hash = await bcrypt.hash(password, 10);
  
  const userData = {
    name,
    email,
    password_hash,
    role: UserRole.RESPONDER,
    phone: '1234567890',
    address: 'HQ'
  };
  
  const user = await db.createUser(userData);
  console.log('Created responder:', user.email);
  process.exit(0);
}

createResponder().catch(err => {
  console.error(err);
  process.exit(1);
});
