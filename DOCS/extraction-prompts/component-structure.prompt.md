
# Component Structure Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every file referenced:
- Extract and include the full, exact code for:
	- All key exports, classes, interfaces, and functions (not just samples)
	- All configuration, initialization, and architectural patterns
	- All relationships to other files and modules (with diagrams or tables if possible)
	- All conventions or patterns used in file organization (with rationale)
	- For the main class, provide the full code, and for each property and method, include:
		- Full code
		- Purpose and rationale
		- Mapping to requirements or user stories if available
	- All implementation details, usage, rationale, and edge cases
	- All architectural patterns, anti-patterns, or legacy artifacts
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- If any code is omitted, explain why and how to obtain it.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
