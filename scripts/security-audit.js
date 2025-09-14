#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Atlantic Leather Security Audit\n');

const issues = [];
const warnings = [];

// Check for hardcoded secrets
function checkHardcodedSecrets(filePath, content) {
  const secretPatterns = [
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
  ];

  // Check for hardcoded keys (but ignore React key props)
  const keyPattern = /key\s*[:=]\s*['"][^'"]+['"]/gi;
  const keyMatches = content.match(keyPattern);
  if (keyMatches) {
    keyMatches.forEach(match => {
      // Ignore React key props and common non-secret keys
      if (!match.includes('process.env') && 
          !match.includes('your_') && 
          !match.includes('key="') && 
          !match.includes('key=\'') &&
          !match.includes('key="all"') &&
          !match.includes('key="grid"') &&
          !match.includes('key="list"')) {
        issues.push(`🚨 Hardcoded secret found in ${filePath}: ${match}`);
      }
    });
  }

  secretPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!match.includes('process.env') && !match.includes('your_')) {
          issues.push(`🚨 Hardcoded secret found in ${filePath}: ${match}`);
        }
      });
    }
  });
}

// Check for console.log statements
function checkConsoleLogs(filePath, content) {
  const consoleMatches = content.match(/console\.(log|error|warn|info)/g);
  if (consoleMatches && consoleMatches.length > 5) {
    warnings.push(`⚠️  Multiple console statements in ${filePath} (${consoleMatches.length} found)`);
  }
}

// Check for SQL injection vulnerabilities
function checkSQLInjection(filePath, content) {
  const sqlPatterns = [
    /SELECT.*\+.*req\./gi,
    /INSERT.*\+.*req\./gi,
    /UPDATE.*\+.*req\./gi,
    /DELETE.*\+.*req\./gi,
  ];

  sqlPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push(`🚨 Potential SQL injection vulnerability in ${filePath}`);
    }
  });
}

// Check for XSS vulnerabilities
function checkXSS(filePath, content) {
  const xssPatterns = [
    /innerHTML\s*=/gi,
    /outerHTML\s*=/gi,
    /document\.write/gi,
  ];

  xssPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      warnings.push(`⚠️  Potential XSS vulnerability in ${filePath}`);
    }
  });
}

// Scan directory recursively
function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          checkHardcodedSecrets(filePath, content);
          checkConsoleLogs(filePath, content);
          checkSQLInjection(filePath, content);
          checkXSS(filePath, content);
        } catch (error) {
          console.log(`❌ Error reading ${filePath}: ${error.message}`);
        }
      }
    }
  });
}

// Check environment files
function checkEnvironmentFiles() {
  const envFiles = ['.env', '.env.local', '.env.example'];
  
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      
      // Check for weak passwords
      if (content.includes('admin123') || content.includes('password')) {
        issues.push(`🚨 Weak default password found in ${envFile}`);
      }
      
      // Check for missing required variables
      const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD'];
      requiredVars.forEach(varName => {
        if (!content.includes(varName)) {
          warnings.push(`⚠️  Missing required environment variable: ${varName}`);
        }
      });
    }
  });
}

// Run security audit
console.log('📁 Scanning project files...\n');

// Scan backend
if (fs.existsSync(path.join(process.cwd(), 'backend'))) {
  scanDirectory(path.join(process.cwd(), 'backend'));
}

// Scan frontend
if (fs.existsSync(path.join(process.cwd(), 'app'))) {
  scanDirectory(path.join(process.cwd(), 'app'));
}

// Check environment files
checkEnvironmentFiles();

// Report results
console.log('📊 Security Audit Results:\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ No security issues found!');
} else {
  if (issues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    issues.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }
}

console.log(`\n📈 Summary:`);
console.log(`  Critical Issues: ${issues.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Total: ${issues.length + warnings.length}`);

if (issues.length > 0) {
  console.log('\n❌ Security audit failed. Please fix critical issues before deployment.');
  process.exit(1);
} else {
  console.log('\n✅ Security audit passed!');
  process.exit(0);
}
