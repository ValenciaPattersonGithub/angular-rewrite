
---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# Dependencies Interrogation Prompt


# Dependencies Interrogation Prompt
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

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every dependency (Angular, third-party, app services, injected data):
- Extract and include the full, exact code for:
	- All import paths and actual import statements
	- All usage, injection, and configuration code
	- All rationale for each dependency, with mapping to requirements
	- All alternatives or best practices for modern platforms
	- All version numbers and configuration from package.json or lock files
	- All peer, dev, and transitive dependencies
	- All legacy or deprecated dependencies, with rationale and alternatives
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any tables or diagrams for dependency relationships.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include tables, diagrams, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
