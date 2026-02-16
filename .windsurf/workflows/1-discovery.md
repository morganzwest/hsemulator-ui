---
description: Discovery Workflow
---

# Discovery Workflow

## When to use

This workflow activates when:

- User types `/discovery`
- User asks to analyze current code
- User wants to understand what needs to be built

## Prerequisites

- Task must be initialized (check `docs/development/current-task.md`)
- If no task exists, suggest running `/task` first

## Steps

1. **Load task context**

   - Read `docs/development/current-task.md`
   - Identify the objective and affected areas
   - Verify Discovery stage is not already complete

2. **Analyze current codebase**
   Based on task objective, examine:

   - Directory structure in mentioned areas
   - Existing components and patterns
   - Current implementations that might be reused
   - Dependencies and integrations
   - Database schema if relevant

3. **Present current state analysis**
   Format findings as:

   ```
   ## CURRENT STATE ANALYSIS

   ### Existing Components
   - [Component/File]: [What it does]
   - [Component/File]: [What it does]

   ### Relevant Patterns
   - [Pattern name]: [Where it's used]
   - [Pattern name]: [Where it's used]

   ### Dependencies
   - [Package]: [How it's relevant]
   - [Package]: [How it's relevant]

   ### Database/API
   - [Model/Endpoint]: [Current structure]
   ```

4. **Identify gaps**
   Present what's missing:

   ```
   ## GAP ANALYSIS

   ### Components to Create
   - [Component]: [Why needed]
   - [Component]: [Why needed]

   ### Modifications Required
   - [File/Component]: [What needs changing]
   - [File/Component]: [What needs changing]

   ### New Integrations
   - [Integration]: [Purpose]

   ### Technical Challenges
   - [Challenge]: [Why it's complex]
   ```

5. **Ask clarifying questions**
   Always ask:

   - "Are there any existing implementations I should be aware of?"
   - "Any specific patterns or conventions to follow beyond what's in the codebase?"
   - "Are there performance or scale requirements?"
   - "Any third-party services or APIs to integrate?"

6. **Update task file**
   Update the Discovery Notes section in `docs/development/current-task.md`:

   ```markdown
   ## Discovery Notes

   <!-- Updated by /discovery workflow -->

   ### Current State

   - [Summary of what exists]

   ### Gaps Identified

   - [What needs to be built]

   ### Questions & Answers

   - Q: [Question asked]
     A: [User's response]
   ```

7. **Update progress tracker**
   Mark Discovery as complete:

   ```markdown
   | Discovery | ✅ | [Date] | Initial analysis complete |
   ```

8. **Add to decision log**

   ```markdown
   - [Date] Discovery - Completed analysis - [Key findings summary]
   ```

9. **Suggest next step**
   Output:

   ```
   ✅ Discovery Phase Complete

   I've analyzed the current codebase and identified what needs to be built.
   The findings have been documented in `docs/development/current-task.md`.

   Key gaps identified: [Brief summary]

   Next step: Run `/design` to explore implementation options.
   ```

## Important Notes

- Be thorough in analysis but concise in presentation
- Focus on areas relevant to the task objective
- Always update the task file with findings
- Don't make assumptions - ask when uncertain
- Reference specific files and patterns found
- Do not begin implementation.
