
---
## Review System Output Prompt (Enhanced)
requiredInputs:
      - name: EXTRACTION_REPORTS_FOLDER
         type: string
         description: "Relative path to the folder containing the extracted category reports (e.g., DOCS/extractions/registration-landing)."
      - name: CATEGORY_PROMPTS_FOLDER
         type: string
         description: "Relative path to the folder containing the category prompts (e.g., DOCS/extraction-prompts)."
      - name: TARGET_SOURCE
         type: string
         description: "Relative path to the source code folder or files that were the basis for extraction (e.g., src/patient/patient-registration/registration-landing)."
usage: |
    Specify the following when running the review workflow:
         1. EXTRACTION_REPORTS_FOLDER: the folder containing the extracted reports
         2. CATEGORY_PROMPTS_FOLDER: the folder containing the category prompts
         3. TARGET_SOURCE: the folder or files that were the basis for extraction
    All references in prompts and reports will use the provided value(s).
---


# Review System Output Prompt

## INPUTS

```markdown
Execute: #file:review-system-output.prompt.md 
EXTRACTION_REPORTS_FOLDER: DOCS\extractions\registration-landing
CATEGORY_PROMPTS_FOLDER: DOCS\extraction-prompts
TARGET_SOURCE: src\patient\patient-registration\registration-landing
```

## Purpose

This prompt is intended to be run after the #file:system.prompt.md, which generates extraction reports in `${EXTRACTION_REPORTS_FOLDER}` for each category prompt in `${CATEGORY_PROMPTS_FOLDER}`, based on the source code in `${TARGET_SOURCE}`.


## Pre-requisite

Before beginning the review process, ensure that the required input variables (`${EXTRACTION_REPORTS_FOLDER}`, `${CATEGORY_PROMPTS_FOLDER}`, and `${TARGET_SOURCE}`) are set and point to valid, existing assets:
   - `${EXTRACTION_REPORTS_FOLDER}` must exist and contain the extracted category reports to be reviewed.
   - `${CATEGORY_PROMPTS_FOLDER}` must exist and contain the category prompt files.
   - `${TARGET_SOURCE}` must exist and represent the source code folder or files used for extraction.
If any of these assets are missing or invalid, halt the review and report the issue.



## Instructions

1. For **each extracted report** in `${EXTRACTION_REPORTS_FOLDER}`:
1. For **each file matching `*.report.md` in `${EXTRACTION_REPORTS_FOLDER}`**:
   - **Read and understand the corresponding category prompt** from `${CATEGORY_PROMPTS_FOLDER}` (if one exists) to clarify the intent, required details, and expected structure for that report.
   - **Thoroughly review the report** for accuracy, completeness, and alignment with both the category prompt and the actual source code in `${TARGET_SOURCE}`.
   - **Use the content of all other `*.report.md` files as context**: cross-reference details, fill in missing information, resolve inconsistencies, and ensure that related rules, dependencies, and errors are consistently described and linked across reports.
   - **Update and enhance the existing report content** (do not append or duplicate sections):
      - Add missing or additive information, especially where the category prompt or other reports indicate more detail is needed.
      - Correct inaccuracies or outdated information.
      - Ensure clarity, precision, and consistency in terminology and structure.
      - Explicitly cross-link related rules, errors, dependencies, and business logic for traceability (e.g., "See Validation Report, Section 2.1").
      - Add explicit code examples, diagrams, or tables where they clarify or illustrate key points.
      - Document any technical debt, legacy patterns, or migration recommendations if relevant.
   - **Document the changes made** to each report (add a brief summary at the end of each report or in a change log section).

2. The review workflow must perform updates on all reports automatically, without requiring human intervention for each file.

3. After all reports are updated:
   - Provide a **concise review summary** in the output of this prompt, including:
      - Overall quality feedback.
      - Notable improvements made during this review step.
      - Any remaining gaps, technical debt, or suggestions for future extraction runs.
      - A summary of the specific changes made to each report.
   - Include the following todo list for future improvements:

```
- [ ] API Interactions Report: Add cross-links to error handling and validation reports; insert API flow diagram; document any anti-patterns.
- [ ] Business Rules Report: Map each rule to code sections; cross-link to validation and API reports; document technical debt.
- [ ] Component Structure Report: Add a component relationship diagram; cross-link to state management and test strategy.
- [ ] Error Handling & Validation Reports: Reference business rules and API reports for enforcement and error propagation.
- [ ] State Management & Test Strategy: Cross-link to component structure and business rules; document any legacy patterns.
- [ ] Add a summary of changes at the end of each report.
```

4. Suggest further improvements or additional details that could enhance the reports, if any remain.

**Note:** This review step is intended to be thorough and precise. The reviewer should think critically about the intent of each category prompt, the content and structure of each report, and the additional context provided by the other reports. The goal is to maximize the value, clarity, and traceability of the documentation for downstream consumers.
