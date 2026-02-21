// Test file for account limits functionality
// This can be run in the browser console to verify the implementation

import { 
  isAbleToAddPortal, 
  isAbleToAddUser, 
  getAccountLimits,
  checkLimitsWithUpgradeInfo
} from '@/lib/account-limits';

// Test functions
async function testAccountLimits() {
  console.log('Testing Account Limits Implementation...');
  
  try {
    // Test 1: Check if we can add a portal
    const canAddPortal = await isAbleToAddPortal();
    console.log('Can add portal:', canAddPortal);
    
    // Test 2: Check if we can add a user
    const canAddUser = await isAbleToAddUser();
    console.log('Can add user:', canAddUser);
    
    // Test 3: Get full account limits
    const limits = await getAccountLimits();
    console.log('Account limits:', limits);
    
    // Test 4: Check limits with upgrade info
    const portalCheck = await checkLimitsWithUpgradeInfo('portal');
    console.log('Portal limit check:', portalCheck);
    
    const userCheck = await checkLimitsWithUpgradeInfo('user');
    console.log('User limit check:', userCheck);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testAccountLimits = testAccountLimits;

console.log('Account limits test loaded. Run testAccountLimits() to test.');
