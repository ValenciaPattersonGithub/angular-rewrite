
# Test Strategy and Requirements Interrogation Prompt

Use the information in `DOCS/extraction/extraction-report.md` as context.

For each test strategy and requirement:

## Output Format
Respond with a markdown report for this category, using headings, bullet points, and code blocks as needed.

# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component's test strategy for rehydration in a modern Nx/Angular workspace.**


For each test aspect (unit, integration, e2e):
- What is the test coverage? (list and show all code for all test cases, with mapping to requirements)
- What are the key test cases? (provide all code samples and rationale)
- Are there any gaps or missing tests? (explain with code context and rationale)
- What are the test utilities, mocks, or helpers used? (show all code/config and rationale)
- What is the test runner and configuration? (show all config files, e.g., Jest, and any setup/teardown logic, with rationale)
- Include diagrams or tables for test coverage, relationships, and gaps if possible
- Explicitly call out any anti-patterns, legacy artifacts, or edge cases

**Remove non-essential details (fonts, colors, legacy-only artifacts).**

**Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.**

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- More detail is better: err on the side of including too much rather than too little.
