# User Flow Test Plan

## Test Complete User Journey

### 1. **Landing Page** ✅
- Visit the site 
- Should show landing page with "Begin Assessment" button

### 2. **Registration/Login** ✅  
- Click "Begin Assessment"
- Should go to Login page
- Create new account
- Verify email functionality

### 3. **Payment Bypass** ✅
- After login, should go to PaymentRequired page
- Use "Test Bypass (Dev Only)" button to set has_paid = true
- Should redirect to Dashboard or Onboarding

### 4. **Onboarding (Partner 1)** ✅
- Should go through onboarding steps
- Fill out partner information
- Create assessment

### 5. **Assessment Taking** ⚠️  
- Should see all 35 real SACRED questions
- Questions should be in correct order
- Should be able to answer questions
- Answers should save properly

### 6. **Partner Invitation** ✅
- Should be able to generate invite link
- Partner 2 should be able to access via invite

### 7. **Partner 2 Flow** ✅
- Partner 2 signs up via invite link
- Goes through simplified onboarding
- Takes assessment

### 8. **Report Generation** ⚠️
- When both partners complete assessment
- Should generate comparison report
- Report should show alignment/differences

## Quick Test Commands

### Test Questions Loading
```bash
# In browser console on Assessment page:
console.log(questions); // Should show 35 questions
console.log(questions[0]); // Should have questionId field
```

### Test Database
```sql
-- Check questions exist
SELECT COUNT(*) FROM questions WHERE is_active = true;

-- Check question structure
SELECT question_id, section, question_type, order_index 
FROM questions 
WHERE is_active = true 
ORDER BY order_index 
LIMIT 5;
```

## Expected Fixes Working

1. ✅ **Question Service Fixed**
   - Now returns `questionId` alias
   - Filters by `is_active = true`
   - Orders by `order_index`

2. ✅ **Payment Bypass Added**
   - Dev bypass button on PaymentRequired page

3. ⏳ **Assessment Flow**
   - Should load real SACRED questions
   - Should save answers properly
   - Questions should be in sections

4. ⏳ **Report Generation**
   - Should work with question_id field consistency
   - Should show proper comparisons

## Manual Testing Steps

1. **Fresh User Test:**
   - Open incognito window
   - Go to landing page
   - Sign up with new email
   - Complete full flow to report

2. **Partner Flow Test:**
   - Create assessment as Partner 1
   - Send invite link to different email
   - Complete Partner 2 flow
   - Generate report

3. **CMS Test:**
   - Login as admin
   - Go to /admin
   - Edit assessment questions
   - Verify changes appear in assessment flow