# Models (Inferred/Explicit) Interrogation Prompt

---
requiredInputs:
	- name: TARGET_CONTEXT_FOLDER
		type: string
		description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

# Models (Inferred/Explicit) Interrogation Prompt
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

**You are extracting the full DNA of all models (explicit or inferred) used for forms, patchValue, data binding, and business logic in the component for rehydration in a modern Nx/Angular workspace.**


For every model (interface, class, type, or inferred object):
- Extract and include the full, exact code for:
	- All models used for forms, patchValue, data binding, and business logic
	- All model definitions, imports, and inferred structures
	- All property mappings to forms, patchValue, and business logic
	- All transformations, mappings, and conversions between models and forms
	- All business logic and rationale for each model and property
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for model structure, property relationships, and data flow.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
