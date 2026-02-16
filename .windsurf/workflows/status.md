---
description: Get current progress
---

# Status Workflow

## When to use
This workflow activates when:
- User types `/status`
- User asks about current progress
- User wants to see task overview
- User asks "where are we?" or similar

## Prerequisites
- None - can be run at any time
- If no active task exists, inform user

## Steps

1. **Check for active task**
   - Read `docs/development/current-task.md`
   - If file doesn't exist, output:
     ```
     ❌ No Active Task
     
     There's no task currently in progress.
     To start a new task, run: /task [name]
     ```

2. **Load task information**
   Extract from current task file:
   - Task name and objective
   - Current stage
   - Completed stages
   - Recent decisions
   - Any blockers

3. **Calculate progress**
   Count completed stages:
   - Total stages: 6 (Discovery, Design, Implementation, Clean, Test, Document)
   - Completed: Count ✅ marks
   - Progress percentage: (completed/total) * 100

4. **Generate status report**
   Format as:
   ```
   ## 📊 Task Status Report
   
   **Task:** [Task Name]
   **Started:** [Date]
   **Progress:** ▓▓▓▓▓░░░░░ [X]% Complete
   
   ### 📈 Stage Progress
   | Stage | Status | Completed | Last Update |
   |-------|--------|-----------|-------------|
   | Discovery | ✅ | [Date] | Initial analysis complete |
   | Design | ✅ | [Date] | Selected: [approach] |
   | Implementation | 🔄 | - | In progress |
   | Clean & Refactor | ⏳ | - | Pending |
   | Testing | ⏳ | - | Pending |
   | Documentation | ⏳ | - | Pending |
   
   ### 🎯 Current Focus
   **Active Stage:** Implementation
   **Status:** [Current status from notes]
   **Next Step:** [Suggested command based on current stage]
   
   ### 📝 Recent Decisions
   - [Most recent 3-5 decisions from log]
   
   ### 🚧 Blockers (if any)
   - [Any noted blockers]
   ```

5. **Provide actionable next steps**
   Based on current stage:
   ```
   ### 💡 Recommended Actions
   
   Based on your current progress:
   - Continue with: `/[current stage command]`
   - Or skip to: `/[next stage]` (if current is optional)
   - Review details in: `docs/development/current-task.md`
   ```

6. **Show quick stats**
   If implementation or beyond:
   ```
   ### 📊 Quick Stats
   - Files created: [Count from implementation log]
   - Files modified: [Count]
   - Tests written: [Count from test log]
   - Documentation updated: [Count]
   ```

## Status Report Variations

### If task is complete:
```
## ✅ Task Complete!

**Task:** [Task Name]
**Completed:** [Date]
**Duration:** [Days/Hours]

All stages successfully completed. 
Ready to start a new task with: /task [name]
```

### If task is blocked:
```
## ⚠️ Task Blocked

**Blocker:** [Description]
**Stage:** [Where blocked]

Action needed: [What needs to be resolved]
```

### If task is stale (no updates in 7+ days):
```
## 💤 Task Inactive

Last update was [X] days ago.
Would you like to:
- Continue where you left off
- Archive and start fresh
- Review what was done
```

## Advanced Status Options

If user asks for more detail:
- `/status detailed` - Show full notes from each stage
- `/status summary` - Just the progress bar and next step
- `/status timeline` - Show chronological decision log

## Important Notes
- Always show actionable next steps
- Keep status concise but informative
- Highlight any blockers prominently
- Use visual indicators (emojis, progress bars)
- Suggest appropriate commands based on current state