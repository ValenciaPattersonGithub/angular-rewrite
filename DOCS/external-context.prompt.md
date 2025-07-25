# External Context Integration Prompt

## Goal

> Integrate all available external context into the DNA extraction process, ensuring comprehensive and traceable reports.

When running the DNA extraction workflow (see #file:system.prompt.md) against a target such as `src\patient\patient-registration\registration-landing`, the process currently uses only the source code as its primary context. However, additional context may exist in the form of unstructured documents (e.g., PDFs, Confluence exports) containing:

- Test cases and QA information
- API specifications and documentation
- Data models and schemas
- Backend-for-frontend (BFF) API details
- User stories, requirements, or business rules

This external context is often critical for a complete and accurate extraction, but is not always structured or directly referenced in the codebase.

## Integration Requirements

**The extraction and reporting process must:**

1. **Explicitly include all available external context** (from `DOCS/extractions/<target>/context/` and similar folders) alongside source code when:
	- Executing extraction prompts (e.g., `DOCS/extraction-prompts/*.prompt.md`)
	- Generating category reports (e.g., `DOCS/extractions/registration-landing/*.report.md`)
	- Performing review or aggregation steps (e.g., `DOCS/review-system-output.prompt.md`)

2. **For each category and report:**
	- Reference and synthesize information from both the source code and all relevant external context files.
	- Clearly indicate, for each finding or detail, whether it was derived from source code, external context, or both.
	- If external context provides details not present in code (e.g., additional test cases, undocumented API fields, business rules), these must be included in the report, with explicit attribution.
	- If there are conflicts or discrepancies between code and external context, document them and flag for review.

3. **Prompt and report updates:**
	- Update all extraction prompts to instruct the process to always review and incorporate external context files, not just code.
	- In each category report, add a section summarizing how external context was used, and list all external files referenced (with relative paths).
	- If new prompts or review steps are needed to reconcile or merge external context with code-based findings, create and document them.

4. **Completeness and traceability:**
	- Ensure that every aspect of the DNA extraction (all 15 categories) is informed by the union of code and external context.
	- All file references (code or external) must use complete relative paths.
	- The final aggregated report must include a summary of all external context sources used, and how they contributed to the findings.

## Example Integration Steps

1. **Preparation:**  
	- Collect all files from `DOCS/extractions/<target>/context/` and any other relevant external context folders.
	- For each extraction prompt, pass both the code and the external context as input.

2. **During Extraction:**  
	- When extracting (e.g., API Interactions), if the external context contains additional endpoints or payload details not in code, include them in the report, noting their source.
	- For test strategy, merge test cases from code and external documents, and highlight any gaps or overlaps.

3. **Reporting:**  
	- In each category report, add a section:
	  - "External Context Utilized"  
		 - List all external files used (with relative paths)
		 - Summarize key findings from external context
		 - Note any discrepancies or enhancements over code-only extraction

4. **Review:**  
	- During review or aggregation, ensure that all findings are cross-checked between code and external context.
	- If external context suggests changes or additions to the codebase, flag these for follow-up.

## Suggestions for Implementation

- Update all extraction prompts to require the inclusion and explicit referencing of external context.
- Add a checklist to each report template to ensure external context is always considered.
- If needed, create a new prompt or script to reconcile and merge findings from code and external context, especially for categories like API, models, and test strategy.
- Encourage reviewers to always check the "External Context Utilized" section for completeness and traceability.

---

This approach ensures that the DNA extraction process is comprehensive, traceable, and leverages all available information—making the resulting reports and requirements as robust and actionable as possible.