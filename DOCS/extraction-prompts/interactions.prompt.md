
# Interactions Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every interaction (child components, services, events):
- Extract and include the full, exact code for:
	- All references and context for each interaction
	- All @Input/@Output, service calls, and event emitters
	- All data and events exchanged, with interface/type definitions
	- All lifecycle logic, with code and diagrams if possible
	- All side effects and dependencies, with code and rationale
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for event/data flow and relationships.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
