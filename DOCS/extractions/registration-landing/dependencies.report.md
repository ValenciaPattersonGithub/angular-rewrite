# Dependencies DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Import Statements and Dependency Graph

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

```typescript
import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { filter, refCount, take, takeUntil } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { Location } from '@angular/common';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PatientReferralCrudComponent } from '../patient-referrals/patient-referral-crud/patient-referral-crud.component';
```

#### Rationale and Usage
- **Angular Core:** For component, lifecycle, and DOM access.
- **Reactive Forms:** For all form logic and validation.
- **RxJS:** For state, event, and subscription management.
- **@ngx-translate/core:** For i18n and translation.
- **Custom Services:** For API, modal, and feature flag logic.
- **Child Components:** For modular UI sections.

---

## 2. Dependency Injection and Configuration

#### Constructor Injection (from `registration-landing.component.ts`):

```typescript
constructor(
  private titleService: Title,
  private registrationService: PatientRegistrationService,
  private fb: FormBuilder,
  @Inject('StaticData') private staticData,
  @Inject('toastrFactory') private toastrFactory,
  private translate: TranslateService,
  @Inject('windowObject') private window,
  @Inject('$routeParams') public route,
  @Inject('$uibModal') private uibModal,
  @Inject('ImagingPatientService') private imagingPatientService,
  @Inject('PersonFactory') private personFactory,
  private confirmationModalService: ConfirmationModalService,
  private location: Location,
  @Inject('$location') public loc,
  private featureFlagService: FeatureFlagService
) {}
```

- **Rationale:** All business logic, API, and UI services are injected for modularity and testability.

---

## 3. Third-Party and App Services

- **@ngx-translate/core:** Used for all translation and i18n needs.
- **RxJS:** Used for all event, state, and async logic.
- **Custom Services:**
  - `PatientRegistrationService`: API and data logic for patient registration.
  - `ConfirmationModalService`: Modal dialog management.
  - `FeatureFlagService`: Feature flag checks and toggles.
  - `ImagingPatientService`, `PersonFactory`: Domain-specific logic.

---

## 4. Peer, Dev, and Transitive Dependencies

- All dependencies are managed via `package.json` and Angular CLI/Nx workspace configuration.
- Peer dependencies include Angular core, RxJS, and @ngx-translate/core.
- Dev dependencies include testing libraries (Jasmine, TestBed, etc.).

---

## 5. Legacy or Deprecated Dependencies

- Some injected tokens (e.g., `$routeParams`, `$uibModal`) are legacy AngularJS patterns, likely for compatibility with hybrid Angular/AngularJS codebases.
- Rationale: These should be refactored to modern Angular services in a new Nx/Angular workspace.

---

## 6. Dependency Table

| Dependency | Type | Usage |
|------------|------|-------|
| @angular/core | Peer | Component, lifecycle, DOM |
| @angular/forms | Peer | Reactive forms |
| @angular/platform-browser | Peer | Title service |
| @ngx-translate/core | Peer | i18n/translation |
| rxjs | Peer | State, events, async |
| src/@shared/components/confirmation-modal | App | Modal dialogs |
| src/patient/common/http-providers/patient-registration.service | App | API/data |
| src/featureflag/featureflag.service | App | Feature flags |
| ... | ... | ... |

---

## 7. Rationale and Mapping to Requirements

- All dependencies are required for the business logic, UI, and state management of the registration landing page.
- Legacy dependencies should be modernized in Nx/Angular rehydration.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Dependencies Report**# Dependencies DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Import Statements and Dependency Graph

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

```typescript
import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { filter, refCount, take, takeUntil } from 'rxjs/operators';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { Location } from '@angular/common';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PatientReferralCrudComponent } from '../patient-referrals/patient-referral-crud/patient-referral-crud.component';
```

---

## 2. Dependency Usage and Injection

- **Angular Core:** Component, lifecycle hooks, dependency injection, DOM access
- **Reactive Forms:** FormBuilder, FormGroup, FormArray, Validators for form state and validation
- **RxJS:** Subject, Subscription, operators for event and state management
- **@ngx-translate/core:** Translation and i18n
- **@angular/platform-browser:** Title service for document title
- **@angular/common:** Location for navigation
- **App Services:**
  - `PatientRegistrationService`: API and state management
  - `ConfirmationModalService`: Modal dialogs
  - `FeatureFlagService`: Feature flag toggles
  - `PersonFactory`, `ImagingPatientService`, etc.: Utility and domain logic
- **Shared Components:**
  - `PatientReferralCrudComponent`: Child component reference
  - Modal overlay and confirmation

---

## 3. Dependency Rationale and Mapping

- **Purpose:**
  - Each dependency is injected for a specific purpose (API, modal, translation, etc.)
  - All services are provided via Angular DI and referenced in the constructor
  - RxJS is used for all event and state subscriptions
  - Validators are used for all form controls

---

## 4. Version Numbers and Configuration

**File:** `package.json`

// (Add all relevant dependency versions and configuration from package.json here if needed)

---

## 5. Legacy and Deprecated Dependencies

- No explicit legacy or deprecated dependencies in this component, but some patterns (e.g., use of `@Inject` for AngularJS-style DI) may be considered legacy in modern Angular.

---

## 6. Dependency Table

| Dependency | Type | Usage |
|------------|------|-------|
| @angular/core | Angular | Component, lifecycle, DI |
| @angular/forms | Angular | Reactive forms |
| @ngx-translate/core | Third-party | i18n/translation |
| rxjs | Third-party | State/events |
| @angular/platform-browser | Angular | Title service |
| @angular/common | Angular | Location service |
| src/@shared | App | Modals, overlays |
| src/patient/common | App | API, models |
| src/featureflag | App | Feature flags |

---

## 7. Rationale and Best Practices

- All dependencies are required for the component's business logic, UI, and state management
- Modern Angular best practices recommend using Angular DI, RxJS, and modular services
- For Nx/Angular 18, consider updating any legacy DI patterns and ensuring all dependencies are compatible

---

**End of Dependencies Report**# Dependencies DNA Extraction Report

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
