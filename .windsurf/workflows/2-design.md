---
description: Design Workflow
---

# Design Workflow

## When to use

This workflow activates when:

- User types `/design`
- User asks for implementation options
- User wants to explore different approaches

## Prerequisites

- Discovery must be complete (check `docs/development/current-task.md`)
- If Discovery not done, suggest running `/discovery` first

## Steps

1. **Load context**

   - Read `docs/development/current-task.md`
   - Review Discovery findings (current state and gaps)
   - Verify Design stage is not already complete

2. **Generate design alternatives**
   Based on gaps identified, create 2-3 distinct approaches:

   ```
   ## DESIGN OPTIONS

   ### Option A: [Descriptive Name]
   **Approach:** [High-level description]

   **Implementation Details:**
   - [Key implementation point]
   - [Key implementation point]

   **Pros:**
   - ✅ [Advantage]
   - ✅ [Advantage]

   **Cons:**
   - ❌ [Disadvantage]
   - ❌ [Disadvantage]

   **Effort:** ⭐⭐⭐ (1-5 scale)
   **Risk:** Low/Medium/High

   ---

   ### Option B: [Descriptive Name]
   [Same structure]

   ---

   ### Option C: [Descriptive Name]
   [Same structure]
   ```

3. **Provide comparison matrix**

   ```
   ## COMPARISON

   | Aspect | Option A | Option B | Option C |
   |--------|----------|----------|----------|
   | Development Time | [Estimate] | [Estimate] | [Estimate] |
   | Complexity | [Level] | [Level] | [Level] |
   | Maintainability | [Rating] | [Rating] | [Rating] |
   | Performance | [Rating] | [Rating] | [Rating] |
   | Scalability | [Rating] | [Rating] | [Rating] |
   ```

4. **Ask for decision**
   Questions to ask:

   - "Which option aligns best with your priorities?"
   - "Would you like me to elaborate on any option?"
   - "Should we combine aspects from multiple options?"
   - "Are there other approaches you'd like me to consider?"

5. **Document decision**
   Once user selects an approach:

   - Confirm the choice
   - Ask for any modifications to the selected approach
   - Document reasons for selection

6. **Update task file**
   Update the Design Decisions section in `docs/development/current-task.md`:

   ```markdown
   ## Design Decisions

   <!-- Updated by /design workflow -->

   ### Selected Approach

   - **Option:** [Selected option name]
   - **Key Points:** [Main implementation details]

   ### Rationale

   - [Why this option was chosen]
   - [Key benefits expected]

   ### Rejected Alternatives

   - Option [X]: [Why rejected]
   - Option [Y]: [Why rejected]
   ```

7. **Update progress tracker**
   Mark Design as complete:

   ```markdown
   | Design | ✅ | [Date] | Selected: [approach name] |
   ```

8. **Add to decision log**

   ```markdown
   - [Date] Design - Selected [approach name] - [Brief rationale]
   ```

9. **Create implementation plan**
   Break down the selected approach:

   ```
   ## IMPLEMENTATION PLAN

   1. [First component/task]
      - Create [file/component]
      - Implement [functionality]

   2. [Second component/task]
      - Modify [existing file]
      - Add [new feature]

   3. [Continue...]
   ```

10. **Suggest next step**
    Output:

    ```
    ✅ Design Phase Complete

    Selected approach: [Name]

    I've documented the decision and created an implementation plan in `docs/development/current-task.md`.

    Next step: Run `/implement` to start building the solution.

    Would you prefer incremental implementation (with checkpoints) or continuous?
    ```

## Important Notes

- Always provide meaningful alternatives, not just variations
- Consider existing code and patterns from discovery
- Be realistic about effort and complexity estimates
- Document why alternatives were rejected
- Break down implementation into clear steps
