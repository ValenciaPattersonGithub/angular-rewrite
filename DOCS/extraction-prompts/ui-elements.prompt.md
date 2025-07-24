
# User Interface Elements Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each UI element (tabs, forms, modals, navigation):
- Provide the complete reference in the template (with full code samples and mapping to requirements)
- What is its purpose and behavior? (with all code and template snippets, and rationale)
- How is it rendered and updated? (show all code for bindings, change detection, etc., and rationale)
- What events or data does it handle? (show all code for event bindings, handlers, etc., and rationale)
- Are there accessibility or usability considerations? (with all code/config and rationale)
- Drill down to the implementation and rationale for each UI element, including code, configuration, and mapping
- Include diagrams or tables for UI structure, event flow, and accessibility if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
