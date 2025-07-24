
# Logging and Error Handling Details Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each logging and error handling detail:
- What is logged and why? (with full code samples and mapping to requirements)
- What messages are used and what is their context? (show all code for log messages, notification calls, etc., and rationale)
- How do logs relate to business logic, API/data, and form operations? (with all relevant code and rationale)
- Are there analytics or monitoring hooks? (show all code/config and rationale)
- Drill down to the implementation and rationale for each logging path, including code, configuration, and mapping
- Include diagrams or tables for log flow, analytics, and monitoring if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
