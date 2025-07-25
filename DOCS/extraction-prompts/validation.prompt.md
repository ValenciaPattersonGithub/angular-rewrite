

# Validation and Error Handling for Forms Interrogation Prompt

## MAIN DIRECTIVE: DO NOT SUMMARIZE. ALL EXTRACTION MUST INCLUDE PRECISE, EXPLICIT DETAILS FOR EVERY VALIDATION RULE, VALIDATOR, VALUE, AND ERROR MESSAGE. THE PURPOSE IS TO ENABLE CODE GENERATION ON A DIFFERENT PLATFORM. SUMMARIES OR OMISSIONS ARE UNACCEPTABLE.


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For each validation rule and error feedback:
- List every field and its validators with explicit type, value, and code (e.g., `Validators.required`, `Validators.maxLength(64)`).
- For each validator, provide the exact value (e.g., maxLength: 64, pattern: `^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$`).
- For each field, show the exact error message(s) presented to the user for each validation failure, with code and UI binding.
- Show the full code for all validators, error messages, and UI feedback (do not summarize or generalize).
- What are the rules and patterns? (show all code for validators, patterns, etc., and rationale)
- How is feedback provided to the user? (show all code for UI, error messages, etc., and rationale)
- What are the edge cases and business logic? (with all relevant code and rationale)
- Drill down to the implementation and rationale for each validation path, including code, configuration, and mapping
- Include diagrams or tables for validation flow, error feedback, and business logic if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases


**Remove non-essential details (fonts, colors, legacy-only artifacts).**


**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
- **DO NOT SUMMARIZE. DO NOT OMIT ANY DETAIL.**
