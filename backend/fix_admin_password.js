const db = require('./config/database').promise;
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('Fixing admin user password...');
    
    // Generate the correct hash for the admin password
    const correctPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const correctHash = await bcrypt.hash(correctPassword, 10);
    
    console.log('New password hash generated');
    
    // Update the admin user's password
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [correctHash, 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully');
      
      // Verify the update
      const [users] = await db.execute(
        'SELECT username, password FROM users WHERE username = ?',
        ['admin']
      );
      
      if (users.length > 0) {
        const isValid = await bcrypt.compare(correctPassword, users[0].password);
        console.log('Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
        
        if (isValid) {
          console.log('🎉 Admin login should now work with:');
          console.log('  Username: admin');
          console.log('  Password: admin123');
        }
      }
    } else {
      console.log('❌ Failed to update admin password');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminPassword();
