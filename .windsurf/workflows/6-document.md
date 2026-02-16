---
description: Documentation Workflow
---

---
description: Documentation Workflow
---

# Documentation Workflow

## When to use
This workflow activates when:
- User types `/document`
- All implementation and testing is complete
- User wants to update project documentation

## Prerequisites
- Testing should be complete (check `docs/development/current-task.md`)
- Feature should be fully functional
- If Testing not done, suggest running `/test` first

## Steps

1. **Load context**
   - Read `docs/development/current-task.md`
   - Review all changes made during task
   - Identify what was built and modified
   - Check existing documentation structure

2. **Analyze documentation needs**
   Scan project for documentation files:
   ```
   ## DOCUMENTATION AUDIT
   
   ### Files to Update
   - [ ] `README.md` - Project overview
   - [ ] `docs/ARCHITECTURE.md` - Architecture changes
   - [ ] `docs/API.md` - API documentation
   - [ ] `CHANGELOG.md` - Version history

   ```

3. **Generate documentation updates**
   For each file, prepare updates:
   
   ```markdown
   ## PROPOSED DOCUMENTATION CHANGES
   
   ### README.md
   **Add to Features section:**
   - [New feature name] - [Brief description]
   
   **Update Usage section:**
   ```example
   // Example code showing how to use new feature
   ```
   
   ### docs/ARCHITECTURE.md
   **Add to Components section:**
   - Describe new architectural components
   - Update data flow diagrams
   - Document new patterns introduced
   
   ### CHANGELOG.md
   **Add entry:**
   ```
   ## [Version] - [Date]
   ### Added
   - [Feature]: [Description of what was added]
   ### Changed
   - [Component]: [What changed and why]
   ### Fixed
   - [Issue]: [What was fixed]
   ```
   ```

4. **Show documentation preview**
   Present proposed changes using diff format:
   ```diff
   // README.md
   ## Features
   - Existing feature 1
   - Existing feature 2
   + - **[New Feature]**: [Description of capabilities]
   
   ## Usage
   + ### Using [New Feature]
   + [Explanation with code example]
   ```

5. **Get approval**
   Ask the user:
   - "Do these documentation updates look complete?"

6. **Apply approved changes**
   - Update each documentation file

7. **Create technical documentation if needed**
   For complex features, create developer-focused docs in `docs/technical/[feature-name].md`:
   ```markdown
   ## docs/technical/[feature-name].md
   
   # [Feature Name] - Technical Documentation
   
   ## Architecture
   [Technical design and implementation details]
   
   ## API Endpoints Used
   - `GET /api/endpoint` - [Purpose]
   - `POST /api/endpoint` - [Purpose]
   - `PUT /api/endpoint` - [Purpose]
   
   ## Data Flow
   [How data moves through the system]
   
   ## Integration Guide
   [How to integrate with other systems/components]
   
   ## Performance Considerations
   [Benchmarks, optimization tips, limitations]
   
   ## Development Notes
   [Implementation decisions, future improvements]
   ```

8. **Create user guide**
   Create user-friendly documentation in `docs/user_manuals/[feature-name].md`:
   ```markdown
   # [Feature] User Guide
   
   ## Overview
   [Brief description of the feature and its purpose]
   
   ## Features
   - **[Key Feature 1]**: [Description]
   - **[Key Feature 2]**: [Description]
   - **[Key Feature 3]**: [Description]
   
   ## How to Use
   1. **[Step 1]**: [Instructions]
   2. **[Step 2]**: [Instructions]
   3. **[Step 3]**: [Instructions]
   
   ## Tips
   - [Helpful tip 1]
   - [Helpful tip 2]
   - [Helpful tip 3]
   
   ## Troubleshooting
   - [Common issue and solution]
   - [Common issue and solution]
   ```

9. **Update task file**
   Update Documentation section in `docs/development/current-task.md`:
   ```markdown
   ## Documentation Updates
   <!-- Updated by /document workflow -->
   ### Files Updated
   - `README.md` - Added feature description and usage
   - `CHANGELOG.md` - Added version entry
   - `docs/ARCHITECTURE.md` - Updated component diagram
   
   ### New Docs Created
   - `docs/technical/[feature].md` - Technical implementation guide
   - `docs/user_manuals/[feature].md` - User-friendly guide
   
   ### Key Sections Added
   - Usage examples
   - API reference
   - Configuration options
   ```

10. **Final task summary**
    Output:
    ```
    ✅ Documentation Phase Complete
    ✅ TASK FULLY COMPLETE!
    
    ## Documentation Summary:
    - 📝 Updated: [X] documentation files
    - 📄 Created: [Y] new documentation files
    - 📚 Added: Code examples and usage guides
    - 🔗 Cross-references: Updated all related docs
    
    The task "[Task Name]" is now complete! 🎉
    
    To start a new task, run `/task [new task name]`
    ```

## Documentation Standards
- Use clear, concise language
- Include practical examples
- Document both what and why
- Keep examples up-to-date
- Use consistent formatting
- Include visual aids where helpful
- Consider the audience (developers, users, etc.)

## Important Notes
- Always update CHANGELOG.md for any changes
- Keep README.md beginner-friendly
- Ensure code examples actually work
- Document any breaking changes clearly
- Update any affected API documentation