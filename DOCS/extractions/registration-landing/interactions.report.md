# Interactions DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Child Component Interactions

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`

- `<registration-header [patientProfile]="this.personInfo.Profile"></registration-header>`
- `<table-of-content></table-of-content>`
- `<personal-details [personalDetails]="personGroup.controls.personalDetailsForm"></personal-details>`
- `<contact-details [contactDetails]="personGroup.controls.contactDetailsForm" [phoneTypes]="phoneTypes" [states]="states"></contact-details>`
- `<insurance-details [insuranceDetails]="personGroup.controls.insuranceDetailsForm" *ngIf="!route.patientId"></insurance-details>`
- `<app-patient-insurance *ngIf="route.patientId"></app-patient-insurance>`
- `<preferences [patientPreference]="personGroup.controls.preferencesForm" [onlyActive]="true"></preferences>`
- `<dental-records [dentalRecords]="personGroup.controls.dentalRecordsForm"></dental-records>`
- `<patient-referral-crud [fromAddPatientProfile]="true"></patient-referral-crud>`
- `<additional-identifiers [additionalIdentifiers]="personGroup.controls.identifiresForm" [patientIdentifiers]="personInfo.patientIdentifierDtos"></additional-identifiers>`
- `<app-patient-documents [patientProfile]="personInfo.Profile"></app-patient-documents>`
- `<app-patient-account-members [featureName]="route.patientId?'PatientProfile':'PatientRegistration'"></app-patient-account-members>`

---

## 2. Service and Event Interactions

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

- Injected services: `PatientRegistrationService`, `ConfirmationModalService`, `FeatureFlagService`, `TranslateService`, `Title`, `Location`, etc.
- RxJS Subjects and Subscriptions for event handling:
  - `registrationService.getRegistrationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(...)`
  - `featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe(...)`
- Event emission:
  - `registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.SelectedMenu, data: this.selectedMenuItem })`
  - `registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.FocusSection, data: ... })`
  - `registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.SavePatient, data: ... })`

---

## 3. @Input/@Output and ViewChild

- Uses `@ViewChild` for direct references to DOM elements and child components:
  - `@ViewChild('personalDetail') personalDetail: ElementRef;`
  - `@ViewChild(PatientReferralCrudComponent) referralsComponent!: PatientReferralCrudComponent;`
- No explicit @Input/@Output in this file, but passes form groups and data to child components via property bindings

---

## 4. Lifecycle and Side Effects

- `ngOnInit`, `ngAfterContentInit`, `ngOnDestroy` manage subscriptions, data loading, and cleanup
- Handles scroll events with `@HostListener('scroll', ['$event'])`
- Modal and confirmation dialog interactions

---

## 5. Edge Cases and Legacy Artifacts

- Uses AngularJS-style DI with `@Inject` for some dependencies
- Handles both new and existing patient flows with conditional rendering and logic
- Some legacy patterns in event handling and modal management

---

## 6. Diagrams and Tables

| Interaction | Type | Details |
|-------------|------|---------|
| registrationService | Service | API, event, and state management |
| confirmationModalService | Service | Modal dialogs |
| featureFlagService | Service | Feature flag toggles |
| Child Components | Component | Form sections, documents, referrals, etc. |
| RxJS | Event | State and event subscriptions |

---

**End of Interactions Report**# Interactions Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Interactions Overview
- **Child Components:**
  - `<personal-details>`: Handles personal details form section.
  - `<contact-details>`: Handles contact details form section.
  - `<insurance-details>`: Handles insurance details form section.
  - `<preferences>`: Handles preferences form section.
  - `<dental-records>`: Handles dental records form section.
  - `<patient-referral-crud>`: Handles referrals form section (conditionally rendered).
  - `<additional-identifiers>`: Handles additional identifiers form section.
  - `<app-patient-documents>`: Handles patient documents section.
  - `<app-patient-account-members>`: Handles account members section.
- **Services:**
  - `PatientRegistrationService`: API/data, event emission, and state management.
  - `ConfirmationModalService`: Modal dialog interactions.
  - `FeatureFlagService`: Feature flag checks and toggles.
- **Events:**
  - Scroll events for section navigation.
  - Registration events via RxJS and service calls.
  - Modal open/close events.
  - Form patching and validation events.

## Data/Events Exchanged
- **@Input/@Output:**
  - Child components receive form group controls as inputs.
  - Event emitters for navigation, save, and cancel actions.
- **Service Calls:**
  - `registrationService.setRegistrationEvent()` and `.getRegistrationEvent()` for event-driven updates.
  - API calls for loading/saving person data.
- **Lifecycle:**
  - Interactions occur on form initialization, patching, navigation, and save/cancel actions.
  - Modal confirmation on navigation or save.

## Diagrams/Tables
| Interaction | Type | Data/Events | Trigger |
|-------------|------|------------|---------|
| personal-details | Child Component | FormGroup | Form init/patch |
| contact-details | Child Component | FormGroup, phoneTypes, states | Form init/patch |
| insurance-details | Child Component | FormGroup | Form init/patch |
| preferences | Child Component | FormGroup | Form init/patch |
| dental-records | Child Component | FormGroup | Form init/patch |
| patient-referral-crud | Child Component | FormGroup, enableNewReferral | Conditional render |
| additional-identifiers | Child Component | FormGroup, patientIdentifierDtos | Form init/patch |
| app-patient-documents | Child Component | personInfo.Profile | Conditional render |
| app-patient-account-members | Child Component | featureName | Always |
| registrationService | Service | Events, API | Throughout |
| confirmationModalService | Service | Modal events | Navigation/save |
| featureFlagService | Service | Feature toggles | OnInit |

## Rationale
All interactions are modular and event-driven, supporting a scalable and maintainable architecture. Child components encapsulate form logic for each section, while services manage data, events, and UI state. This enables clear separation of concerns and supports modern Angular best practices.
# Interactions DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Child Component Interactions

### a. Personal Details
- `<personal-details [personalDetails]="personGroup.controls.personalDetailsForm">`
  - **Input:** `personalDetails` (FormGroup)
  - **Purpose:** Displays and manages personal details section of the form.

### b. Contact Details
- `<contact-details [contactDetails]="personGroup.controls.contactDetailsForm" [phoneTypes]="phoneTypes" [states]="states">`
  - **Inputs:**
    - `contactDetails` (FormGroup)
    - `phoneTypes` (array)
    - `states` (array)
  - **Purpose:** Manages contact information, phone, and email fields.

### c. Insurance Details
- `<insurance-details [insuranceDetails]="personGroup.controls.insuranceDetailsForm" *ngIf="!route.patientId">`
  - **Input:** `insuranceDetails` (FormGroup)
  - **Purpose:** Handles insurance information for new patients.
- `<app-patient-insurance *ngIf="route.patientId">`
  - **Purpose:** Displays insurance for existing patients.

### d. Preferences
- `<preferences [patientPreference]="personGroup.controls.preferencesForm" [onlyActive]="true">`
  - **Inputs:**
    - `patientPreference` (FormGroup)
    - `onlyActive` (boolean)
  - **Purpose:** Manages patient preferences and flags.

### e. Dental Records
- `<dental-records [dentalRecords]="personGroup.controls.dentalRecordsForm">`
  - **Input:** `dentalRecords` (FormGroup)
  - **Purpose:** Manages dental history and related fields.

### f. Referrals
- `<patient-referral-crud [fromAddPatientProfile]="true">` (conditional)
  - **Input:** `fromAddPatientProfile` (boolean)
  - **Purpose:** Manages patient referrals during registration.

### g. Additional Identifiers
- `<additional-identifiers [additionalIdentifiers]="personGroup.controls.identifiresForm" [patientIdentifiers]="personInfo.patientIdentifierDtos">` (conditional)
  - **Inputs:**
    - `additionalIdentifiers` (FormGroup)
    - `patientIdentifiers` (array)
  - **Purpose:** Manages additional patient identifiers.

### h. Documents and Account Members
- `<app-patient-documents [patientProfile]="personInfo.Profile">` (conditional)
  - **Input:** `patientProfile` (object)
- `<app-patient-account-members [featureName]="route.patientId?'PatientProfile':'PatientRegistration'">`
  - **Input:** `featureName` (string)

---

## 2. Service Interactions

### a. PatientRegistrationService
- **Injected:** via constructor
- **Purpose:** Handles API calls for patient data, events, and saving.
- **Key Methods Used:**
  - `getPersonByPersonId`, `setRegistrationEvent`, `getRegistrationEvent`, `addPerson`, `updatePerson`
- **Example:**
  ```typescript
  this.registrationService.getPersonByPersonId(this.route.patientId).subscribe(...);
  this.registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.SelectedMenu, data: this.selectedMenuItem });
  ```

### b. ConfirmationModalService
- **Injected:** via constructor
- **Purpose:** Opens and manages confirmation modals.
- **Example:**
  ```typescript
  this.confirmationRef = this.confirmationModalService.open({ data });
  ```

### c. FeatureFlagService
- **Injected:** via constructor
- **Purpose:** Checks feature flags to enable/disable features.
- **Example:**
  ```typescript
  this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe(...);
  ```

### d. StaticData
- **Injected:** via DI token
- **Purpose:** Provides static lists (phone types, states).
- **Example:**
  ```typescript
  this.staticData.PhoneTypes().then(this.phoneTypesOnSuccess);
  ```

---

## 3. Event and Data Flow

- **Scroll Event:**
  - `@HostListener('scroll', ['$event']) onScroll($event)`
  - Updates selected menu item and emits registration event.
- **Form Events:**
  - Form patching and validation methods update form state and trigger service calls.
- **Modal Events:**
  - Modal open/close and confirmation handled via service and local state.
- **RxJS Subscriptions:**
  - Subscribes to registration events and feature flags, cleans up on destroy.

---

## 4. Lifecycle of Interactions
- **OnInit:** Initializes form, fetches static data, subscribes to events.
- **AfterContentInit:** Loads patient data if editing, patches forms.
- **OnDestroy:** Unsubscribes from all observables.
- **User Actions:** Scroll, form input, modal confirmation, and navigation all trigger interactions with services and child components.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
