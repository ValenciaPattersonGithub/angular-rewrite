
---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# Business Rules and Logic Interrogation Prompt

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**

## External Context Integration (MANDATORY)
Follow the instructions and checklist in `DOCS/extraction-prompts/external-context.instructions.md` to ensure all available external context is integrated, referenced, and reported as required.
All external context files must be collected from the folder specified by `TARGET_CONTEXT_FOLDER` (and any other relevant context folders).

## Instructions

For every business rule and logic:
- Extract and include the full, exact code for:
	- The rule implementation, including all guards, validation, and enforcement logic
	- All edge cases, exceptions, and error handling code
	- All mapping to requirements, user stories, and business context
	- All configuration, constants, and supporting code
	- All rationale and impact, with explicit code and mapping
	- All anti-patterns, legacy artifacts, and edge cases (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for rule flow, enforcement, and exceptions.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
