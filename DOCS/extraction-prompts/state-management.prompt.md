
# Component State Management Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every state management aspect (lifecycle, subscriptions, cleanup):
- Extract and include the full, exact code for:
	- All state variables, types, and initial values
	- All initialization and cleanup logic
	- All subscription management code (RxJS, event handlers, etc.)
	- All triggers for state changes, with code and rationale
	- All edge cases, race conditions, and concurrency issues (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for state flow, subscriptions, and cleanup.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
