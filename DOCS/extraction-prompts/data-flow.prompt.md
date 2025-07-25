
---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# Data Flow and State Management Interrogation Prompt


# Data Flow and State Management Interrogation Prompt
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



For every data flow and state variable:
- Extract and include the full, exact code for:
	- Source and destination of data, with all mapping and transformation logic
	- All data loading, transformation, and storage code
	- All event handlers, subscriptions, and triggers for state changes
	- All state management and synchronization logic (RxJS, forms, etc.)
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for data flow, state changes, and synchronization.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
