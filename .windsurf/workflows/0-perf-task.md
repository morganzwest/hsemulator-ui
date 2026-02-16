---
description: Performance Optimization Task Initialization
---

# Performance Optimization Task Initialization

## When to use

This workflow activates when:

- User types `/perf-task [name]`
- User mentions performance issues or optimization needs
- User asks to fix lag, slowness, or inefficient rendering
- User wants to optimize existing code performance

## What this workflow does

- ✅ Creates performance task tracking file
- ✅ Identifies performance issues and bottlenecks
- ✅ Sets up optimization tracking structure
- ❌ Does NOT implement fixes yet
- ❌ Does NOT analyze detailed code (that's for /discovery)
- ❌ Does NOT propose specific solutions

## Steps

1. **Check for existing task**

   - Read `docs/development/current-task.md`
   - If task exists, ask: "There's already an active task. Would you like to:
     - Continue with existing task
     - Archive and start new optimization task
     - View current task status"

2. **Initialize new performance task**
   If creating new task:

   - Ask for task name if not provided
   - Create/update `docs/development/current-task.md` with this template:

   ```markdown
   # Current Task: [Task Name] - Performance Optimization

   ## Overview

   **Type:** 🚀 Performance Optimization
   **Objective:** [To be filled after gathering requirements]
   **Performance Goals:** [To be filled after gathering requirements]
   **Started:** [Today's date]
   **Status:** 🔄 In Progress

   ## Performance Issues Identified

   **Current Problems:**

   - [To be filled]

   **Impact:**

   - [To be filled]

   **Success Metrics:**

   - [To be filled]

   ## Progress Tracker

   | Stage                | Status | Completed | Notes |
   | -------------------- | ------ | --------- | ----- |
   | Issue Analysis       | ⏳     | -         | -     |
   | Root Cause Discovery | ⏳     | -         | -     |
   | Optimization Design  | ⏳     | -         | -     |
   | Implementation       | ⏳     | -         | -     |
   | Performance Testing  | ⏳     | -         | -     |
   | Clean & Refactor     | ⏳     | -         | -     |
   | Documentation        | ⏳     | -         | -     |

   ## Issue Analysis

   <!-- Updated by /discovery workflow -->

   ### Performance Bottlenecks

   -

   ### Root Causes

   -

   ### Affected Components

   -

   ### User Impact

   -

   ## Optimization Strategy

   <!-- Updated by /design workflow -->

   ### Selected Approach

   -

   ### Expected Improvements

   -

   ### Risk Assessment

   -

   ### Rejected Alternatives

   -

   ## Implementation Log

   <!-- Updated by /implement workflow -->

   ### Optimizations Applied

   -

   ### Key Files Modified

   -

   ### Performance Gains

   -

   ### Challenges Faced

   -

   ## Performance Testing

   <!-- Updated by /test workflow -->

   ### Before Metrics

   -

   ### After Metrics

   -

   ### Test Scenarios

   -

   ### Regression Tests

   -

   ## Cleanup Summary

   <!-- Updated by /clean workflow -->

   ### Dead Code Removed

   -

   ### Refactorings Applied

   -

   ### Code Quality Improvements

   -

   ## Documentation Updates

   <!-- Updated by /document workflow -->

   ### Performance Guidelines Updated

   -

   ### Code Comments Added

   -

   ## Decision Log

   <!-- Running log of all decisions -->

   - [Today's date] Perf Task Init - Created optimization task: [name] - [reason/context]
   ```

3. **Gather performance requirements**
   Ask the user (keep questions focused on performance):

   - "What specific performance issues are you experiencing?"
   - "Which components or interactions feel slow/laggy?"
   - "What's the expected performance improvement?"
   - "Are there any performance metrics you want to track?"
   - "What's the user impact of these performance issues?"

   Do NOT ask about:

   - Technical implementation details
   - Specific optimization techniques
   - Which files to modify
   - How to fix the issues

4. **Update task file**
   Fill in the Overview section:

   ```markdown
   ## Overview

   **Type:** 🚀 Performance Optimization
   **Objective:** [User's description of issues]
   **Performance Goals:** [User's expected improvements]
   **Started:** [Today's date]
   **Status:** 🔄 In Progress

   ## Performance Issues Identified

   **Current Problems:**

   - [User's reported issues]

   **Impact:**

   - [User impact description]

   **Success Metrics:**

   - [User's success criteria]
   ```

5. **Add to decision log**

   ```markdown
   ## Decision Log

   - [Date] Perf Task Init - Created optimization task: [name] - [performance issues context]
   ```

6. **Confirm and suggest next step**
   Output:

   ```
   ✅ Performance optimization task initialized: [name]

   I've created `docs/development/current-task.md` to track our optimization progress.

   Performance Issues: [What user described]
   Expected Improvements: [What user defined]

   Ready to analyze the performance bottlenecks!

   Next step: Run `/discovery` to analyze the current code and identify specific performance issues.
   ```

   **DO NOT**:

   - Start optimizing code
   - Show code examples
   - Analyze files in detail
   - Suggest specific optimization techniques

## Scope Limits

This workflow is STRICTLY limited to:

1. Creating the performance task file from template
2. Asking about performance issues and goals
3. Documenting what needs to be optimized
4. Setting up optimization tracking

If the user starts asking technical questions or wants to see code:

- Politely redirect: "Let's first complete the performance task setup. We'll analyze the bottlenecks in the discovery phase."
- Remind them: "Run `/discovery` after this to dive into the performance analysis."

## Important Notes

- **DO NOT start implementing optimizations in this phase**
- **DO NOT analyze existing code yet** (that's for /discovery)
- **DO NOT propose optimization solutions** (that's for /design)
- This workflow ONLY:
  - Creates the performance task file
  - Gathers high-level performance requirements
  - Sets up optimization tracking
  - Points to next step
- Always suggest `/discovery` as the next command
- Keep this phase focused on understanding WHAT to optimize, not HOW

## Example Usage

✅ CORRECT:

```
User: /perf-task MyBookingsForm lag
Assistant: I'll help you set up a performance optimization task for MyBookingsForm lag.

What specific performance issues are you experiencing with MyBookingsForm?
```

❌ WRONG (Too technical in task phase):

```
User: /perf-task MyBookingsForm lag
Assistant: I can see the issue is in the useMemo and countResults function. Let me analyze the statusProps...
```
