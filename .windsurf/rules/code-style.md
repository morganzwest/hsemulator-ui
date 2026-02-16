---
trigger: manual
---

Component Architecture: Use shadcn/ui exclusively, composition over inheritance, single responsibility
Styling Rules: Tailwind CSS only, no custom CSS files except globals.css
Try not to create a file longer than 200 lines of code. Break large components into smaller ones.
Organize code into clearly separated modules grouped by feature or responsibility
Component types: UI components (shadcn/ui only), Feature components (business logic), Layout components (page structure)
Use Tailwind CSS exclusively for styling
Use shadcn/ui components as building blocks - never modify them directly
CSS variables: Use shadcn/ui's CSS custom properties for theming
Responsive design: Use Tailwind's responsive utilities (sm:, md:, lg:, xl:)
Custom CSS files: No .css files except globals.css
Inline styles: No style prop usage
CSS-in-JS: No styled-components or emotion
Modified shadcn/ui: Never edit components/ui/ files
Add inline comments explaining the why, not just the what
Never assume missing context. Ask questions if uncertain.
Never hallucinate libraries or functions – only use known, verified packages.
Always confirm file paths and module names exist before referencing them in code or tests.
Never delete or overwrite existing code unless explicitly instructed to.
Always write code in English, even when communication is in another language.
