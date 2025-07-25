# Prompt for Document Retrieval and Extraction

**TOPIC**: "add/edit person"

## Introduction

Retrieve and extract all relevant documents related to the **feature/topic: "add/edit person"** using the search terms and direct links provided below.

## Search Terms

- "patient registration + add person"
- "test scenarios for the 'Add Person' page"
- "any related content or documents in Confluence related to this feature?"

## Document Links

### Test Scenarios

- [Test scenarios for the "Add Person" page created by ShilpaRao](https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2392031239/Testtting status to inactive causes an error created by Mildred Ortiz Lopez](https://pdco-sw.atlassian.net/wiki/spaces/APOL/pages/985137153/514857+QA+Add+Person+ding Referral information when adding new patient created by Yewande Odukoya](https://pdco-sw.atlassian.net/wiki/spaces/IN/pages/1723826202/Feature+527571+Add+a+Person+Adding+Referral+information+when+adding+new+patient-swdd+Edit+Person#BaseResponseDto
- [BFF API - Endpoints - Add/Edit Person created by Prasanna Shelimala](https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2338193410/BFF+API+-+Endpoints+-et/wiki/spaces/AM/pages/2333638690/BFF+-raction and Iteration Process

1. For each document listed above, retrieve the complete content using Confluence Cloud's predefined tools.
2. Extract all information and convert it to markdown format.
3. For each extracted document, scan for links to other Confluence pages.
4. For each discovered link:
   - If the linked document is related to the [TOPIC], retrieve and extract it using the same process (steps 1-4).
   - Ignore unrelated documents.
5. Continue recursively until no new related documents are found.

## Output Format Example

```markdown
# Test Scenarios

## Test scenarios for the "Add Person" page created by ShilpaRao

- [Content of the document]

## 514857 [QA] Add Person: Setting status to inactive causes an error created by Mildred Ortiz Lopez

- [Content of the document]

# Feature Details

## Feature 527571: [Add a Person] Adding Referral information when adding new patient created by Yewande Odukoya

- [Content of the document]

# API Models and Endpoints

## BFF API - Models - Add/Edit Person created by Prasanna Shelimala

- [Content of the document]

## BFF API - Endpoints - Add/Edit Person created by Prasanna Shelimala

- [Content of the document]

## BFF - Add/Edit Person

- [Content of the document]
```
