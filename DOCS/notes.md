# Notes

- [ ] Copilot instructions and prompts
- [ ] Package Management for Web Applications (priority: high)
- [ ] MCP integration
  - [ ] Kendo UI
  - [ ] Context7
    - [ ] Angular
    - [ ] Jest
    - [ ] TypeScript
    - [ ] Kendo UI
- [ ] API Response and BFF/API messaging
  - [ ] server error vs application error
  - [ ] API response structure
  - [ ] API response error codes
  - [ ] user messages
- [ ] AngularJS-to-Modern
  - [ ] Environment setup
  - [ ] Migration strategy
  - [ ] Target: [Add/Edit Person](https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2392031239/Test+scenarios+for+the+Add+Person+page)

## Plan

- [ ] Create staging Github repository for Fuse code base
  - [ ] Take advatage of Copilot/Github MCP search/code generation capabilities.
  - [ ] AngularJS (v1)
  - [ ] Angular (v11)
- [ ] Copy `Fuse` code base to staging repository
- [ ] Setup MCP integration for `legacy` code base
  - [ ] Github
  - [ ] Context7
- [ ] system prompt
  - [ ] DNA extraction
  - [ ] Extraction prompts
  - [ ] Extraction categories
  - [ ] Extraction report
- [ ] Review Extraction Reports
  - [ ] Identify gaps
  - [ ] Identify missing information
  - [ ] Identify missing code
  - [ ] update prompts for any gaps
- [ ] Add external context for DNA extraction
  - [ ] Confluence
  - [ ] Azure DevOps
- [ ] Identify Component-level workflows or sequeces
- [ ] API Interactions
  - [ ] Use: DOCS\extractions\registration-landing\api-interactions.report.md
  - [ ] Need to extract API interaction details; service operation details, API endpoints, request/response structures.
  - [ ] consider a separate "Service DNA Extraction" prompt/report.
- [ ] Identify Child Components
  - [ ] Use same process to recursively extract child component(s) DNA
  - [ ] Use system prompt to extract child component DNA


## Workflow

1. identify target component by file/folder path.
2. extract DNA from target component using system prompt.
3. run the #review-system-prompt command to review the extraction report; updates missing information.

## Confluence | Azure DevOps

- https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2392031239/Test+scenarios+for+the+Add+Person+page
- https://pdco-sw.atlassian.net/wiki/spaces/APOL/pages/985137153/514857+QA+Add+Person+Setting+status+to+inactive+causes+an+error
- https://pdco-sw.atlassian.net/wiki/spaces/IN/pages/1723826202/Feature+527571+Add+a+Person+Adding+Referral+information+when+adding+new+patient
- https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2338324481/BFF+API+-+Models+-+Add+Edit+Person#BaseResponseDto
- https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2338193410/BFF+API+-+Endpoints+-+Add+Edit+Person
- https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/2333638690/BFF+-+Add+Edit+Person
- https://pdco-sw.atlassian.net/wiki/spaces/AM/pages/edit-v2/2338193410#%2Fapi%2Fv1%2FPerson%2FResponsiblePersonAndAccountMembersDetails%2F%7BpersonId%7D
- https://dev.azure.com/pdco-fuse/Fuse/_workitems/edit/514857
- https://dev.azure.com/pdco-fuse/Fuse/_workitems/edit/515128
- https://dev.azure.com/pdco-fuse/Fuse/_workitems/edit/509321
- 