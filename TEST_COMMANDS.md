# HustleXP Test Commands Reference

Quick reference for running tests in HustleXP.

## 🚀 Basic Commands

### Run All Tests
```bash
npm test
# or
yarn test
# or
bun test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests Verbosely
```bash
npm test -- --verbose
```

## 📂 Run by Category

### Unit Tests
```bash
npm test -- __tests__/utils/
```

### Integration Tests
```bash
npm test -- __tests__/integration/
```

### E2E Tests
```bash
npm test -- __tests__/e2e/
```

### Performance Tests
```bash
npm test -- __tests__/performance/
```

### Accessibility Tests
```bash
npm test -- __tests__/accessibility/
```

## 🎯 Run Specific Files

### Gamification Tests
```bash
npm test -- __tests__/utils/gamification.test.ts
```

### Offline Sync Tests
```bash
npm test -- __tests__/utils/offlineSyncQueue.test.ts
```

### AI Learning Tests
```bash
npm test -- __tests__/utils/aiLearningIntegration.test.ts
```

### App Context Tests
```bash
npm test -- __tests__/integration/AppContext.test.tsx
```

## 🔍 Run Specific Tests

### By Test Name Pattern
```bash
npm test -- --testNamePattern="should calculate level"
```

### By File Pattern
```bash
npm test -- --testPathPattern="gamification"
```

## 📊 Coverage Commands

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Coverage for Specific Directory
```bash
npm test -- __tests__/utils/ --coverage
```

### Open Coverage HTML Report
```bash
npm test -- --coverage
# Then open: coverage/lcov-report/index.html
```

## 🐛 Debugging Tests

### Run Single Test File
```bash
npm test -- __tests__/utils/gamification.test.ts
```

### Run with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Clear Jest Cache
```bash
jest --clearCache
```

## ⚙️ Advanced Options

### Update Snapshots
```bash
npm test -- --updateSnapshot
# or
npm test -- -u
```

### Run Tests Serially (No Parallel)
```bash
npm test -- --runInBand
```

### Set Test Timeout
```bash
npm test -- --testTimeout=10000
```

### Run Only Failed Tests
```bash
npm test -- --onlyFailures
```

## 📱 Platform-Specific

### Run Tests for iOS
```bash
npm test -- --platform=ios
```

### Run Tests for Android
```bash
npm test -- --platform=android
```

### Run Tests for Web
```bash
npm test -- --platform=web
```

## 📈 CI/CD Commands

### Run Tests in CI Mode
```bash
CI=true npm test -- --coverage --maxWorkers=2
```

### Generate JSON Report
```bash
npm test -- --json --outputFile=test-results.json
```

### Generate JUnit Report
```bash
npm test -- --ci --reporters=default --reporters=jest-junit
```

## 🎨 Test Dashboard (In-App)

To access the interactive test dashboard:
1. Launch HustleXP app
2. Navigate to Settings
3. Tap "Test Dashboard"
4. Select test category
5. Run tests visually

## 🔧 Configuration

Jest configuration is in `jest.config.js`:
- Coverage thresholds: 80% lines, 75% functions
- Transform ignore patterns configured
- Module name mapper for @ imports
- Test match patterns for *.test.{ts,tsx}

## 📚 Documentation

- **Complete Guide**: See `QA_TESTING_GUIDE.md`
- **Implementation Summary**: See `TESTING_SUMMARY.md`
- **Completion Report**: See `OPTION_F_TESTING_COMPLETE.md`

## 💡 Tips

### Run Fast Tests First
```bash
npm test -- __tests__/utils/ --maxWorkers=4
```

### Skip Slow Tests
```bash
npm test -- --testPathIgnorePatterns="e2e|performance"
```

### Continuous Testing During Development
```bash
npm test -- --watch --coverage=false
```

### Before Committing
```bash
npm test -- --coverage && npm run lint
```

## 🎯 Quick Test Scenarios

### Before PR
```bash
npm test -- --coverage --bail
```

### After Refactoring
```bash
npm test -- __tests__/integration/ --verbose
```

### Performance Check
```bash
npm test -- __tests__/performance/ --verbose
```

### Accessibility Audit
```bash
npm test -- __tests__/accessibility/
```

## 📞 Need Help?

Run tests with verbose output to see detailed errors:
```bash
npm test -- --verbose --no-coverage
```

Check Jest documentation:
```bash
npm test -- --help
```
