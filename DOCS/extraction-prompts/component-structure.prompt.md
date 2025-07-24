
# Component Structure Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each file referenced, extract and include:
- Complete relative path
- File type and role
- All key exports, classes, interfaces, and functions (provide the full code for each, not just samples)
- All configuration, initialization, and architectural patterns (with full code)
- Relationships to other files and modules (with diagrams or tables if possible)
- Any conventions or patterns used in file organization (with rationale)
- For the main class, provide the full code, and for each property and method, include:
	- Full code
	- Purpose and rationale
	- Mapping to requirements or user stories if available
- For each item, drill down to implementation details, usage, rationale, and edge cases
- Include diagrams or tables for structure, relationships, and data flow where possible
- Explicitly call out any architectural patterns, anti-patterns, or legacy artifacts
- If any code is omitted, explain why and how to obtain it

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
