
# Data Models Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each data model and interface:
- What is the complete definition and usage? (with full code samples and mapping to requirements)
- What fields and types are present? (show all code for interfaces, types, enums, etc., and rationale)
- How is the model used in code? (show all code for usage, binding, transformation, etc., and rationale)
- What are the relationships and dependencies? (with all relevant code/config and rationale)
- Drill down to the implementation and rationale for each data model, including code, configuration, and mapping
- Include diagrams or tables for model relationships and dependencies if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
