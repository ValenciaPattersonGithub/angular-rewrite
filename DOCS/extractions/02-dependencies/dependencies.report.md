# Dependencies Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Angular Core and Platform Dependencies

- **@angular/core**
  - **Imports:** `Component`, `OnInit`, `AfterContentInit`, `OnDestroy`, `ViewChild`, `ElementRef`, `HostListener`, `Inject`
  - **Usage:** Core Angular decorators and lifecycle hooks for component definition and DOM interaction.
  - **Role:** Required for all Angular components; enables lifecycle management, dependency injection, and template binding.
  - **Modern Best Practice:** Use Angular 18+ with strict typing and standalone components where possible.
  - **File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

- **@angular/forms**
  - **Imports:** `FormBuilder`, `FormGroup`, `FormArray`, `Validators`
  - **Usage:** Reactive forms for all patient data sections.
  - **Role:** Enables dynamic, validated forms and form groups.
  - **Modern Best Practice:** Use Angular Reactive Forms with strong typing and custom validators.

- **@angular/platform-browser**
  - **Imports:** `Title`
  - **Usage:** Sets the browser tab title based on patient context.
  - **Role:** Improves user experience and accessibility.

- **@angular/common**
  - **Imports:** `Location`
  - **Usage:** Navigation and browser history management.

---

## Third-Party Libraries

- **@ngx-translate/core**
  - **Imports:** `TranslateService`
  - **Usage:** Internationalization and translation of UI strings.
  - **Role:** Enables multi-language support.
  - **Modern Best Practice:** Use Angular i18n or Nx-supported i18n libraries for new projects.

- **rxjs**
  - **Imports:** `Subject`, `Subscription`
  - **Operators:** `filter`, `refCount`, `take`, `takeUntil`
  - **Usage:** Event handling, subscription management, and memory leak prevention.
  - **Role:** Reactive programming for UI events and service communication.
  - **Modern Best Practice:** Use RxJS 7+ with strong typing and best practices for subscription cleanup.

---

## Application Services and Factories

- **PatientRegistrationService**
  - **Import Path:** `src/patient/common/http-providers/patient-registration.service`
  - **Usage:** API calls for patient CRUD, registration events, and data loading.
  - **Injection:** Via constructor.
  - **Role:** Central service for all patient registration data operations.

- **ConfirmationModalService**
  - **Import Path:** `src/@shared/components/confirmation-modal/confirmation-modal.service`
  - **Usage:** Opens and manages confirmation modals for save/cancel actions.
  - **Role:** User confirmation and modal workflow.

- **FeatureFlagService**
  - **Import Path:** `src/featureflag/featureflag.service`
  - **Usage:** Checks feature flags to enable/disable UI sections (e.g., referrals).
  - **Role:** Feature toggling and conditional UI logic.

- **ImagingPatientService**
  - **Import Path:** Injected via `@Inject('ImagingPatientService')`
  - **Usage:** Syncs patient data with imaging systems.
  - **Role:** Data integration with external imaging systems.

- **PersonFactory**
  - **Import Path:** Injected via `@Inject('PersonFactory')`
  - **Usage:** Sets patient active status and transforms person data.
  - **Role:** Data transformation and business logic.

---

## Static Data and Utilities

- **StaticData**
  - **Injection:** `@Inject('StaticData')`
  - **Usage:** Loads phone types, states, and other static lists for form controls.
  - **Role:** Provides reference data for dropdowns and selectors.

- **toastrFactory**
  - **Injection:** `@Inject('toastrFactory')`
  - **Usage:** Displays success/error notifications to the user.
  - **Role:** User feedback and error messaging.

- **windowObject**
  - **Injection:** `@Inject('windowObject')`
  - **Usage:** Direct access to browser window for navigation and redirects.

- **$routeParams**
  - **Injection:** `@Inject('$routeParams')`
  - **Usage:** Accesses route parameters for patient ID and section navigation.

- **$uibModal**
  - **Injection:** `@Inject('$uibModal')`
  - **Usage:** Opens modal dialogs for loading and confirmation.

- **$location**
  - **Injection:** `@Inject('$location')`
  - **Usage:** Accesses AngularJS location service for navigation (legacy support).

---

## Dependency Injection Example (Constructor)

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

---

## Version and Configuration Notes

- Use latest Angular and RxJS versions for new Nx workspaces.
- Replace legacy AngularJS services (e.g., `$location`, `$routeParams`) with Angular Router and DI tokens.
- Prefer strong typing and explicit interfaces for all injected services and data.

---

**End of Dependencies Report**
