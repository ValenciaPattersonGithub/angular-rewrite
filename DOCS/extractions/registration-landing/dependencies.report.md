# Dependencies DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Angular Core and Platform Dependencies

- `@angular/core` — Provides core Angular decorators and lifecycle hooks.
  - **Usage:**
    ```typescript
    import { AfterContentInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
    ```
    - Used for component definition, lifecycle, DOM access, and dependency injection.
- `@angular/forms` — Reactive forms API for form controls and validation.
  - **Usage:**
    ```typescript
    import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
    ```
    - Used to build and manage complex forms.
- `@angular/platform-browser` — Title service for setting the browser tab title.
  - **Usage:**
    ```typescript
    import { Title } from '@angular/platform-browser';
    ```
    - Used to set the page title dynamically.
- `@angular/common` — Location service for navigation.
  - **Usage:**
    ```typescript
    import { Location } from '@angular/common';
    ```
    - Used for navigation and history management.

## 2. Third-Party Libraries

- `@ngx-translate/core` — Internationalization and translation support.
  - **Usage:**
    ```typescript
    import { TranslateService } from '@ngx-translate/core';
    ```
    - Used for translating UI strings.
- `rxjs` — Reactive programming utilities.
  - **Usage:**
    ```typescript
    import { Subject, Subscription } from 'rxjs';
    import { filter, refCount, take, takeUntil } from 'rxjs/operators';
    ```
    - Used for event streams, subscriptions, and observable management.

## 3. Application Services and Models

- `src/@shared/components/confirmation-modal/confirmation-modal.overlayref`
- `src/@shared/components/confirmation-modal/confirmation-modal.service`
  - **Usage:**
    ```typescript
    import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
    import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
    ```
    - Used for modal dialog overlays and confirmation dialogs.
- `src/patient/common/http-providers/patient-registration.service`
  - **Usage:**
    ```typescript
    import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
    ```
    - Handles API calls and business logic for patient registration.
- `src/patient/common/models/enums`, `src/patient/common/models/registration-custom-event.model`
  - **Usage:**
    ```typescript
    import { RegistrationEvent } from 'src/patient/common/models/enums';
    import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
    ```
    - Used for event typing and custom event handling.
- `src/@core/feature-flags`, `src/featureflag/featureflag.service`
  - **Usage:**
    ```typescript
    import { FuseFlag } from 'src/@core/feature-flags';
    import { FeatureFlagService } from 'src/featureflag/featureflag.service';
    ```
    - Used for feature flag management and conditional logic.
- `../patient-referrals/patient-referral-crud/patient-referral-crud.component`
  - **Usage:**
    ```typescript
    import { PatientReferralCrudComponent } from '../patient-referrals/patient-referral-crud/patient-referral-crud.component';
    ```
    - Used as a child component for referral management.

## 4. Angular Dependency Injection Tokens

- `'StaticData'`, `'toastrFactory'`, `'windowObject'`, `'$routeParams'`, `'$uibModal'`, `'ImagingPatientService'`, `'PersonFactory'`, `'$location'`
  - **Usage:**
    ```typescript
    constructor(
      ...
      @Inject('StaticData') private staticData,
      @Inject('toastrFactory') private toastrFactory,
      ...
    ) {}
    ```
    - Used to inject application-wide services and factories.

## 5. Test Dependencies (from .spec.ts)

- Angular testing utilities: `@angular/core/testing`, `@angular/platform-browser/animations`, `@angular/forms`, etc.
- Mocks for all services and components used in the main component.
- `rxjs` for observable testing.

## 6. Why These Dependencies?
- **Angular core and forms:** Required for component structure, lifecycle, and form management.
- **Third-party libraries:** Provide translation, reactive programming, and modular UI.
- **App services:** Encapsulate business logic, API calls, and modal/dialog management.
- **Feature flags:** Enable/disable features dynamically for different environments.
- **Testing utilities:** Ensure robust unit and integration testing.

## 7. Modern Platform Guidance
- Use Angular's latest dependency injection and module system.
- Prefer Angular's built-in i18n for new projects, but `@ngx-translate` is still widely used.
- Use RxJS best practices for subscription management (e.g., `takeUntil`, `unsubscribe$`).
- Modularize services and keep business logic out of components where possible.
- Use Angular CLI and Nx workspace for dependency management and code generation.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
