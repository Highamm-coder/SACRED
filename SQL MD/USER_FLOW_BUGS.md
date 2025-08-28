# SACRED User Flow - Bug Report & Issues

## Critical Issues Found

### 1. **Question Service vs Assessment Component Mismatch** 🔴
**Issue**: The Question service orders by `order` column, but Assessment component expects `questionId` field
- **File**: `src/api/services/questions.js:9` vs `src/pages/Assessment.jsx:78`
- **Problem**: 
  - Questions service: `order('order', { ascending: true })`
  - Assessment tries to find: `q.questionId === questionId`
  - But imported questions have `question_id` field, not `questionId`
- **Impact**: Assessment page will fail to load questions or find questions properly
- **Fix Needed**: Update Question service to return consistent field names

### 2. **Disconnected Assessment Questions** 🔴
**Issue**: Assessment uses old `Question.list()` which doesn't connect to new CMS questions
- **File**: `src/pages/Assessment.jsx:46`
- **Problem**: The imported SACRED questions aren't being used by the assessment flow
- **Impact**: Users see old/sample questions instead of real SACRED content
- **Fix Needed**: Update Assessment to use new question structure from CMS

### 3. **Missing Assessment Table Integration** 🔴
**Issue**: No integration between CMS questions and user assessment flow
- **Problem**: Questions exist in `questions` table but Assessment doesn't use them
- **Impact**: Assessment experience shows wrong questions
- **Fix Needed**: Bridge CMS question management with user assessment experience

### 4. **Question ID Field Inconsistency** 🟡
**Issue**: Mixed use of `questionId` vs `question_id` throughout codebase
- **Files**: Multiple files use different field names
- **Impact**: Data lookups fail, answers don't save correctly
- **Fix Needed**: Standardize on one field name throughout

### 5. **Payment Flow Missing Integration** 🟡
**Issue**: Dashboard checks `has_paid` but no visible payment flow
- **File**: `src/pages/Home.jsx:14` and `src/pages/Dashboard.jsx:31`
- **Impact**: Users get stuck at PaymentRequired page with no way forward
- **Fix Needed**: Create proper payment integration or bypass for testing

### 6. **Report Generation Unknown** 🟡
**Issue**: Dashboard references Report page but report generation unclear
- **File**: `src/pages/Dashboard.jsx:157`
- **Problem**: No visible report generation logic
- **Impact**: Users can't see their results
- **Fix Needed**: Implement report generation from assessment answers

## Data Flow Issues

### 7. **Question Loading in Assessment** 🔴
```javascript
// Current (broken):
const question = questions.find(q => q.questionId === questionId);

// Should be:
const question = questions.find(q => q.question_id === questionId);
```

### 8. **Question Order Inconsistency** 🟡
- Questions service orders by `order` field
- CMS uses `order_index` field
- Assessment expects consistent ordering
- **Fix**: Standardize on one ordering field

### 9. **Section Management** 🟡
- CMS has `assessment_sections` table
- Questions reference sections by string ID
- No clear connection in assessment flow
- **Fix**: Implement section-based question loading

## User Experience Issues

### 10. **Missing Progress Persistence** 🟡
**Issue**: No clear session management for partially completed assessments
- **Impact**: Users might lose progress
- **Fix Needed**: Better answer persistence and session handling

### 11. **Partner 2 Onboarding Flow** 🟡
**Issue**: Partner 2 flow assumes existing assessment but questions may not load properly
- **File**: `src/pages/Onboarding.jsx:61`
- **Impact**: Second partner can't complete assessment
- **Fix Needed**: Ensure Partner 2 gets same question set as Partner 1

### 12. **Error Handling** 🟡
**Issue**: Multiple places with generic error handling that don't guide users
- **Files**: Dashboard, Assessment, Onboarding all have basic error states
- **Impact**: Users get stuck without clear resolution
- **Fix Needed**: Better error messages and recovery options

## Database Schema Issues

### 13. **Table Structure Mismatch** 🔴
**Issue**: Questions table has both `order` and `order_index` columns
- **Problem**: Code inconsistently uses either field
- **Impact**: Questions appear in wrong order or don't load
- **Fix Needed**: Use only one ordering field consistently

### 14. **Missing Question Types** 🟡
**Issue**: Assessment UI may not handle all question types properly
- **Files**: Question rendering components
- **Impact**: Scale questions, text inputs may not work
- **Fix Needed**: Test all question types in assessment flow

## Recommended Fixes Priority

### HIGH PRIORITY (Fix First) 🔴
1. Fix Question service field name consistency (`questionId` vs `question_id`)
2. Connect CMS questions to assessment flow
3. Standardize question ordering field
4. Test complete question loading in assessment

### MEDIUM PRIORITY 🟡
1. Implement proper payment flow or bypass
2. Create report generation system
3. Fix section-based question organization
4. Improve error handling throughout

### LOW PRIORITY 🟢
1. Add progress persistence
2. Enhance Partner 2 experience
3. Add better loading states
4. Improve mobile responsiveness

## Test Scenarios Needed

1. **New User Journey**: Landing → Signup → Onboarding → Assessment → Report
2. **Partner 2 Journey**: Invite link → Signup → Onboarding → Assessment
3. **Question Loading**: All 35 questions load correctly in assessment
4. **Answer Saving**: Answers persist correctly
5. **Report Generation**: Completed assessment generates report
6. **Section Navigation**: Questions grouped properly by section

## Next Steps

1. Fix critical Question service issues first
2. Test assessment flow end-to-end
3. Implement missing report generation
4. Add proper error recovery flows
5. Test both partner journeys completely