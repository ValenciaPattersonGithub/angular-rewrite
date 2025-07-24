
# Component State Management Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each state management aspect (lifecycle, subscriptions, cleanup):
- List all state variables, their types, and initial values (with full code)
- Show the complete flow for initialization and cleanup (with all relevant code)
- How are subscriptions managed? (show code for RxJS, event handlers, etc., and rationale)
- What triggers state changes? (with code, rationale, and mapping to requirements)
- Are there edge cases, race conditions, or concurrency issues? (with code/config and rationale)
- Drill down to the implementation and rationale for each state management path, including code, configuration, and mapping
- Include diagrams or tables for state flow, subscriptions, and cleanup if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
