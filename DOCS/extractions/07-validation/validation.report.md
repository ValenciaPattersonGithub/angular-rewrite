# Validation and Error Handling for Forms Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Field Validation Rules

- **Personal Details Form**
  - **Fields:** FirstName, LastName, MiddleInitial, Suffix, PreferredName, DateOfBirth, Gender, ResponsiblePerson, etc.
  - **Validators:**
    - `FirstName`, `LastName`: `Validators.required`, `Validators.maxLength(64)`
    - `MiddleInitial`: `Validators.maxLength(1)`
    - `Suffix`, `PreferredName`: `Validators.maxLength(20|64)`
    - `DateOfBirth`: Optional, but transformed for API
    - `ResponsiblePersonId`: Required if `ResponsiblePerson` is '2' (other)
  - **Code Example:**
    ```typescript
    FirstName: ['', [Validators.required, Validators.maxLength(64)]],
    MiddleInitial: ['', [Validators.maxLength(1)]],
    LastName: ['', [Validators.required, Validators.maxLength(64)]],
    Suffix: ['', [Validators.maxLength(20)]],
    PreferredName: ['', [Validators.maxLength(64)]],
    ...
    ```

- **Contact Details Form**
  - **Fields:** AddressLine1, AddressLine2, City, ZipCode, State, Phones, Emails, etc.
  - **Validators:**
    - `ZipCode`: `Validators.minLength(5)`, `Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$')`
    - `Phones`: Each phone requires `PhoneNumber` (min 10 digits), `PhoneType` (required)
    - `Emails`: Each email requires `EmailAddress` (pattern for email)
  - **Code Example:**
    ```typescript
    PhoneNumber: [null, [Validators.required, Validators.minLength(10)]],
    PhoneType: [0, [Validators.required]],
    EmailAddress: [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$")]],
    ...
    ```

- **Insurance Details Form**
  - **Fields:** Policies (array)
  - **Validators:**
    - `PolicyHolderType`, `PlanName`, `RelationshipToPolicyHolder`: Required based on business logic
  - **Custom Validation:**
    - `ValidateInsuracePolicy` method applies required checks based on policy type

- **Dental Records, Preferences, Referrals, Identifiers**
  - **Fields:** Various, with some required and pattern-based validation
  - **Examples:**
    - `PhoneNumber` in dental records: `Validators.minLength(10)`
    - `Email` in dental records: `Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')`
    - `referralsForm.referralCategory`, `referralsForm.provider`, `referralsForm.referralSource`: Required

---

## Error Feedback to User

- **UI Feedback:**
  - Invalid fields are highlighted in child components using Angular form validation state.
  - Error messages are shown via toastr notifications for missing/invalid data on save.
  - Focus is set to the first invalid section on failed validation.
  - Example:
    ```typescript
    if (!personaldetail.valid) {
      this.setscrollIntoView(this.personalDetail);
      this.toastrFactory.error('Unable to Save', 'Missing Information');
    }
    ```

---

## Edge Cases and Business Logic

- **Duplicate Emails/Phones:**
  - Custom logic checks for duplicates before save; errors surfaced if found.
  - Example:
    ```typescript
    hasDuplicateEmail = (emailAddresses: string[]): boolean => {
      return emailAddresses.some((emailAddress, index) => {
        return emailAddresses.slice(index + 1).some(nextEmailAddress => nextEmailAddress.trim().toLowerCase().normalize("NFC") === emailAddress.trim().toLowerCase().normalize("NFC"));
      });
    }
    ```

- **Required Responsible Person:**
  - If `ResponsiblePerson` is '2' (other) and `ResponsiblePersonId` is missing, validation fails and error is shown.

- **Business Rule Enforcement:**
  - All required fields and business rules are checked before API calls; save is blocked if not met.

---

**End of Validation and Error Handling for Forms Report**
