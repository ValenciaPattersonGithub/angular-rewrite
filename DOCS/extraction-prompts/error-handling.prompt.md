
# Error Handling and Messaging Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each error handling and messaging mechanism:
- What errors are detected and how? (with full code samples and mapping to requirements)
- How are errors surfaced to the user? (show all code for UI, notifications, error boundaries, etc., and rationale)
- What is the complete flow for error handling? (show all code for try/catch, error boundaries, error propagation, etc., and rationale)
- What messaging is used and why? (show all code for message templates, notification calls, etc., and rationale)
- Are there logging or analytics hooks? (with all relevant code/config and rationale)
- Drill down to the implementation, edge cases, and rationale for each error handling path, including code, configuration, and mapping
- Include diagrams or tables for error flow, messaging, and logging if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
