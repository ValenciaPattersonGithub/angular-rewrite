
# Interactions Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**


For each interaction (child components, services, events):
- Provide the complete reference and context (with full code samples)
- Show how the component communicates with it (all @Input/@Output, service calls, event emitters, etc. with full code)
- What data or events are exchanged? (with full code and interface/type definitions)
- What is the lifecycle of the interaction? (when/how does it occur, with code and diagrams if possible)
- Are there any side effects or dependencies? (with code and rationale)
- Drill down to the implementation and rationale for each interaction, including code, configuration, and mapping to requirements
- Include diagrams or tables for event/data flow and relationships
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
