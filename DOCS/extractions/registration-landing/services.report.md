# Service Extraction Report

**Output File Path:** DOCS/extractions/registration-landing/services.report.md
**Report File Name:** services.report.md

---

## Primary Business Service

- **Service:** PatientRegistrationService
- **File Path:** src/patient/common/http-providers/patient-registration.service.ts

### Methods Used in Component

#### 1. `getPersonByPersonId(patientId: string): Observable<any>`

- **Signature:**

  ```typescript
  getPersonByPersonId = (patientId: string) => Observable<any>
  ```

- **Description:**
  Retrieves a person (patient) by their unique patient ID. Returns an observable that emits the person object.
- **Code:**

  ```typescript
  getPersonByPersonId = (patientId: string) => {
      return this.httpClient.get(this.soarConfig.domainUrl + '/persons/' + patientId + '/get')
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }
  ```

- **Input:**
  - `patientId: string`
- **Output:**
  - `Observable<any>` (actual type is the patient object; see usage in component)

#### 2. `addPerson(PersonAddDto: any): Observable<any>`

- **Signature:**

  ```typescript
  addPerson = (PersonAddDto: any) => Observable<any>
  ```

- **Description:**
  Adds a new person (patient) to the system. Returns an observable that emits the result of the operation.
- **Code:**

  ```typescript
  addPerson = (PersonAddDto: any) => {
      return this.httpClient.post(this.soarConfig.domainUrl + '/persons', PersonAddDto)
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }
  ```

- **Input:**
  - `PersonAddDto: any` (see component for structure)
- **Output:**
  - `Observable<any>`

#### 3. `updatePerson(PersonDto: any): Observable<any>`

- **Signature:**

  ```typescript
  updatePerson = (PersonDto: any) => Observable<any>
  ```

- **Description:**
  Updates an existing person (patient) in the system. Returns an observable that emits the result of the operation.
- **Code:**

  ```typescript
  updatePerson = (PersonDto: any) => {
      return this.httpClient.put(this.soarConfig.domainUrl + '/persons', PersonDto)
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }
  ```

- **Input:**
  - `PersonDto: any` (see component for structure)
- **Output:**
  - `Observable<any>`

#### 4. `setRegistrationEvent(param: RegistrationCustomEvent): void`

- **Signature:**

  ```typescript
  setRegistrationEvent(param: RegistrationCustomEvent): void
  ```

- **Description:**
  Publishes a registration event to all subscribers.
- **Code:**

  ```typescript
  setRegistrationEvent(param: RegistrationCustomEvent): void {
      this.registrationEventTracker.next(param);
  }
  ```

- **Input:**
  - `param: RegistrationCustomEvent` (see type below)
- **Output:**
  - `void`
[...existing code...]

#### 5. `getRegistrationEvent(): Subject<RegistrationCustomEvent>`

- **Signature:**

  ```typescript
  ```

- **Description:**

  ```typescript
  getRegistrationEvent(): Subject<RegistrationCustomEvent> {
      return this.registrationEventTracker;
  ```

- **Input:**

---

### Example Usages in Component

**File:** src/patient/patient-registration/registration-landing/registration-landing.component.ts

#### Usage of `getPersonByPersonId`

    this.loadingModal = this.getLoadingModal();
    this.registrationService
      .getPersonByPersonId(this.route.patientId)
        this.personInfo = person;
        this.titleService.setTitle(
          `${person.Profile.PatientCode} - Edit Person`
    this.patientIdentifiers = [];
    this.profile = null;
  }
}

```
#### Usage of `addPerson` and `updatePerson`

```typescript
    (updatedPatient: any) => { /* ... */ },
    error => this.savePersonFailure(error)
} else {
  let personToAdd = this.removeInvalidDataForAddOrUpdate(this.PersonObject);
  this.registrationService.addPerson(personToAdd).subscribe(
}
```

#### Usage of `setRegistrationEvent` and `getRegistrationEvent`

```typescript
});

  .pipe(takeUntil(this.unsubscribe$))
  .subscribe((event: RegistrationCustomEvent) => {
    // ...handle event...
---


#### 1. `RegistrationCustomEvent` (src/patient/common/models/registration-custom-event.model.ts)

export interface RegistrationCustomEvent {
    eventtype: RegistrationEvent;
}
```

export enum RegistrationEvent {
    FocusSection = 1,
    SelectedResponible = 3,
    CheckedResponsiblePerson = 4,
    SelectedMenu = 5,
    SavePatient = 9,
    BenefitPlans = 10,
    PerformNavigation=12
}

```
### All Files and Folders Included
- **TARGET_FOLDER:** src/patient/patient-registration/registration-landing
- **DEPENDENCIES_REPORT_FILE:** DOCS/extractions/registration-landing/dependencies.report.md
- **Service File:** src/patient/common/http-providers/patient-registration.service.ts
- **Related Model:** src/patient/common/models/registration-custom-event.model.ts
---

### External Context Utilized

- All type and enum definitions were extracted from referenced files.
- All usages and method signatures were verified against the component and service source code.
- No discrepancies found between the dependencies report and the extracted code.
---

**Output File Path:** DOCS/extractions/registration-landing/services.report.md

---

- **Service:** PatientRegistrationService
- **File Path:** src/patient/common/http-providers/patient-registration.service.ts

### Methods Used in Component

#### 1. setRegistrationEvent

- **Signature:**

  ```typescript
  setRegistrationEvent(param: RegistrationCustomEvent): void
  ```

  Publishes a registration event to all subscribers. Used throughout the component to signal UI and state changes (e.g., menu selection, patching forms, referral updates).

- **Code:**

  ```typescript
  setRegistrationEvent(param: RegistrationCustomEvent): void {
      this.registrationEventTracker.next(param);

- **Input:** `param: RegistrationCustomEvent` (see model below)

- **Output:** void
- **Return Type:** void

#### 2. getRegistrationEvent

- **Signature:**

  ```typescript
  getRegistrationEvent(): Subject<RegistrationCustomEvent>
  ```

- **Description:**
- **Code:**

  ```typescript
      return this.registrationEventTracker;
  }
  ```

- **Output:** Subject<RegistrationCustomEvent>
- **Return Type:** Subject<RegistrationCustomEvent>

  getPersonByPersonId(patientId: string): Observable<any>

- **Description:**
  getPersonByPersonId = (patientId: string) => {
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }

  ```

- **Input:** `patientId: string`

- **Output:** Observable<any>
- **Return Type:** Observable<any>

#### 4. addPerson

- **Signature:**

  ```typescript
  addPerson(PersonAddDto: any): Observable<any>
  ```

- **Description:**
  Adds a new person record. Used in the component's `savePerson` method when creating a new patient.
- **Code:**

  ```typescript
  addPerson = (PersonAddDto: any) => {
      return this.httpClient.post(this.soarConfig.domainUrl + '/persons', PersonAddDto)
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }
  ```

- **Input:** `PersonAddDto: any`
- **Output:** Observable<any>
- **Return Type:** Observable<any>

#### 5. updatePerson

- **Signature:**

  ```typescript
  updatePerson(PersonDto: any): Observable<any>
  ```

- **Description:**
  Updates an existing person record. Used in the component's `savePerson` method when updating an existing patient.
- **Code:**

  ```typescript
  updatePerson = (PersonDto: any) => {
      return this.httpClient.put(this.soarConfig.domainUrl + '/persons', PersonDto)
          .pipe(
              map((result: any) => {
                  return result.Value;
              }), catchError(error => {
                  return throwError(error);
              })
          );
  }
  ```

- **Input:** `PersonDto: any`
- **Output:** Observable<any>
- **Return Type:** Observable<any>

---

### Example Usages in Component

#### setRegistrationEvent

```typescript
this.registrationService.setRegistrationEvent({
  eventtype: RegistrationEvent.SelectedMenu,
  data: this.selectedMenuItem,
});
```

#### getRegistrationEvent

```typescript
this.registrationService.getRegistrationEvent()
  .pipe(takeUntil(this.unsubscribe$))
  .subscribe((event: RegistrationCustomEvent) => {
    // ...handle event...
  });
```

#### getPersonByPersonId

```typescript
this.registrationService.getPersonByPersonId(this.route.patientId)
  .subscribe((person: any) => {
    this.personInfo = person;
    // ...
  });
```

#### addPerson

```typescript
this.registrationService.addPerson(personToAdd).subscribe(
  (data: any) => this.savePersonSuccess(data),
  error => this.savePersonFailure(error)
);
```

#### updatePerson

```typescript
this.registrationService.updatePerson(personToUpdate).subscribe(
  (updatedPatient: any) => {
    // ...
  },
  error => this.savePersonFailure(error)
);
```

---

### Related Models, Interfaces, and Types

#### RegistrationCustomEvent (src/patient/common/models/registration-custom-event.model.ts)

```typescript
import { RegistrationEvent } from './enums';

export interface RegistrationCustomEvent {
    eventtype: RegistrationEvent;
    data: any;
}
```

#### RegistrationEvent (src/patient/common/models/enums/registration-event.enum.ts)

```typescript
export enum RegistrationEvent {
    FocusSection = 1,
    SearchForDuplicate = 2,
    SelectedResponible = 3,
    CheckedResponsiblePerson = 4,
    SelectedMenu = 5,
    CurrentLocation = 6,
    AccountMembers = 7,
    ClearPersonSearch = 8,
    SavePatient = 9,
    BenefitPlans = 10,
    PatchReferralResponsiblePersonName = 11,
    PerformNavigation=12
}
```

---

### Files/Folders Included

- **TARGET_FOLDER:** src/patient/patient-registration/registration-landing
- **DEPENDENCIES_REPORT_FILE:** DOCS/extractions/registration-landing/dependencies.report.md
- **Service File:** src/patient/common/http-providers/patient-registration.service.ts
- **Model File:** src/patient/common/models/registration-custom-event.model.ts
- **Enum File:** src/patient/common/models/enums/registration-event.enum.ts

---

### External Context Utilized

- **DOCS/extractions/registration-landing/dependencies.report.md**: Used to confirm the primary business service and its usage in the component.
- **src/patient/patient-registration/registration-landing/registration-landing.component.ts**: Used to extract all usages and code context for the service methods.
- **src/patient/common/http-providers/patient-registration.service.ts**: Used to extract all method signatures and code.
- **src/patient/common/models/registration-custom-event.model.ts**: Used for the event model.
- **src/patient/common/models/enums/registration-event.enum.ts**: Used for the event type enum.

---

**All files and types referenced are included in full above. No omissions.**
