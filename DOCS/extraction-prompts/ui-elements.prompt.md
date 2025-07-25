
# User Interface Elements Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every UI element (tabs, forms, modals, navigation):
- Extract and include the full, exact code for:
	- All template references, with code and mapping to requirements
	- All purpose and behavior logic, with code and rationale
	- All rendering and update logic, including bindings and change detection
	- All event bindings, handlers, and rationale
	- All accessibility and usability considerations, with code and rationale
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for UI structure, event flow, and accessibility.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
