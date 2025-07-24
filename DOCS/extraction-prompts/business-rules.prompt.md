
# Business Rules and Logic Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each business rule and logic:
- What is the rule and its business context? (with full code samples and mapping to requirements)
- How is it enforced in code? (show all code for enforcement, guards, validation, etc., and rationale)
- What are the edge cases and exceptions? (with all relevant code and rationale)
- What is the rationale and impact? (explain with code/config and mapping)
- Drill down to the implementation and rationale for each business rule, including code, configuration, and mapping
- Include diagrams or tables for rule flow, enforcement, and exceptions if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
