# DNA Extraction External Context Checklist

## Purpose
This checklist ensures that all available external context is considered and integrated into every step of the DNA extraction and reporting process.

---

## Checklist

- [ ] Collect all files from `DOCS/extractions/<target>/context/` and any other relevant external context folders.
- [ ] For each extraction prompt, include both source code and all external context as input.
- [ ] For each finding or detail, indicate whether it was derived from source code, external context, or both.
- [ ] If external context provides details not present in code, include them in the report with explicit attribution.
- [ ] If there are conflicts or discrepancies between code and external context, document and flag them for review.
- [ ] In each category report, add a section:
  - "External Context Utilized"
    - List all external files used (with relative paths)
    - Summarize key findings from external context
    - Note any discrepancies or enhancements over code-only extraction
- [ ] Ensure all file references (code or external) use complete relative paths.
- [ ] The final aggregated report must include a summary of all external context sources used and how they contributed to the findings.

---

## Instructions
- Use this checklist during every run of the DNA extraction workflow.
- Mark each item as complete before finalizing any report or extraction output.
- Reference this checklist in all extraction prompts and report templates.

---

*This checklist is required for completeness and traceability of the DNA extraction process.*
