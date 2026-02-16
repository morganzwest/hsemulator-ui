---
description: Testing Workflow
---

---
description: Testing Workflow
---

# Testing Workflow

## When to use
This workflow activates when:
- User types `/test`
- Implementation is complete and needs tests
- User wants to ensure code quality

## Prerequisites
- Implementation must be complete
- Clean phase should be done for accurate test coverage
- If Clean not done, suggest running `/clean` first

## Steps

1. **Load context**
   - Review implementation changes
   - Identify new components, hooks, and utilities
   - Check existing co-located test patterns in the project

2. **Analyze testing needs**
   Based on implementation, identify:
   ```
   ## TESTING ANALYSIS
   
   ### Components Needing Tests (Co-located)
   - [ ] `src/components/[Component]/[Component].test.tsx` - Component test
   - [ ] `src/hooks/[useHook].test.ts` - Hook test
   - [ ] `src/lib/[utility].test.ts` - Utility test
   
   ### Test Coverage Areas
   - [ ] User interactions (clicks, form submissions)
   - [ ] Loading states and data fetching
   - [ ] Error handling and validation
   - [ ] Edge cases and boundary conditions
   
   ### Critical Paths
   - [ ] Main user journey
   - [ ] Error scenarios
   - [ ] API integration points
   ```

3. **Propose test strategy**
   Present testing plan:
   ```
   ## TEST STRATEGY
   
   ### Component Tests
   **Component: `[ComponentName]`**
   - ✓ Renders without crashing
   - ✓ Displays correct initial state
   - ✓ Handles user interactions
   - ✓ Shows loading states
   - ✓ Shows error states
   - ✓ Validates props and accessibility
   
   **Hook: `[useHookName]`**
   - ✓ Returns correct initial values
   - ✓ Handles state updates
   - ✓ Manages side effects
   - ✓ Handles error conditions
   
   **Utility: `[functionName]`**
   - ✓ Handles normal inputs
   - ✓ Handles edge cases
   - ✓ Throws errors appropriately
   - ✓ Returns expected types
   
   ### Coverage Goals
   - New code: 80%+ coverage
   - Critical paths: 100% coverage
   - Co-located tests for all new components/hooks/utils
   ```

4. **Get approval**
   Ask the user:
   - "Should I create all these tests or focus on specific areas?"
   - "Any specific edge cases or scenarios to test?"
   - "Preference for test style (detailed vs. concise)?"

5. **Implement approved tests**
   For each test file (co-located):
   - Follow existing test patterns
   - Use project's testing utilities
   - Include descriptive test names
   - Cover happy paths and edge cases
   - Add meaningful assertions

   Example co-located structure:
   ```
   src/
   ├── components/
   │   └── UserProfile/
   │       ├── UserProfile.tsx
   │       └── UserProfile.test.tsx
   ├── hooks/
   │   ├── useUserData.ts
   │   └── useUserData.test.ts
   └── lib/
       ├── validation.ts
       └── validation.test.ts
   ```

6. **Show test implementation**
   Present each test file created:
   - Explain what each test covers
   - Highlight important test cases
   - Note any assumptions made

7. **Run tests and show results**
   ```bash
   npm test              # Run all tests
   npm run test:coverage # Run with coverage
   ```
   
   ```
   ## TEST RESULTS
   
   ✅ All tests passing
   
   Test Suites: X passed, X total
   Tests: Y passed, Y total
   Coverage:
   - Statements: 85%
   - Branches: 78%
   - Functions: 92%
   - Lines: 84%
   ```

8. **Suggest next step**
   Output:
   ```
   ✅ Testing Phase Complete
   
   ## Test Summary:
   - 📝 Created: [X] co-located test files
   - ✅ Tests passing: [Y]/[Y]
   - 📊 Coverage: [Z]% (target was 80%)
   - 🎯 Critical paths: Fully tested
   
   Key test scenarios covered:
   - [Component interactions]
   - [Hook state management]
   - [Utility functions]
   - [Error handling]
   
   The feature is now tested and ready for documentation.
   
   Next step: Run `/document` to update project documentation.
   ```

## Testing Best Practices
- **Co-located tests**: Place test files next to source code
- **Test behavior**: Not implementation details
- **Descriptive names**: Explain what and why
- **AAA pattern**: Arrange, Act, Assert
- **Coverage goals**: 80%+ for new code, 100% for critical paths
- **Mock dependencies**: External APIs and services
- **Independent tests**: Each test should be isolated
- **User-focused**: Test what users actually do

## Test Commands
```bash
npm test              # Run all tests
npm run test:coverage # Run tests with coverage report
npm run test:ci       # CI-friendly test run
```

## Important Notes
- Match existing co-located test patterns in the project
- Don't test third-party library functionality
- Focus on user-facing behavior and critical business logic
- Ensure tests are maintainable and readable
- Use React Testing Library for component tests
- Use renderHook for custom hook tests
