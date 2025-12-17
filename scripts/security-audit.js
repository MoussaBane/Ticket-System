/**
 * Security Audit Script
 * Checks for common security misconfigurations
 * 
 * Usage: node scripts/security-audit.js
 */

require('dotenv').config();
const crypto = require('crypto');

console.log('\n🔒 TICKET SYSTEM - SECURITY AUDIT\n');
console.log('='.repeat(50));

const issues = [];
const warnings = [];
const passed = [];

// Check 1: Environment
console.log('\n📋 Environment Checks:');
if (process.env.NODE_ENV === 'production') {
  passed.push('✅ NODE_ENV set to production');
} else {
  warnings.push('⚠️  NODE_ENV is not set to production');
}

// Check 2: JWT Secret
console.log('\n🔑 JWT Configuration:');
if (!process.env.JWT_SECRET) {
  issues.push('❌ JWT_SECRET is not set');
} else if (process.env.JWT_SECRET.length < 32) {
  issues.push(`❌ JWT_SECRET is too short (${process.env.JWT_SECRET.length} chars, need 32+)`);
} else {
  passed.push(`✅ JWT_SECRET is strong (${process.env.JWT_SECRET.length} characters)`);
}

if (!process.env.JWT_EXPIRES_IN) {
  warnings.push('⚠️  JWT_EXPIRES_IN not set (using default)');
} else {
  passed.push(`✅ JWT_EXPIRES_IN configured: ${process.env.JWT_EXPIRES_IN}`);
}

// Check 3: Database
console.log('\n🗄️  Database Configuration:');
if (!process.env.DB_URI && !process.env.DB_USERNAME) {
  issues.push('❌ No database configuration found');
} else {
  passed.push('✅ Database credentials configured');
  
  // Check for plaintext passwords in URI
  if (process.env.DB_URI && process.env.DB_URI.includes('password')) {
    warnings.push('⚠️  DB_URI may contain plaintext "password" - ensure it\'s your actual credential');
  }
}

// Check 4: CORS
console.log('\n🌐 CORS Configuration:');
if (!process.env.CORS_ORIGINS || process.env.CORS_ORIGINS.trim() === '') {
  if (process.env.NODE_ENV === 'production') {
    warnings.push('⚠️  CORS_ORIGINS not set - allowing all origins in production');
  } else {
    passed.push('✅ CORS open (acceptable for development)');
  }
} else {
  const origins = process.env.CORS_ORIGINS.split(',').filter(Boolean);
  passed.push(`✅ CORS allowlist: ${origins.length} origin(s)`);
  origins.forEach(origin => {
    console.log(`   - ${origin.trim()}`);
  });
}

// Check 5: Proxy Configuration
console.log('\n🔄 Proxy Configuration:');
if (process.env.TRUST_PROXY === 'true') {
  passed.push('✅ Trust proxy enabled (for load balancers)');
} else if (process.env.NODE_ENV === 'production') {
  warnings.push('⚠️  Trust proxy not enabled - set if behind load balancer');
}

// Check 6: Seeding
console.log('\n🌱 Seeding Configuration:');
if (process.env.ENABLE_SEEDING === 'true') {
  if (process.env.NODE_ENV === 'production') {
    warnings.push('⚠️  Database seeding is enabled in production');
  } else {
    passed.push('✅ Seeding enabled (development)');
  }
} else {
  passed.push('✅ Seeding disabled');
}

// Check 7: Default Credentials
console.log('\n👤 Default Credentials:');
const defaultAdmin = 'admin@example.com';
const defaultManager = 'manager@example.com';
const defaultPass = 'AdminPass123';

if (process.env.SEED_ADMIN_EMAIL === defaultAdmin || 
    process.env.SEED_MANAGER_EMAIL === defaultManager ||
    process.env.SEED_ADMIN_PASS === defaultPass) {
  warnings.push('⚠️  Default seed credentials detected - change for production');
} else {
  passed.push('✅ Custom seed credentials configured');
}

// Check 8: Dependencies
console.log('\n📦 Dependencies:');
try {
  const packageJson = require('../package.json');
  const criticalDeps = ['express', 'mongoose', 'bcryptjs', 'jose', 'helmet', 'cors'];
  const missing = criticalDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missing.length > 0) {
    issues.push(`❌ Missing critical dependencies: ${missing.join(', ')}`);
  } else {
    passed.push('✅ All critical dependencies present');
  }
} catch (e) {
  warnings.push('⚠️  Could not read package.json');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 AUDIT SUMMARY:\n');

if (passed.length > 0) {
  console.log('✅ Passed Checks:');
  passed.forEach(p => console.log(`   ${p}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
}

if (issues.length > 0) {
  console.log('\n❌ Critical Issues:');
  issues.forEach(i => console.log(`   ${i}`));
}

console.log('\n' + '='.repeat(50));

// Exit code
if (issues.length > 0) {
  console.log('\n❌ Security audit FAILED - fix critical issues before deploying\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Security audit passed with warnings\n');
  process.exit(0);
} else {
  console.log('\n✅ Security audit PASSED - all checks green\n');
  process.exit(0);
}
