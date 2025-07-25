
# Test Strategy and Requirements Interrogation Prompt

Use the information in `DOCS/extraction/extraction-report.md` as context.

For each test strategy and requirement:

## Output Format
Respond with a markdown report for this category, using headings, bullet points, and code blocks as needed.

---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# Test Strategy and Requirements Interrogation Prompt
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

## External Context Integration (MANDATORY)
Follow the instructions and checklist in `DOCS/extraction-prompts/external-context.instructions.md` to ensure all available external context is integrated, referenced, and reported as required.
All external context files must be collected from the folder specified by `TARGET_CONTEXT_FOLDER` (and any other relevant context folders).

For every test aspect (unit, integration, e2e):
- Extract and include the full, exact code for:
	- All test cases, with mapping to requirements
	- All key test cases, with code and rationale
	- All test utilities, mocks, and helpers
	- All test runner and configuration files (e.g., Jest, setup/teardown logic)
	- All gaps or missing tests, with code context and rationale
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for test coverage, relationships, and gaps.
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
