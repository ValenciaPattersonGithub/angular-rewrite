# API Interactions Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## API Endpoints and Methods
- **Get Person:** `registrationService.getPersonByPersonId(patientId)` — Loads person data for edit.
- **Add Person:** `registrationService.addPerson(personObject)` — Adds new person.
- **Update Person:** `registrationService.updatePerson(personObject)` — Updates existing person.
- **Feature Flags:** `featureFlagService.getOnce$()` — Loads feature flag values.

## Payloads and Data Models
- **PersonObject:** Aggregated from all form groups, includes profile, phones, emails, insurance, preferences, dental, referrals, identifiers, flags, locations, discounts, groups.
- **API Payloads:** All data is mapped from form state to API model before submission.

## Integration and Handling
- API calls use RxJS `subscribe` for async handling.
- Success: Shows toast, closes modal, navigates as needed.
- Error: Shows toast, keeps modal open, allows correction.

## Error and Success Paths
- All API errors are caught and surfaced to user.
- Success triggers navigation or UI update.

## Diagrams/Tables
| API | Method | Payload | Success Path | Error Path |
|-----|--------|--------|-------------|-----------|
| getPersonByPersonId | GET | patientId | Patch form | Show error |
| addPerson | POST | personObject | Show toast, navigate | Show error |
| updatePerson | PUT | personObject | Show toast, navigate | Show error |

## Rationale
API interactions are robust, with clear mapping between form state and API models. All errors and successes are handled in the UI for a seamless user experience.
# API Interactions DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. API Endpoints and Methods

### a. Get Person by ID

- **Service:** `PatientRegistrationService.getPersonByPersonId(patientId)`
- **Method:** `GET`
- **Usage:**

  ```typescript
  this.registrationService.getPersonByPersonId(this.route.patientId)
    .subscribe((person: any) => { ... });
  ```

- **Response:** Patient data object, used to patch form controls and set page title.

### b. Add Person

- **Service:** `PatientRegistrationService.addPerson(personObject)`
- **Method:** `POST`
- **Usage:**

  ```typescript
  this.registrationService.addPerson(personToAdd).subscribe(
    (data: any) => this.savePersonSuccess(data),
    error => this.savePersonFailure(error)
  );
  ```

- **Request Payload:** Aggregated patient object (`PersonObject`)
- **Response:** Saved patient data

### c. Update Person

- **Service:** `PatientRegistrationService.updatePerson(personObject)`
- **Method:** `PUT`
- **Usage:**

  ```typescript
  this.registrationService.updatePerson(personToUpdate).subscribe(
    (updatedPatient: any) => { ... },
    error => this.savePersonFailure(error)
  );
  ```

- **Request Payload:** Aggregated patient object (`PersonObject`)
- **Response:** Updated patient data

### d. Registration Events

- **Service:** `PatientRegistrationService.setRegistrationEvent(event)` / `getRegistrationEvent()`
- **Usage:**

  ```typescript
  this.registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.SelectedMenu, data: this.selectedMenuItem });
  this.registrationService.getRegistrationEvent().pipe(...).subscribe(...);
  ```

- **Purpose:** Used for event-driven UI updates and state management

### e. Static Data

- **Service:** `staticData.PhoneTypes()`, `staticData.States()`
- **Usage:**

  ```typescript
  this.staticData.PhoneTypes().then(this.phoneTypesOnSuccess);
  this.staticData.States().then(this.StatesOnSuccess);
  ```

- **Purpose:** Loads static lists for form controls

---

## 2. Data Models and Payloads

- **PersonObject:** Aggregated patient data, including profile, phones, emails, dental records, referrals, identifiers, flags, benefit plans, locations, discount types, and groups.
- **Event Objects:** Used for registration event communication.

---

## 3. Error and Success Handling

- **Success:**
  - Updates UI, closes modals, navigates as needed, shows success message.
- **Error:**
  - Calls `savePersonFailure`, shows error notification, closes loading modal.

---

## 4. Edge Cases and Rationale

- Handles both new and existing patient flows.
- Cleans data before sending to API (removes null/unused fields).
- Uses observables and promises for async API handling.

---

**Files included in this extraction:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
