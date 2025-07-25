# Forms (Angular FormGroups/FormControls) Interrogation Prompt

# DNA-Level Extraction Instructions

**You are extracting the full DNA of all Angular forms (FormGroups, FormControls, FormArrays) in the component for rehydration in a modern Nx/Angular workspace.**


For every form, form group, and form control:
- Extract and include the full, exact code for:
	- All FormGroups, FormControls, and FormArrays, with their structure and initialization
	- All patchValue, get, setValue, and dynamic form logic
	- All validators, validation logic, and error messages
	- All mapping between form fields and model properties
	- All business logic and rationale for each form and field
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for form structure, field relationships, and validation.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
