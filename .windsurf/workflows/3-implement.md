---
description: Implementation Workflow
---

# Implementation Workflow

## When to use

This workflow activates when:

- User types `/implement`
- User is ready to start coding
- User wants to build the designed solution

## Prerequisites

- Design must be complete (check `docs/development/current-task.md`)
- Selected approach must be documented
- If Design not done, suggest running `/design` first

## Steps

1. **Load context**

   - Read `docs/development/current-task.md`
   - Review selected design approach
   - Review implementation plan from design phase
   - Verify Implementation stage is not already started

2. **Confirm implementation mode**
   Ask the user:

   ```
   How would you like to proceed with implementation?

   1. **Incremental** - I'll pause after each major component for your review
   2. **Continuous** - I'll implement the full solution, then you review

   Which do you prefer?
   ```

3. **Begin implementation**

   ### For Incremental Mode:

   - Implement first component/module from plan
   - Show the code created/modified
   - Explain key decisions made
   - Ask: "Does this look good? Should I continue with [next component]?"
   - Wait for feedback before proceeding
   - Repeat for each major component

   ### For Continuous Mode:

   - Implement complete solution based on design
   - Track all changes made
   - Handle any discovered issues
   - Present summary of implementation when complete

4. **Track implementation details**
   As you implement, maintain a log of:

   - Files created
   - Files modified
   - Key functions/components added
   - Integration points
   - Any deviations from original plan

5. **Handle decision points**
   When encountering choices not covered in design:

   - Stop and ask for guidance
   - Present options with trade-offs
   - Document the decision made
   - Example: "I found that [situation]. Should I [option A] or [option B]?"

6. **Update task file**
   Update Implementation Log section in `docs/development/current-task.md`:

   ```markdown
   ## Implementation Log

   <!-- Updated by /implement workflow -->

   ### Changes Made

   - Created `[file]` - [purpose]
   - Modified `[file]` - [what changed]
   - Added [component/function] - [functionality]

   ### Key Files Modified

   - `path/to/file.tsx` - [type of change]
   - `path/to/file.ts` - [type of change]

   ### Challenges Faced

   - [Challenge]: [How resolved]
   ```

7. **Update progress tracker**
   Mark Implementation as complete:

   ```markdown
   | Implementation | ✅ | [Date] | Core functionality built |
   ```

8. **Add to decision log**

   ```markdown
   - [Date] Implementation - Completed core build - [Mode: incremental/continuous]
   - [Date] Implementation - [Any major decisions made during coding]
   ```

9. **Verify build**
   Before marking complete, run these checks:

   ```bash
   # Type checking
   npx tsc --noEmit

   # Linting
   npm run lint

   # Build verification
   npm run build

   # Code formatting
   npm run format

   # Run existing tests (if any)
   npm test

   # Additional checks if available:
   # npm run type-check
   # npm audit (for security vulnerabilities)
   # npm run analyze (bundle size)
   ```

   Also check for:

   - [ ] No `console.log` statements left in production code
   - [ ] No `TODO` or `FIXME` comments without tickets
   - [ ] No commented-out code blocks
   - [ ] No `any` types in TypeScript (use `unknown` or proper types)
   - [ ] All imports are used
   - [ ] No hardcoded values that should be constants/env vars
   - [ ] No unintended files changed (check `git status`)
   - [ ] Proper error boundaries for React components
   - [ ] Environment variables documented (if new ones added)

   If any issues found:

   - Fix them before proceeding
   - Document fixes in implementation log

   Report results like:

   ```
   ✅ Build Verification Results:
   - TypeScript: No errors
   - Linting: Fixed 3 warnings
   - Build: Successful (2.3s)
   - Format: Updated 2 files
   - Tests: 48 passing (existing tests)
   ```

   Note: If any command doesn't exist:

   ```
   ⚠️ Skipped: npm run analyze (script not found)
   ```

10. **Present summary and suggest next step**
    Output:

    ```
    ✅ Implementation Phase Complete

    ## Summary of Changes:
    - Created [X] new components
    - Modified [Y] existing files
    - Added [Z] new functions/utilities

    ## Key Files:
    - `[path]` - [what it does]
    - `[path]` - [what it does]

    The implementation is ready for cleanup and optimization.

    Next step: Run `/clean` to remove any dead code and refactor.
    ```

## Implementation Guidelines

- Follow project conventions from `.cascade/memories/project-conventions.md`
- Use existing patterns found during discovery
- Keep components focused and single-purpose
- Add TypeScript types for all new code
- Include basic error handling
- Comment complex logic
- Use meaningful variable and function names

## Important Notes

- Always check if similar code exists before creating new
- Reuse components from ui/ directory when possible
- Ask for clarification rather than making assumptions
- Document any deviations from the original plan
- Keep the user informed of progress in incremental mode
- If verification commands don't exist in package.json, note it and move on
- Some projects may use different commands (e.g., `pnpm` instead of `npm`)
