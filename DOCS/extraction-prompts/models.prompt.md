# Models (Inferred/Explicit) Interrogation Prompt

# DNA-Level Extraction Instructions

**You are extracting the full DNA of all models (explicit or inferred) used for forms, patchValue, data binding, and business logic in the component for rehydration in a modern Nx/Angular workspace.**

For each model (interface, class, type, or inferred object):
- Identify and list all models used for forms, patchValue, data binding, and business logic (with full code and structure)
- Show how each model is defined, imported, or inferred (with code and rationale)
- Map each model property to its usage in forms, patchValue, and business logic (with code and mapping)
- Document all transformations, mappings, or conversions between models and forms (with code and rationale)
- Explain the purpose and business logic behind each model and property (with mapping to requirements)
- Include diagrams or tables for model structure, property relationships, and data flow if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
