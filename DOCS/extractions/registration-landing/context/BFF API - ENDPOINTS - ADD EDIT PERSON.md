# BFF API - Endpoints - Add/Edit Person

Updated Jul 17
Matthew Vaughn
Edit

Share


BFF API - Endpoints - Add/Edit Person



By Prasanna Shelimala

3 min

4

Add a reaction
 

/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId}
Parameters
Response
Current State Endpoint
Parameters
Response
api/v1/Person/duplicates
Parameters
Response
Current State Endpoint
Parameters
Response
api/v1/Person/PatientSearch
Parameters
Response
Current State Endpoint
Parameters
Response
api/v1/Person
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/patients/{patientId}/benefitplan
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/referralSources/providers
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/referralSources/providers(getPracticeProviders)
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/create/referralSources
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/save/referralSources
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/patient/details
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId}-(getpersonDetails)
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/insurancebenefitplans
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/patientidentifiers
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/patientalerts
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/grouptypes
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/discounttypes
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/states
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/locations/practice/{practiceId}
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/account/accountMembers/{accountId}
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId} - (GetAvailablePolicyHolderDetails)
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person/patients/{patientId}/get
Parameters
Response
Current State Endpoint
Parameters
Response
/api/v1/Person (PUT)
Request
Response
Current State Endpoint
Request:
Response
/api/v1/Person/patientcommunications/patientinfo
Parameters
Response
Current State Endpoint
Parameters
Response
 

/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId}
Parameters
personId - string(Guid) - Required

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | ResponsiblePersonAndAccountMembersDetailsResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /accounts/accountMembersWithPhoneEmail/{personId}

Parameters
personId - GUID - Required

Response
body: AccountMembersPhoneEmailResponseDto 

api/v1/Person/duplicates
Parameters
NA

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | DuplicatePatientResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - POST /patients/duplicates

Parameters
NA

Response
body: PatientSearchResponseDto 

api/v1/Person/PatientSearch
Parameters
queryParams (string searchFor, int skip, int take, Guid excludePatient)

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | PatientSearchResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /patients/search/?searchFor=s&skip=0&take=45&excludePatient=undefined

Parameters
queryParams (string searchFor, int skip, int take, Guid excludePatient)

Response
body: PatientSearchResponseDto 

api/v1/Person
Parameters
NA

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | AddPersonResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - POST /persons

Parameters
NA

Response
body: PersonAddResponseDto 

/api/v1/Person/patients/{patientId}/benefitplan
Parameters
patientId - string(Guid) - Required

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | PatientBenefitPlanResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET - /patients/{patientId}/benefitplan

Parameters
patientId - string(Guid) - Required

Response
body:  PatientLiteDto  

/api/v1/Person/referralSources/providers
Parameters
NA

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | ReferralSourceWithPracticeProviderResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET - /referralsources

Parameters
NA

Response
body:  PatientReferralSourceResponseDto 

/api/v1/Person/referralSources/providers(getPracticeProviders)
Parameters
NA

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | ReferralSourceWithPracticeProviderResponseDto 

Current State Endpoint
API - ReferralsManagementUrl

Endpoint - GET - /api/practice/getPracticeProviders

Parameters
NA

Response
body:  PatientReferralSourceResponseDto 

/api/v1/Person/create/referralSources
Parameters
NA

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | PatientReferralSourceCreateResponseDto 

Current State Endpoint
API - ReferralsManagementUrl

Endpoint - POST - api/referral/create

Parameters
NA

Response
body:  PatientReferralSourceCreateResponseDto 

/api/v1/Person/save/referralSources
Parameters
NA

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | PatientReferralSourceResponseDto  

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - POST - api/referralsources

Parameters
NA

Response
body:  PatientReferralSourceResponseDto 

/api/v1/Person/patient/details
Parameters
queryParams (string searchFor, int skip, int take, Guid excludePatient)

Response
Status Code: 200

Body:  
BFF API - Models - Add/Edit Person | PatientSearchWithDetailsResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - POST - /patients/searchPatientsWithDetailsAsync, queryParams)

Parameters
queryParams (string searchFor, int skip, int take, Guid excludePatient)

Response
body:  PatientSearchResponseDto

/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId}-(getpersonDetails)
Parameters
personId - string(Guid) - Required

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | ResponsiblePersonAndAccountMembersDetailsResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /accounts/accountMembersWithPhoneEmail/{personId}

Parameters
personId - GUID - Required

Response
body: AccountMembersPhoneEmailResponseDto 

/api/v1/insurancebenefitplans
Parameters
N/A

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | BenefitPlanResponseDto (insurancebenefitplans) 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/insurance/BenefitPlan/Active

Parameters
N/A

Response
body: List of BenefitPlanDto.cs 

/api/v1/Person/patientidentifiers
Parameters
N/A

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | PatientAdditionalIdentifierResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/masterpatientidentifiers

Parameters
N/A

Response
body: List of 
BFF API - Models - Add/Edit Person | MasterPatientIdentifierDto 

/api/v1/Person/patientalerts
Parameters
N/A

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | PersonPatientAlertsResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/patientalerts

Parameters
N/A

Response
body: List of 
BFF API - Models - Add/Edit Person | MasterPatientIdentifierDto

/api/v1/Person/grouptypes
Parameters
N/A

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | GroupTypeResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/patientgroups

Parameters
N/A

Response
body: List of MasterPatientGroupDto

/api/v1/Person/discounttypes
Parameters
N/A

Response
Status Code: 200

Body: List of
BFF API - Models - Add/Edit Person | PersonDiscountTypeResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/discounttypes

Parameters
N/A

Response
body: List of 
BFF API - Models - Add/Edit Person | MasterDiscountTypeDto 

/api/v1/Person/states
Parameters
N/A

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | StateResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /api/v1/applicationsettings/states

Parameters
N/A

Response
body: List of 
BFF API - Models - Add/Edit Person | StateDto 

/api/v1/Person/locations/practice/{practiceId}
Parameters
practiceId - Guid - Required

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | PracticeLocationResponseDto 

Current State Endpoint
API - WebApiUrl

Endpoint - GET /api/locations/practice/{practiceId}

Parameters
personId - GUID

Response
body: List of 
BFF API - Models - Add/Edit Person | LocationResponseClientModel 

 

/api/v1/Person/account/accountMembers/{accountId}
Parameters
accountId - Guid - Required

Response
Status Code: 200

Body: List of 
BFF API - Models - Add/Edit Person | AccountMembersResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /accounts/accountMembers/{accountId}

Parameters
accountId- Guid

Response
body: List of 
BFF API - Models - Add/Edit Person | PatientLiteDto 

/api/v1/Person/ResponsiblePersonAndAccountMembersDetails/{personId} - (GetAvailablePolicyHolderDetails)
Parameters
personId - Guid - Required

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | ResponsiblePersonAndAccountMembersDetailsResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /persons/{patientId}

Endpoint -GET /accounts/accountMembersWithPhoneEmail/{personId} 

API - FuseClinicalUrl

Endpoint - GET /userPatientAccess/{patientId}/accountMembers

Parameters
personId- Guid

Response
GetPersonDetails - PersonDto.cs

Get accountMembersWithPhoneEmail - PatientPhoneEmailInfo

Get AccountMembers - UserPatientAccessDto.cs 

/api/v1/Person/patients/{patientId}/get
Parameters
patientId - Guid - Required

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | AddPersonResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /persons/{patientId}/get

Parameters
patientId- Guid - Required

Response
body: PersonAddDto

/api/v1/Person (PUT)
Request
Body: 
BFF API - Models - Add/Edit Person | PersonRequestModel  

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | PersonResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - PUT /persons

Request:
Body: PersonDto.cs

Response
body: PersonDto.cs

/api/v1/Person/patientcommunications/patientinfo
Parameters
patientId - Guid - Required

Response
Status Code: 200

Body: 
BFF API - Models - Add/Edit Person | PersonProfileCommunicationResponseDto 

Current State Endpoint
API - SoarApiBaseUrl

Endpoint - GET /persons/patients/{patientId}/patientcommunications/patientinfo

Parameters
patientId- Guid - Required

Response
body: PersonProfileCommunicationDto.cs 