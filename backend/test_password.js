const bcrypt = require('bcryptjs');

async function testPassword() {
  try {
    console.log('Testing password comparison...');
    
    // The password hash from the database
    const storedHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const testPassword = 'admin123';
    
    console.log('Stored hash:', storedHash);
    console.log('Test password:', testPassword);
    
    // Test the comparison
    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log('Password comparison result:', isValid);
    
    if (isValid) {
      console.log('✅ Password comparison works correctly');
    } else {
      console.log('❌ Password comparison failed');
    }
    
    // Test JWT secret
    const jwt = require('jsonwebtoken');
    const testUser = { id: 1, username: 'admin', role: 'admin' };
    
    try {
      const token = jwt.sign(testUser, 'test_secret', { expiresIn: '1h' });
      console.log('✅ JWT token generation works');
      console.log('Token:', token.substring(0, 50) + '...');
    } catch (jwtError) {
      console.log('❌ JWT token generation failed:', jwtError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    process.exit(0);
  }
}

testPassword();
