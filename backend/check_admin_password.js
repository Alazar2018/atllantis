const db = require('./config/database').promise;

async function checkAdminPassword() {
  try {
    console.log('Checking admin user password hash...');
    
    // Get the admin user's password hash
    const [users] = await db.execute(
      'SELECT id, username, email, password, role, active FROM users WHERE username = ?',
      ['admin']
    );
    
    if (users.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const admin = users[0];
    console.log('✅ Admin user found:');
    console.log('  ID:', admin.id);
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Active:', admin.active);
    console.log('  Password Hash:', admin.password);
    
    // Test with the actual stored hash
    const bcrypt = require('bcryptjs');
    const testPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    
    console.log('\nTesting password comparison with stored hash...');
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('Password comparison result:', isValid);
    
    if (isValid) {
      console.log('✅ Password "admin123" matches the stored hash');
    } else {
      console.log('❌ Password "admin123" does not match the stored hash');
      console.log('The stored hash might be for a different password');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAdminPassword();
