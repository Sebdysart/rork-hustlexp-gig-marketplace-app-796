# HustleXP QA & Testing Guide

## 📋 Overview

This document provides a comprehensive testing guide for HustleXP, including test organization, execution instructions, and quality assurance checklists.

## 🗂️ Test Structure

```
__tests__/
├── utils/                    # Unit tests for utility functions
│   ├── gamification.test.ts
│   ├── offlineSyncQueue.test.ts
│   └── aiLearningIntegration.test.ts
├── integration/              # Integration tests for contexts
│   └── AppContext.test.tsx
├── e2e/                      # End-to-end user flow tests
│   └── userFlows.test.tsx
├── performance/              # Performance benchmarks
│   └── rendering.test.tsx
└── accessibility/            # Accessibility compliance tests
    └── a11y.test.tsx
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
# or
yarn test
# or
bun test
```

### Run Specific Test Suites
```bash
# Unit tests
npm test -- __tests__/utils/

# Integration tests
npm test -- __tests__/integration/

# E2E tests
npm test -- __tests__/e2e/

# Performance tests
npm test -- __tests__/performance/

# Accessibility tests
npm test -- __tests__/accessibility/
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## 🎯 Test Categories

### 1. Unit Tests
**Purpose**: Test individual functions and utilities in isolation

**Coverage Areas**:
- Gamification calculations (XP, levels, avatars)
- Offline sync queue management
- AI learning feedback loops
- Badge progression logic
- Trust score calculations

**Success Criteria**:
- All calculations return expected values
- Edge cases handled correctly
- No memory leaks
- Performance within acceptable limits

### 2. Integration Tests
**Purpose**: Test how different parts of the app work together

**Coverage Areas**:
- Context providers (AppContext, TaskLifecycleContext, AIProfileContext)
- State management across components
- API integrations with backend
- Data persistence with AsyncStorage
- React Query interactions

**Success Criteria**:
- Contexts provide correct data
- State updates propagate correctly
- No race conditions
- Proper error handling

### 3. E2E Tests
**Purpose**: Test complete user flows from start to finish

**Coverage Areas**:
- Onboarding flow (worker, poster, dual-role)
- Task creation and acceptance
- Task completion lifecycle
- Mode switching (everyday → business → tradesmen)
- Offline mode queue and sync
- Gamification progression

**Success Criteria**:
- User can complete full workflows
- No blocking issues
- Smooth navigation between screens
- Data persists correctly

### 4. Performance Tests
**Purpose**: Ensure app performs well under various conditions

**Coverage Areas**:
- List rendering with large datasets (1000+ items)
- Rapid component re-renders
- Data filtering and sorting
- Animation calculations
- State update frequency

**Success Criteria**:
- Render time < 500ms for large lists
- Re-render time < 1000ms for 100 updates
- Data operations < 100ms
- No memory leaks
- Smooth 60fps animations

### 5. Accessibility Tests
**Purpose**: Ensure app is accessible to all users

**Coverage Areas**:
- Screen reader labels
- Touch target sizes (minimum 44x44)
- Color contrast ratios (WCAG AA)
- Keyboard navigation
- Focus management
- Live regions for dynamic content

**Success Criteria**:
- All interactive elements have labels
- Touch targets meet minimum size
- Text contrast ratio ≥ 4.5:1
- Keyboard navigable
- Screen reader friendly

## ✅ QA Checklist

### Pre-Release Checklist

#### 🔐 Core Functionality
- [ ] User can complete onboarding
- [ ] User can create tasks
- [ ] User can accept tasks
- [ ] User can complete tasks
- [ ] User can switch modes
- [ ] XP and leveling work correctly
- [ ] Badges are awarded properly
- [ ] Wallet transactions work
- [ ] Messages send/receive correctly
- [ ] Ratings system works

#### 📱 Platform Testing
- [ ] iOS app runs without crashes
- [ ] Android app runs without crashes
- [ ] Web app loads and functions
- [ ] Deep links work correctly
- [ ] Push notifications deliver
- [ ] Camera features work (web & mobile)
- [ ] Location services work
- [ ] File uploads work

#### 🌐 Network Testing
- [ ] App works online
- [ ] App handles offline mode
- [ ] Sync queue works when reconnected
- [ ] API errors handled gracefully
- [ ] Network timeout handling
- [ ] Retry logic works

#### 🎨 UI/UX Testing
- [ ] All screens render correctly
- [ ] Animations are smooth
- [ ] No visual glitches
- [ ] Loading states show
- [ ] Error states show
- [ ] Empty states show
- [ ] Safe areas respected
- [ ] Dark mode works (if supported)

#### ♿ Accessibility Testing
- [ ] Screen reader navigation works
- [ ] All buttons have labels
- [ ] All images have alt text
- [ ] Touch targets ≥ 44x44
- [ ] Color contrast passes WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

#### 🔋 Performance Testing
- [ ] App launches quickly (< 3s)
- [ ] Lists scroll smoothly
- [ ] No memory leaks
- [ ] Battery usage acceptable
- [ ] Network data usage reasonable
- [ ] App size acceptable

#### 🔒 Security Testing
- [ ] User data encrypted
- [ ] API keys not exposed
- [ ] No sensitive data in logs
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] Input validation works

## 🐛 Bug Reporting Template

When reporting bugs, use this template:

```markdown
### Bug Title
[Brief, descriptive title]

### Priority
- [ ] Critical (app crashes)
- [ ] High (feature broken)
- [ ] Medium (minor issue)
- [ ] Low (cosmetic)

### Environment
- Platform: [iOS/Android/Web]
- OS Version: [e.g., iOS 17.1]
- App Version: [e.g., 1.0.0]
- Device: [e.g., iPhone 14 Pro]

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[If applicable, add screenshots]

### Additional Context
[Any other relevant information]
```

## 📊 Test Coverage Goals

| Category | Target Coverage |
|----------|----------------|
| Utils | 90%+ |
| Contexts | 85%+ |
| Components | 80%+ |
| Screens | 75%+ |
| **Overall** | **80%+** |

## 🎭 Test Data

### Mock Users
Located in `mocks/seedData.ts`:
- Worker users with various levels
- Poster users
- Dual-role users
- Tradesmen with certifications

### Mock Tasks
- Open tasks
- In-progress tasks
- Completed tasks
- Various categories and pay amounts

## 🔍 Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="should calculate level"
```

### Generate Coverage Report
```bash
npm test -- --coverage --coverageDirectory=coverage
```

Then open `coverage/lcov-report/index.html` in browser.

## 📈 Continuous Integration

### GitHub Actions Setup
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage
```

## 🚦 Test Status Dashboard

Access the interactive test dashboard in the app:
1. Navigate to Settings
2. Tap "Test Dashboard"
3. Run individual test suites or all tests
4. View real-time results and performance metrics

## 📝 Writing New Tests

### Test File Template
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('Specific Functionality', () => {
    it('should do something correctly', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices
1. **Arrange-Act-Assert**: Structure tests clearly
2. **One assertion per test**: Keep tests focused
3. **Descriptive names**: Test names should explain what they test
4. **Mock external dependencies**: Isolate code under test
5. **Clean up**: Remove test data after tests
6. **Test edge cases**: Don't just test happy paths

## 🎯 Testing Priorities

### P0 - Critical (Must pass before release)
- User can sign in/up
- User can create and accept tasks
- User can complete tasks and receive payment
- XP and leveling works
- No crashes on launch

### P1 - High (Should pass before release)
- All user flows complete successfully
- Offline mode works
- Performance meets benchmarks
- Accessibility standards met

### P2 - Medium (Nice to have)
- All edge cases covered
- UI polish issues
- Minor performance optimizations

### P3 - Low (Can defer)
- Cosmetic issues
- Nice-to-have features
- Non-critical optimizations

## 📞 Support

For testing questions or issues:
- Check existing test files for examples
- Review Jest documentation
- Review React Native Testing Library docs
- Ask in team chat

## 🔄 Test Maintenance

### Regular Tasks
- [ ] Update tests when features change
- [ ] Add tests for new features
- [ ] Remove tests for deprecated features
- [ ] Keep test data up to date
- [ ] Review and update coverage goals
- [ ] Monitor test execution time

### Monthly Review
- [ ] Analyze test coverage trends
- [ ] Identify slow tests
- [ ] Remove obsolete tests
- [ ] Update testing documentation
- [ ] Review and fix flaky tests
