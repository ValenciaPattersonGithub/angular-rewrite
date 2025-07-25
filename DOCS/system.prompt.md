# System Prompt for DNA Extraction

## MAIN DIRECTIVE: DO NOT SUMMARIZE. ALL EXTRACTION AND CATEGORY PROMPTS MUST INCLUDE PRECISE, EXPLICIT DETAILS FOR EVERY ASPECT (E.G., VALIDATOR TYPE, VALUE, ERROR MESSAGE, CODE, ETC.). THE PURPOSE IS TO ENABLE CODE GENERATION ON A DIFFERENT PLATFORM. SUMMARIES OR OMISSIONS ARE UNACCEPTABLE.
---
requiredInputs:
    - name: TARGET_FOLDER
       type: string
       description: "Relative folder path for the component or feature (e.g., src/patient/patient-registration/registration-landing). Optional if TARGET_FILES is provided."
    - name: TARGET_FILES
       type: array
       description: "Array of relative file paths for a group of files with affinity (e.g., [src/legacy/feature/foo.component.ts, src/legacy/feature/foo.service.ts]). Optional if TARGET_FOLDER is provided."
usage: |
   Specify one or both of the following when running the workflow:
      1. TARGET_FOLDER: a relative folder path
      2. TARGET_FILES: an array of relative file paths
      3. Both TARGET_FOLDER and TARGET_FILES
   All references in prompts and reports will use the provided value(s). If both are provided, the workflow must extract and report on the union of all files in the folder and the explicit file set, avoiding duplicates.
---

# System Prompt

## Goal and Purpose

The goal is to capture the raw essence—the "DNA"—of a specific feature or component in the code base, so it can be transported, automated, and regenerated in a modern platform (e.g., newest Angular, Nx, better tools, different repository). The output should read like a recipe for a junior developer, with clear organization, categorization, and actionable detail.

- The information set is a structured, granular collection of details about a specific feature or component.
- It includes everything needed to re-implement the component: structure, dependencies, interactions, data flow, UI elements, error handling, validation, business rules, API interactions, data models, state management, and test strategy.
- The information will be used with product requirements, test cases, and user stories to create documentation that guides development and testing, ensuring a clear understanding of the component's functionality and requirements.
- This information set provides the foundation for generating requirement documents, user stories, and other related documentation, and can be used as `context` for Copilot in Visual Studio Code and other tools to generate code, tests, and documentation in a modern web application development environment.
   - Nx Workspace
   - Angular 18
   - Jest testing tools and Framework
   - Angular Library projects via Nx Workspace generators
   - Angular Architecture (CLEAN)

## Report Structure

The output report should be provided in two formats:


## Rehydration Guidance for Modern Nx/Angular Workspace

To rehydrate this component in a modern Nx/Angular workspace:

- Replicate the form structure and validation logic
- Implement the same business rules and event-driven UI updates
- Use modular child components for each section
- Integrate with modern equivalents of the services (API, modal, feature flags)
- Ensure all state management and error handling is preserved
- Use the extracted code samples as templates for new implementation
- Reference the test strategy to ensure coverage

**DNA Extraction must include:**
- Key code samples (class, methods, interfaces, templates, test cases)
- Data models and types
- API endpoints and payloads
- Business rules and validation logic
- UI structure and event bindings
- State management and lifecycle
- Error handling and messaging
- Test strategy and coverage
- Any architectural patterns or conventions

**Approach as an archeologist:**
- Remove non-essential details (fonts, colors, legacy-only artifacts)
- Document every aspect: structure, dependencies, data models, business logic, UI, API, error handling, validation, state, and test strategy
- Present findings in a way that is actionable for developers, architects, QA, and AI tooling—so Copilot or any automation can use this as context to generate code, tests, and documentation in a new codebase


**Category Mapping Checklist:**
1. Component Structure (class, files, relationships, patterns)
2. Dependencies (Angular, third-party, app services, injected data)
3. Interactions (child components, services, events)
4. Data Flow and State Management (data sources, triggers, synchronization)
5. User Interface Elements (template structure, bindings, navigation)
6. Error Handling and Messaging (detection, surfacing, user feedback)
7. Validation and Error Handling for Forms (rules, feedback, edge cases)
8. Business Rules and Logic (rules, enforcement, rationale)
9. API Interactions (endpoints, payloads, integration)
10. Logging and Error Handling Details (logging, analytics, rationale)
11. Data Models (definitions, usage, relationships)
12. Component State Management (lifecycle, subscriptions, cleanup)
13. Test Strategy and Requirements (coverage, organization, gaps)
14. Forms (Angular FormGroups, FormControls, form structure, patchValue/get usage, form-driven logic)
15. Models (inferred or explicit models used for forms, patchValue, data binding, and business logic)

**All 15 categories must be addressed in the extraction and reporting.**


### 1. Human-Readable Markdown
Organize the report with clear headings, bullet points, and code blocks where appropriate. Each section should be easy to scan and understand for a junior developer.
All file references in the output must include their complete relative path from the workspace root.

### 2. JSON Data Format
Provide the same information in a structured JSON object, suitable for database import or automated tooling.

---


## Context

Typically, the target will be a specific component or set of components in the code base that are related to a specific feature or functionality. The goal is to gather enough information to create detailed information sets that can be used to generate requirement documents, user stories, and other related documentation.







## DNA Extraction Workflow for `<TARGET_COMPONENT>` (Flexible Input)

### Step 0: Input Validation

- **Check for Required Inputs:**  
   Before starting the extraction workflow, ensure that at least one of the following is provided:
   - `TARGET_FOLDER`: a relative folder path for the component or feature
   - `TARGET_FILES`: an array of relative file paths for a group of files
- **If neither is provided:**  
   Prompt the user:  
   > "Please provide at least one required input: `TARGET_FOLDER` (relative folder path) or `TARGET_FILES` (array of relative file paths). The workflow cannot proceed without this information."



### Step 1: Preparation

- **Context Source:**  
   Use `DOCS/extraction/extraction-report.md` as the foundational context for all interrogations.

- **Target Component:**  
   Use dynamic placeholders for the target(s):
   - `<TARGET_FOLDER>`: The relative folder path for the component or feature (e.g., `src/patient/patient-registration/registration-landing`).
   - `<TARGET_FILES>`: An array of relative file paths for a group of files with affinity (e.g., `["src/legacy/feature/foo.component.ts", "src/legacy/feature/foo.service.ts"]`).
   - Both: If both are provided, the workflow must extract and report on the union of all files in the folder and the explicit file set, avoiding duplicates.

   Specify the target(s) when running the workflow. All references to the component or files in prompts and reports should use the provided value(s). If both are provided, ensure all relevant files are included in the extraction and reporting.

### Step 2: Category Interrogation



For each of the 15 categories, use the corresponding prompt in `DOCS/extraction-prompts`.
**ALL CATEGORY PROMPTS AND EXTRACTIONS MUST INCLUDE PRECISE, EXPLICIT DETAILS FOR EVERY ASPECT (E.G., VALIDATOR TYPE, VALUE, ERROR MESSAGE, CODE, ETC.). SUMMARIES OR OMISSIONS ARE UNACCEPTABLE.**
Each prompt and report must:
   - Accept and process any of the three input options (folder, file set, or both).
   - When both are provided, operate on the union of all files in the folder and the explicit file set, avoiding duplicates.
   - Clearly indicate in the output which files/folders were included, and how they were determined.

1. **Component Structure:**  
   - Use `DOCS/extraction-prompts/component-structure.prompt.md`
2. **Dependencies:**  
   - Use `DOCS/extraction-prompts/dependencies.prompt.md`
3. **Interactions:**  
   - Use `DOCS/extraction-prompts/interactions.prompt.md`
4. **Data Flow and State Management:**  
   - Use `DOCS/extraction-prompts/data-flow.prompt.md`
5. **User Interface Elements:**  
   - Use `DOCS/extraction-prompts/ui-elements.prompt.md`
6. **Error Handling and Messaging:**  
   - Use `DOCS/extraction-prompts/error-handling.prompt.md`
7. **Validation and Error Handling for Forms:**  
   - Use `DOCS/extraction-prompts/validation.prompt.md`
8. **Business Rules and Logic:**  
   - Use `DOCS/extraction-prompts/business-rules.prompt.md`
9. **API Interactions:**  
   - Use `DOCS/extraction-prompts/api-interactions.prompt.md`
10. **Logging and Error Handling Details:**  
    - Use `DOCS/extraction-prompts/logging.prompt.md`
11. **Data Models:**  
    - Use `DOCS/extraction-prompts/data-models.prompt.md`
12. **Component State Management:**  
    - Use `DOCS/extraction-prompts/state-management.prompt.md`
13. **Test Strategy and Requirements:**  
    - Use `DOCS/extraction-prompts/test-strategy.prompt.md`
14. **Forms:**  
    - Use `DOCS/extraction-prompts/forms.prompt.md`
15. **Models:**  
    - Use `DOCS/extraction-prompts/models.prompt.md`


### Step 3: Category Report Generation

- For each category, generate a markdown report using the output format specified in the prompt.
- **Each category report must be saved in an output folder under `DOCS/extractions` named for the target:**
   - If only TARGET_FOLDER is provided: `DOCS/extractions/<target-folder>/<category>.report.md`
   - If only TARGET_FILES is provided: `DOCS/extractions/<target-fileset-name>/<category>.report.md` (use a descriptive name or hash for the file set)
   - If both are provided: `DOCS/extractions/<target-folder-and-fileset>/<category>.report.md` (use a combined descriptive name or hash)
      - Example: `DOCS/extractions/registration-landing/component-structure.report.md`
      - For file sets or combined targets, use a descriptive name or hash for the folder (e.g., `DOCS/extractions/foo-bar-files/` or `DOCS/extractions/registration-landing-and-foo-bar-files/`)
- Each report should:
   - Reference the context from `DOCS/extraction/extraction-report.md`
   - Drill down into every item and sub-topic
   - Use headings, bullet points, and code blocks for clarity
   - **Include complete relative file paths for all file references (e.g., `src/patient/patient-registration/registration-landing/registration-landing.component.ts`)**
   - Clearly indicate which files/folders were included in the extraction and how they were determined (folder, file set, or both)

### Step 4: Aggregation

- Aggregate all category markdown reports into a comprehensive DNA extraction report.
- Output the final report as `DOCS/extraction/extraction-report.md` (or update it if already present).
- Ensure all referenced files in the aggregated report use complete relative paths.

---

## Automated Execution Instructions

To fully automate the DNA extraction process for a component or file set:
1. For the target (folder, file set, or both), run each interrogation prompt in `DOCS/extraction-prompts/[category].prompt.md` using the context from `DOCS/extraction/extraction-report.md`.
2. For each category, generate a markdown report as `DOCS/extractions/<target-folder-or-file-set>/<category>.report.md`, where the output folder is named according to the input(s) as described above.
3. Aggregate all category reports into the final DNA extraction report in `DOCS/extraction/extraction-report.md`.
4. Ensure all file references in all reports use complete relative paths from the workspace root.
5. Clearly document in each report which files/folders were included and how they were determined (folder, file set, or both).

---

## Example Command (for automation or Copilot)

> "For the `registration-landing` component, run each interrogation prompt in `DOCS/extraction` using the context from `DOCS/extraction/extraction-report.md`. For each category, generate a markdown report as `DOCS/extraction/[category-folder]/[category].report.md`, and aggregate the results into the final DNA extraction report in `DOCS/extraction/extraction-report.md`. All file references must use complete relative paths."