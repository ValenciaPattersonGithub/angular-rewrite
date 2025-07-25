# Service Extraction Prompt

---
requiredInputs:
  - name: REPORT_PATH
    type: string
    description: "Relative folder path to output report (e.g., DOCS\extractions\registration-landing\services.report.md)."
  - name: TARGET_FOLDER
     type: string
     description: "Relative folder path for the component or feature (e.g., src/patient/patient-registration/registration-landing). Optional if TARGET_FILES is provided."
  - name: TARGET_FILES
     type: array
     description: "Array of relative file paths for a group of files with affinity (e.g., [src/legacy/feature/foo.component.ts, src/legacy/feature/foo.service.ts]). Optional if TARGET_FOLDER is provided."
  - name: DEPENDENCIES_REPORT_FILE
    type: string
    description: "Relative path to the dependencies.report.md file. This file must exist and contain verifiable business logic services before running this prompt."
  - name: TARGET_CONTEXT_FOLDER
    type: string
    description: "Relative folder path for external context files (e.g., DOCS/extractions/registration-landing/context/). Required for all context integration."
---

## External Context Integration (MANDATORY)

Follow the instructions and checklist in `DOCS/extraction-prompts/external-context.instructions.md` to ensure all available external context is integrated, referenced, and reported as required.
All external context files must be collected from the folder specified by `TARGET_CONTEXT_FOLDER` (and any other relevant context folders).

**OUTPUT LOCATION:**

- The extraction report **MUST** be written to the path specified by `REPORT_PATH` (e.g., `DOCS/extractions/registration-landing/services.report.md`).
- The report file name should be descriptive and match the target component/service (e.g., `services.report.md`).


**PRIMARY EXTRACTION OBJECTIVE:**

Extract the full, precise, code-level details of the primary business logic service(s) used by a component, as required for DNA-level rehydration and code generation on a modern platform. **DO NOT SUMMARIZE OR OMIT ANY DETAIL.**

All extraction must:

- Include explicit method signatures, input/output types, code samples, and usage context
- Reference all relevant files with complete relative paths
- Satisfy the system prompt's directive: "ALL EXTRACTION AND CATEGORY PROMPTS MUST INCLUDE PRECISE, EXPLICIT DETAILS FOR EVERY ASPECT (E.G., VALIDATOR TYPE, VALUE, ERROR MESSAGE, CODE, ETC.). THE PURPOSE IS TO ENABLE CODE GENERATION ON A DIFFERENT PLATFORM. SUMMARIES OR OMISSIONS ARE UNACCEPTABLE."
- Clearly indicate which files/folders were included and how they were determined (TARGET_FOLDER, TARGET_FILES, or both)
- **Reference, synthesize, and explicitly document all available external context from the folder specified by `TARGET_CONTEXT_FOLDER` (and any other relevant context folders).**
- **For each external context file used, list the file path (relative to the workspace root), summarize key findings, and document any discrepancies, enhancements, or integration points.**

# Service Extraction Prompt

**NOTE:** This prompt must only be executed after the dependencies prompt has run, and the specified `*.report.md` file exists and contains verifiable business logic services. If the report file does not exist or does not contain business logic services, halt and report the issue.

**NO SUMMARIES OR OMISSIONS.** All details, code, models, interfaces, and types must be included in full, as required for DNA-level rehydration and code generation. Reference all related models, interfaces, and types explicitly, with code and file paths.


**INTEGRATION:** This prompt should be included in the extraction workflow (see system.prompt.md) immediately after the dependencies prompt, and only if the dependencies.report.md file is present and valid. The extraction process **must** reference, synthesize, and document all available external context, just as in other category prompts.

**Goal:**
Extract the primary business logic service(s) used by a component, using the output of the dependencies prompt and report files, and provide all details needed for re-implementation in a modern Nx/Angular workspace.

## Extraction Instructions

1. **Identify Primary Business Service(s):** - Review the dependencies report for the component. - Look for services under "App Services" or similar sections. - The primary business service is typically responsible for API/data operations (e.g., `PatientRegistrationService`). - If multiple business services are present, extract each in full detail.

2. **Retrieve Service File Path:** - Use the import statement in the component to get the full relative path (e.g., `src/patient/common/http-providers/patient-registration.service`). - List all relevant files for each service (e.g., service, interface, model, and any related files).

3. **Analyze Component Usage:** - Find all usages of the service in the component file. - For each method used, document: - The code context (e.g., in ngOnInit, in event handler, etc.) - The full code sample of the usage - Any relevant data flow, state, or error handling logic

4. **Extract Service Method Signatures and Code:**
   - For each method used in the component, extract:
     - Method name and full TypeScript signature (including all input and output types, with model/interface names, not just `any`)
     - The complete method code (if available)
     - Brief description of what the method does (if available via comments or naming)
     - The return type (observable, promise, value, etc.), including the model/interface name and type

  - For every input and output type (including generics, DTOs, models, interfaces, enums, etc.), search for and extract the actual type definition/code, using imports and references in the service class to locate the correct file(s). **Do not use or accept 'any' as a type; always extract the actual structure from the component, data models, or related reports.**
  - If a type is imported from another file, include the full code for that type in the report, and reference the file path.
  - If a type is a built-in or third-party type, indicate the source (e.g., RxJS Observable, Angular HttpResponse, etc.) explicitly in the report.
  - If a type cannot be found, clearly indicate this in the report and document the search path/attempts.
  - All type extraction and verification must be part of the detailed report output.
  - **Synthesize and document all available external context (e.g., from DOCS/extractions/<target>/context/ or other context folders). For each context file, summarize key findings, document enhancements, discrepancies, and integration points.**


5. **Output Format:**
   - The extraction report **MUST** be written to the file specified by `REPORT_PATH`.
   - Use markdown with clear headings and code blocks.
   - Include:
     - Service name and all relevant file paths
     - List of methods used in the component, with full signatures, code, and descriptions
     - For each method, explicitly list and document all input and output types (with model/interface names), and include the full code for each type, with file paths

   - Example usages from the component (full code snippets)
   - All related interfaces, models, and types (with code and file paths). **If a method uses a DTO or model type, extract its full structure from the component, data models, or related reports, and include it in the report.**
  - **Section: "External Context Utilized"**:
    - List all external context files used (with file paths, relative to the workspace root, from the folder specified by `TARGET_CONTEXT_FOLDER`)
    - Summarize key findings from each external context file
    - Document any discrepancies, enhancements, or integration points identified from the external context
    - **If additional context is available (e.g., from the folder specified by `TARGET_CONTEXT_FOLDER`), synthesize and integrate it into the report, noting any impact on the extracted service details.**
   - Reference all file paths relative to the workspace root.
   - Clearly indicate which files/folders were included and how they were determined (TARGET_FOLDER, TARGET_FILES, or both)
   - **At the top of the report, include the output file path (REPORT_PATH) and the report file name.**

---

**Example:**

````markdown
## Primary Business Service

- **Service:** PatientRegistrationService
- **File Path:** src/patient/common/http-providers/patient-registration.service

### Methods Used in Component

- Registers a new patient.
- **Inputs:** `patientData: Patient`
- **Output:** `Observable<RegistrationResult>`

- `getPatientById(id: string): Observable<Patient>`
  - Retrieves patient data by ID.

### Example Usage in Component

this.registrationService.registerPatient(this.form.value).subscribe(...);

```
