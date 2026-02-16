---
description: Clean & Refactor Workflow
---

# Clean & Refactor Workflow

## When to use
This workflow activates when:
- User types `/clean`
- Implementation is complete and needs cleanup
- User wants to remove dead code or refactor

## Prerequisites
- Implementation must be complete (check `docs/development/current-task.md`)
- Code should be functional before cleaning
- If Implementation not done, suggest running `/implement` first

## Steps

1. **Load context**
   - Read `docs/development/current-task.md`
   - Review implementation changes
   - Identify files modified and created
   - Verify Clean stage is not already complete

2. **Analyze codebase for cleanup opportunities**
   Scan the project for:
   ```
   ## CLEANUP ANALYSIS
   
   ### Dead Code Detection
   - [ ] Unused imports
   - [ ] Unreachable code blocks
   - [ ] Commented-out code
   - [ ] Unused variables/functions
   - [ ] Unused components
   - [ ] Empty files
   
   ### Legacy Code
   - [ ] Old implementations replaced by new feature
   - [ ] Deprecated patterns
   - [ ] Outdated dependencies
   - [ ] TODO comments that are resolved
   
   ### Refactoring Opportunities
   - [ ] Duplicate code blocks
   - [ ] Complex functions that can be simplified
   - [ ] Inconsistent naming patterns
   - [ ] Missing TypeScript types
   - [ ] Components that can be broken down
   ```

3. **Present findings**
   Format as actionable items:
   ```
   ## CLEANUP FINDINGS
   
   ### 🗑️ Dead Code to Remove
   - `path/to/file.ts` - Unused function `oldHelper()` (lines 45-62)
   - `components/Legacy.tsx` - Entire component no longer used
   - Multiple files - Unused import of `old-package`
   
   ### 🔄 Refactoring Opportunities
   - `utils/helpers.ts` - Functions `formatX()` and `formatY()` can be combined
   - `components/Feature.tsx` - Extract complex logic into custom hook
   - Multiple files - Inconsistent naming: `userId` vs `user_id`
   
   ### 📦 Dependencies
   - `old-package` - No longer used, can be removed
   - `@types/legacy` - Dev dependency not needed
   ```

4. **Get approval for changes**
   Ask the user:
   - "Should I proceed with removing all dead code identified?"
   - "Which refactoring opportunities should I tackle?"
   - "Any of these changes you'd prefer to skip?"
   - "Is there legacy code you want to keep for reference?"

5. **Execute approved cleanups**
   For each approved item:
   - Remove dead code
   - Apply refactorings
   - Update imports
   - Ensure consistency
   - Maintain functionality

6. **Run verification**
   After cleanup:
   - Check build still works
   - Verify no TypeScript errors introduced
   - Ensure all tests still pass (if any)
   - Confirm no functionality broken

7. **Update task file**
   Update Cleanup Summary in `docs/development/current-task.md`:
   ```markdown
   ## Cleanup Summary
   <!-- Updated by /clean workflow -->
   ### Dead Code Removed
   - Removed `[file]` - [reason]
   - Deleted [X] unused functions
   - Cleaned [Y] unused imports
   
   ### Refactorings Applied
   - Combined [functions] into [new function]
   - Extracted [component] into smaller components
   - Standardized naming across [files]
   
   ### Legacy Code Identified
   - `[file]` - [status: removed/kept for reference]
   
   ### Stats
   - Lines removed: [number]
   - Files deleted: [number]
   - Components refactored: [number]
   ```

8. **Update progress tracker**
   Mark Clean & Refactor as complete:
   ```markdown
   | Clean & Refactor | ✅ | [Date] | Removed [X] lines of dead code |
   ```

9. **Add to decision log**
   ```markdown
   - [Date] Clean - Removed dead code and refactored - [X files affected]
   - [Date] Clean - Kept [legacy file] for reference per user request
   ```

10. **Present summary and suggest next step**
    Output:
    ```
    ✅ Clean & Refactor Phase Complete
    
    ## Cleanup Summary:
    - 🗑️ Removed: [X] files, [Y] unused functions, [Z] dead imports
    - 🔄 Refactored: [A] components for better maintainability
    - 📉 Code reduction: [N] lines removed
    - ✨ Improvements: [List key improvements]
    
    The codebase is now cleaner and more maintainable.
    
    Next step: Run `/test` to create tests for the new functionality.
    ```

## Cleanup Principles
- Never remove code that might be in use
- Ask before removing anything unclear
- Maintain backward compatibility
- Keep refactorings focused and safe
- Preserve comments that provide valuable context
- Update documentation if removing documented features

## Important Notes
- Always verify build after cleanup
- Be conservative with removal - when in doubt, ask
- Group similar changes together
- Explain the benefit of each refactoring
- Keep a record of what was removed in case of rollback needs