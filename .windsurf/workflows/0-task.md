---
description: Task Initialization Workflow
---

# Task Initialization Workflow

## When to use

This workflow activates when:

- User types `/task [name]`
- User mentions starting a new feature or task
- User asks to initialize a new work item

## What this workflow does

- ✅ Creates task tracking file
- ✅ Gathers requirements and objectives
- ✅ Sets up project structure for tracking
- ❌ Does NOT analyze code
- ❌ Does NOT implement anything
- ❌ Does NOT propose technical solutions

## Steps

1. **Check for existing task**

   - Read `docs/development/current-task.md`
   - If task exists, ask: "There's already an active task. Would you like to:
     - Continue with existing task
     - Archive and start new task
     - View current task status"

2. **Initialize new task**
   If creating new task:

   - Ask for task name if not provided
   - Create/update `docs/development/current-task.md` with this template:

   ```markdown
   # Current Task: [Task Name]

   ## Overview

   **Objective:** [To be filled after gathering requirements]
   **Success Criteria:** [To be filled after gathering requirements]
   **Started:** [Today's date]
   **Status:** 🔄 In Progress

   ## Progress Tracker

   | Stage            | Status | Completed | Notes |
   | ---------------- | ------ | --------- | ----- |
   | Discovery        | ⏳     | -         | -     |
   | Design           | ⏳     | -         | -     |
   | Implementation   | ⏳     | -         | -     |
   | Clean & Refactor | ⏳     | -         | -     |
   | Testing          | ⏳     | -         | -     |
   | Documentation    | ⏳     | -         | -     |

   ## Discovery Notes

   <!-- Updated by /discovery workflow -->

   ### Current State

   -

   ### Gaps Identified

   -

   ### Questions & Answers

   -

   ## Design Decisions

   <!-- Updated by /design workflow -->

   ### Selected Approach

   -

   ### Rationale

   -

   ### Rejected Alternatives

   -

   ## Implementation Log

   <!-- Updated by /implement workflow -->

   ### Changes Made

   -

   ### Key Files Modified

   -

   ### Challenges Faced

   -

   ## Cleanup Summary

   <!-- Updated by /clean workflow -->

   ### Dead Code Removed

   -

   ### Refactorings Applied

   -

   ### Legacy Code Identified

   -

   ## Test Coverage

   <!-- Updated by /test workflow -->

   ### Tests Created

   -

   ### Coverage Areas

   -

   ### Test Results

   -

   ## Documentation Updates

   <!-- Updated by /document workflow -->

   ### Files Updated

   -

   ### New Docs Created

   -

   ## Decision Log

   <!-- Running log of all decisions -->

   - [Today's date] Task Init - Created task: [name] - [reason/context]
   ```

3. **Gather requirements**
   Ask the user (keep questions high-level):

   - "What's the main objective of this task?"
   - "What defines success for this feature?"
   - "Who will use this feature?"
   - "Any important deadlines or constraints?"

   Do NOT ask about:

   - Technical implementation details
   - Specific code patterns
   - Which files to modify
   - How to build it

4. **Update task file**
   Fill in the Overview section:

   ```markdown
   ## Overview

   **Objective:** [User's response]
   **Success Criteria:** [User's criteria]
   **Started:** [Today's date]
   **Status:** 🔄 In Progress
   ```

5. **Add to decision log**

   ```markdown
   ## Decision Log

   - [Date] Task Init - Created task: [name] - [reason/context]
   ```

6. **Confirm and suggest next step**
   Output:

   ```
   ✅ Task initialized: [name]

   I've created `docs/development/current-task.md` to track our progress.

   Objective: [What user described]
   Success Criteria: [What user defined]

   Ready to analyze the codebase!

   Next step: Run `/discovery` to analyze the current code and identify what needs to be built.
   ```

   **DO NOT**:

   - Start coding
   - Show code examples
   - Analyze files
   - Suggest technical approaches

## Scope Limits

This workflow is STRICTLY limited to:

1. Creating the task file from template
2. Asking about business objectives
3. Documenting what the user wants
4. Setting up tracking

If the user starts asking technical questions or wants to see code:

- Politely redirect: "Let's first complete the task setup. We'll analyze the code in the discovery phase."
- Remind them: "Run `/discovery` after this to dive into the technical details."

## Important Notes

- **DO NOT start implementing code in this phase**
- **DO NOT analyze existing code yet** (that's for /discovery)
- **DO NOT propose solutions** (that's for /design)
- This workflow ONLY:
  - Creates the task file
  - Gathers high-level requirements
  - Sets up tracking
  - Points to next step
- Always suggest `/discovery` as the next command
- Keep this phase focused on understanding WHAT to build, not HOW

## Example of what NOT to do

❌ WRONG (Too technical in task phase):

```
User: /task notification system
Cascade: I'll analyze your components folder and create a Toast component using...
```

✅ CORRECT (Stay high-level):

```
User: /task notification system
Cascade: I'll help you set up a new task for a notification system.
What's the main objective of this notification system?
```
