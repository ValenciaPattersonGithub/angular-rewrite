
# Test Strategy and Requirements Report for `registration-landing`

_Context Source: `DOCS/extraction/extraction-report.md`_

---

## Overview

This report details the test strategy and requirements for the `registration-landing` component, referencing all relevant files with complete relative paths from the workspace root. It is structured for rehydration in a modern Nx/Angular workspace, following the DNA extraction prompt and rehydration guidance in `DOCS/system.prompt.md`.

---

## Test Coverage

- **Unit Tests:**
  - File: `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
  - Covers:
    - Component creation
    - Form initialization and patching
    - Preferences and location logic
    - API service integration (mocked)
    - Event handling (navigation, save, cancel)
    - Business rules (primary location, responsible person, etc.)
    - Error handling (toastr notifications)
    - Feature flag logic

### Example Test Cases

```typescript
// src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts
it('should create', () => {
  expect(component).toBeTruthy();
});

it('should create preferences formcontrols and updateperson', () => {
  patientPreference.selectedPrimaryLocation = [
    { text: 'Location F', value: 35451 },
  ];
  const prefrence = component.personGroup.controls.preferencesForm;
  prefrence.patchValue({
    PrimaryLocations: [
      { text: 'Location D', value: 35461, ObjectState: 'None', LocationId: 35461, LocationName: 'Location D' },
      // ...more locations...
    ],
    AlternateLocations: [
      { PatientLocationId: 31581, LocationId: 35461, IsPrimary: false, LocationName: 'Location D' },
      // ...more alternate locations...
    ],
    CurrentPrimaryLocationId: 35489,
    PrimaryDuplicatePatientId: '',
  });
  spyOn(registrationService, 'updatePerson').and.returnValue(of(mockservice.PersonObj));
  component.savePerson();
  expect(registrationService.updatePerson).toHaveBeenCalled();
  expect(component.PersonObject.Profile).toEqual(mockservice.PersonObj.Profile);
});
```

#### Additional Test Cases (from .spec.ts):
- Navigation after cancel (Edit/Add)
- Save logic with valid/invalid forms
- Patch and validation of form controls

---

## Test Utilities, Mocks, and Helpers

- **TestBed Configuration:**
  - Uses Angular TestBed with mocked providers for all dependencies (services, pipes, etc.)
  - Example:
    ```typescript
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AppKendoUIModule, ...],
      declarations: [RegistrationLandingComponent, ...],
      providers: [
        { provide: PatientRegistrationService, useValue: mockservice },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        // ...other mocks...
      ],
    }).compileComponents();
    ```
- **Mock Services:**
  - `mockservice`, `mockFeatureFlagService`, `mockGroupTypeService`, etc.
  - Use Jasmine spies and RxJS `of()` for observable returns.
- **Test Utilities:**
  - `configureTestSuite` for setup
  - `RouterTestingModule`, `HttpClientTestingModule` for routing and HTTP

---

## Test Runner and Configuration

- **Test Runner:**
  - Karma + Jasmine (legacy)
  - Config: `src/karma.conf.js`
    ```js
    module.exports = function (config) {
      config.set({
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [require('karma-jasmine'), ...],
        reporters: ['progress', 'kjhtml'],
        browsers: ['Chrome'],
        // ...other config...
      });
    };
    ```
- **Test Bootstrap:**
  - `src/test.ts` loads all `.spec.ts` files and initializes Angular testing environment.
    ```typescript
    import 'zone.js/dist/zone-testing';
    import { getTestBed } from '@angular/core/testing';
    // ...
    getTestBed().initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );
    const context = require.context('./', true, /\.spec\.ts$/);
    context.keys().map(context);
    ```

---

## Gaps and Missing Tests

- **Integration Tests:**
  - No integration tests for multi-component workflows or real API calls.
- **End-to-End (e2e) Tests:**
  - No e2e tests for user registration flows.
- **Edge Cases:**
  - Some business rules and error handling may lack edge case coverage.
- **Accessibility/Performance:**
  - No explicit tests for accessibility or performance.

---

## Rehydration Guidance

- Use these test cases and patterns as a baseline for Jest-based unit tests in Nx/Angular 18.
- Add integration and e2e tests for user workflows, business rules, and error handling.
- Ensure all mocks and test utilities are replaced with modern equivalents (Jest, Angular TestBed, Nx libraries).
- Reference all files using complete relative paths.

---

## File References

- Component: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- Unit Tests: `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- Test Bootstrap: `src/test.ts`
- Test Runner Config: `src/karma.conf.js`
