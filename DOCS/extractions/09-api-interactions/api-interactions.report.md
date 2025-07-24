# API Interactions Report: registration-landing Component

**Component Path:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

---

## Overview
This report documents all API interactions for the `registration-landing` component, including endpoints, methods, request/response payloads, integration patterns, and error/success handling. All code samples reference the actual implementation and are suitable for rehydration in a modern Nx/Angular workspace.

---

## 1. API Services Used
- `PatientRegistrationService` (imported from `src/patient/common/http-providers/patient-registration.service`)
- `ImagingPatientService` (injected as `ImagingPatientService`)
- `PersonFactory` (injected as `PersonFactory`)
- `FeatureFlagService` (for feature toggles, not direct API)

---

## 2. API Calls and Endpoints

### 2.1. Get Person by ID
- **Method:** `GET`
- **Service Call:** `registrationService.getPersonByPersonId(patientId)`
- **Usage:** Fetches the full person record for editing.
- **Integration:**
  ```typescript
  this.registrationService.getPersonByPersonId(this.route.patientId)
    .subscribe((person: any) => {
      this.personInfo = person;
      this.titleService.setTitle(`${person.Profile.PatientCode} - Edit Person`);
      this.handlePatchForms();
    });
  ```
- **Request:**
  - `patientId: string` (route param)
- **Response:**
  - `person: { Profile: {...}, Phones: [...], Emails: [...], ... }`
- **Error Handling:** Not explicit in this call; errors would result in missing data and UI fallback.

### 2.2. Add Person
- **Method:** `POST`
- **Service Call:** `registrationService.addPerson(personObject)`
- **Usage:** Creates a new person record.
- **Integration:**
  ```typescript
  this.registrationService.addPerson(personToAdd).subscribe(
    (data: any) => this.savePersonSuccess(data),
    error => this.savePersonFailure(error)
  );
  ```
- **Request Payload:**
  - `personToAdd: { Profile, Phones, Emails, ... }` (see below for structure)
- **Response:**
  - `data: { Profile: {...}, ... }`
- **Error Handling:**
  ```typescript
  error => this.savePersonFailure(error)
  ```
  - Triggers error toast and closes loading modal.

### 2.3. Update Person
- **Method:** `PUT`
- **Service Call:** `registrationService.updatePerson(personObject)`
- **Usage:** Updates an existing person record.
- **Integration:**
  ```typescript
  this.registrationService.updatePerson(personToUpdate).subscribe(
    (updatedPatient: any) => { ... },
    error => this.savePersonFailure(error)
  );
  ```
- **Request Payload:**
  - `personToUpdate: { Profile, Phones, Emails, ... }`
- **Response:**
  - `updatedPatient: { Profile: {...}, ... }`
- **Error Handling:**
  - Same as Add Person.

### 2.4. Get Registration Event (RxJS Observable)
- **Method:** `Observable`
- **Service Call:** `registrationService.getRegistrationEvent()`
- **Usage:** Listens for registration-related events (not a REST API call, but RxJS event bus).
- **Integration:**
  ```typescript
  this.registrationService.getRegistrationEvent()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((event: RegistrationCustomEvent) => { ... });
  ```

### 2.5. Imaging Patient Sync
- **Method:** `GET/PUT` (via `ImagingPatientService`)
- **Service Calls:**
  - `imagingPatientService.getImagingPatient(updatedPatient)`
  - `imagingPatientService.updateImagingPatient(updatedPatient, imagingPatient)`
  - `imagingPatientService.syncBluePatientLocation(patientId, preferredLocation)`
- **Usage:** Syncs patient data with imaging and location systems after save/update.
- **Integration:**
  ```typescript
  this.imagingPatientService.getImagingPatient(updatedPatient)
    .then((res: any) => { ... });
  this.imagingPatientService.updateImagingPatient(updatedPatient, imagingPatient)
    .then(() => { ... });
  this.imagingPatientService.syncBluePatientLocation(updatedPatient.Profile.PatientId, updatedPatient.Profile.PreferredLocation);
  ```

### 2.6. Set Person Active Status
- **Method:** `PUT`
- **Service Call:** `personFactory.SetPersonActiveStatus(patientId, status, unscheduleOnly)`
- **Usage:** Updates the active status of a person.
- **Integration:**
  ```typescript
  this.personFactory.SetPersonActiveStatus(personalDetail.PatientId, personalDetail.Status, personalDetail.unscheduleOnly)
    .then((res: any) => { ... });
  ```

---

## 3. Request/Response Payloads and Data Models

### 3.1. Person Object (for Add/Update)
```typescript
{
  Profile: {
    PatientId: string,
    PatientSince: Date,
    DataTag: string,
    IsActive: boolean,
    FirstName: string,
    MiddleName: string,
    LastName: string,
    PreferredName: string,
    Suffix: string,
    DateOfBirth: Date,
    Sex: string,
    IsPatient: boolean,
    ResponsiblePersonType: number,
    ResponsiblePersonId: string,
    IsSignatureOnFile: boolean,
    AddressReferrerId: string,
    AddressLine1: string,
    AddressLine2: string,
    City: string,
    State: string,
    ZipCode: string,
    PreferredDentist: string,
    PreferredHygienist: string,
    PreferredLocation: string,
    HeightFeet: number,
    HeightInches: number,
    Weight: number,
    PrimaryDuplicatePatientId: string,
    PersonAccount: {
      ReceivesStatements: boolean,
      ReceivesFinanceCharges: boolean,
      PersonId: string,
      AccountId: string,
      DataTag: string,
    },
  },
  Phones: Array<...>,
  Emails: Array<...>,
  PreviousDentalOffice: { ... },
  Referral: { ... },
  patientIdentifierDtos: Array<...>,
  Flags: Array<...>,
  PatientBenefitPlanDtos: Array<...>,
  PatientLocations: Array<...>,
  patientDiscountTypeDto: { ... },
  patientGroupDtos: Array<...>
}
```

### 3.2. Example: Add Person Request
```typescript
this.registrationService.addPerson(personToAdd).subscribe(...);
// personToAdd is constructed from form values and includes all nested objects as above
```

### 3.3. Example: Update Person Request
```typescript
this.registrationService.updatePerson(personToUpdate).subscribe(...);
// personToUpdate is constructed similarly to personToAdd
```

---

## 4. Error and Success Handling
- **Success:**
  - Calls `savePersonSuccess(data)` which shows a success toast, closes modal, and navigates appropriately.
  - Example:
    ```typescript
    this.toastrFactory.success(
      this.translate.instant(`Patient has been ${mode} successfully.`),
      this.translate.instant('Success')
    );
    this.loadingModal.close();
    ```
- **Error:**
  - Calls `savePersonFailure(error)` which shows an error toast and closes modal.
  - Example:
    ```typescript
    this.toastrFactory.error(
      this.translate.instant(`Unable to ${mode} patient.`),
      this.translate.instant('Server Error')
    );
    this.loadingModal.close();
    ```

---

## 5. Edge Cases and Rationale
- **Conditional Add/Update:**
  - If `route.patientId` exists, update; else, add.
- **Data Cleaning:**
  - `removeInvalidDataForAddOrUpdate` strips out null/empty fields before sending to API.
- **Imaging/Location Sync:**
  - After update, patient data is synced with imaging/location systems for consistency.
- **Feature Flags:**
  - API interactions may be gated by feature flags (e.g., referrals section).

---

## 6. File References
- Main logic: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- Service: `src/patient/common/http-providers/patient-registration.service`
- Imaging: (injected as `ImagingPatientService`)
- Person Factory: (injected as `PersonFactory`)

---

## 7. Rehydration Guidance
- Use Angular services for all API calls, with RxJS for async handling.
- Ensure all request/response models are strongly typed.
- Implement error and success handling as shown, using Angular's DI and notification services.
- Integrate with feature flags and modularize API logic for maintainability.

---

*This report is part of the DNA extraction for the `registration-landing` component. All file references use complete relative paths from the workspace root.*
