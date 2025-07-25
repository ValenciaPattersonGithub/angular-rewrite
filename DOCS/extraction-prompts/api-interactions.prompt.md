
# API Interactions Interrogation Prompt


# DNA-Level Extraction Instructions

**You are extracting the full DNA of the component for rehydration in a modern Nx/Angular workspace.**



For every API call, endpoint, and data model:
- Extract and include the full, exact code for:
	- Endpoint URL, HTTP method, and all request/response payloads (interfaces, types, DTOs, etc.)
	- Service call implementation, including all observables, RxJS operators, and error handling logic
	- All error and success handling code, including retries, error messages, and user feedback
	- All mapping between API data and models, with explicit code for every mapping and transformation
	- All configuration, headers, interceptors, and authentication logic
	- All edge cases, anti-patterns, and legacy artifacts (with code and rationale)
- Do not summarize or omit any code. If code is referenced, include the full code block. If code is generated dynamically, show the generator and the output.
- For each item, provide rationale, mapping to requirements, and any diagrams or tables for API flow, data mapping, and error handling.
- Reference the rehydration guidance and checklist in `DOCS/system.prompt.md`.

**Output Format:**
- Use markdown with clear headings, bullet points, and code blocks for all code and configuration samples.
- All file references must use complete relative paths from the workspace root.
- Include diagrams, tables, and rationale sections as appropriate.
- No summaries or omissions. Err on the side of including too much detail.
