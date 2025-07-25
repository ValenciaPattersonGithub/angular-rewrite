
---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# API Interactions Interrogation Prompt

# API Interactions Interrogation Prompt


**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**

## External Context Integration (MANDATORY)
Follow the instructions and checklist in `DOCS/extraction-prompts/external-context.instructions.md` to ensure all available external context is integrated, referenced, and reported as required.
All external context files must be collected from the folder specified by `TARGET_CONTEXT_FOLDER` (and any other relevant context folders).

## Instructions

For every API call, endpoint, and data model:
- Extract and include the full, exact code for:
	- Endpoint URL, HTTP method, and all request/response payloads (interfaces, types, DTOs, etc.)
	- Service call implementation, including all observables, RxJS operators, and error handling logic
	- All error and success handling code, including retries, error messages, and user feedback
	- All mapping between API data and models, with explicit code for every mapping and transformation
	- All configuration, headers, interceptors, and authentication logic
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for API flow, data mapping, and error handling.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
- Add a section at the end of the report:
  - "External Context Utilized"
    - List all external files used (with relative paths)
    - Summarize key findings from external context
    - Note any discrepancies or enhancements over code-only extraction
