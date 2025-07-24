
# Data Flow and State Management Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each data flow and state variable:
- What is the source and destination of data? (with full code samples and mapping to requirements)
- How is data loaded, transformed, and stored? (show all code for data loading, transformation, storage, and rationale)
- What triggers state changes? (show all code for event handlers, subscriptions, etc., and rationale)
- How is state managed and synchronized? (show all code for state variables, RxJS, forms, etc., and rationale)
- Drill down to the implementation, edge cases, and rationale for each state variable, including code, configuration, and mapping
- Include diagrams or tables for data flow, state changes, and synchronization if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
