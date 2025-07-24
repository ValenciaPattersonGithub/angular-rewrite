
# API Interactions Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each API call and data model:
- What is the complete endpoint and method? (with full code samples and mapping to requirements)
- What data is sent and received? (show all code for request/response payloads, interfaces, types, etc.)
- How is the API integrated and handled? (show all code for service calls, observables, error handling, etc., and rationale)
- What are the error and success paths? (show all code for handling responses, errors, retries, etc., and rationale)
- Drill down to the implementation, edge cases, and rationale for each API interaction, including code, configuration, and mapping
- Include diagrams or tables for API flow, data mapping, and error handling if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
