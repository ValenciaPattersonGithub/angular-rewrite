import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { ResponsiblePersonTypeEnum } from "src/@shared/models/responsible-person-type-enum";
import { TranslateService } from "@ngx-translate/core";
import { debounceTime } from "rxjs/operators";
import { RegistrationEvent } from "src/patient/common/models/enums";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { DatePipe } from "@angular/common";
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
import { AgePipe } from "src/@shared/pipes/age/age.pipe";
import { Subscription } from "rxjs";

@Component({
  selector: "personal-details",
  templateUrl: "./personal-details.component.html",
  styleUrls: ["./personal-details.component.scss"],
})
export class PersonalDetailsComponent implements OnInit, OnDestroy {
  @Input() personalDetails: FormGroup;
  @Input() cachePatientSearchList: FormControl;
  @Output() patientsearchListEvent = new EventEmitter();
  private duplicateSearchSub: Subscription;
  showSearch: any = false;
  profilePhotoDetail: string = this.translate.instant(`Your profile photo must be at least 200 pixels wide, and 200 pixels 
    in height; Fuse will crop or scale your photo to fit the space. Fuse recommends that you use JPEG, BMP, PMG, GIF, or TIFF
    images. To add a new profile picture, sign into Facebook and navigate to your profile.`);
  toolTipMessage: string;
  showTooltip: any = false;
  showHeightTooltip: any = false;
  personalDetail = true;
  patientSearchList: any[] = [];
  checkingForDuplicates = false;
  showPhoto = false;
  dateOfBirth: any;
  showAge: boolean;
  maxDate: Date;
  isValidFirstName = true;
  isValidLastName = true;
  isValidDob = true;
  isValidHeightFeet = true;
  isValidHeighInches = true;
  isValidWeight = true;
  isToolTipShow = true;
  weighterrormessage: string;
  incheserrormessage: string;
  feeterrormessage: string;
  doberrormessage: string;
  @Output() selectedValueChanged: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("DOB") datePicker: ElementRef;
  inactiveRadioAuthAbbreviation = "soar-per-perdem-inactv";
  activeInactiveStatusRadio = false;
  responsiblePersonName: any;
  genders = [{ 'value': 'M', 'text': 'Male' }, { 'value': 'F', 'text': 'Female' }];

  private firstnameSub: Subscription;
  private lastnameSub: Subscription;
  private prefferednameSub: Subscription;
  private dobSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private registrationService: PatientRegistrationService,
    private datepipe: DatePipe,
    @Inject("ModalFactory") private modalFactory,
    @Inject("$routeParams") public route,
    private agepipe: AgePipe,
    @Inject("PatientAppointmentsFactory") private patientAppointmentsFactory,
    @Inject("PersonServices") private personServices,
    @Inject("patSecurityService") private patSecurityService,
    @Inject("toastrFactory") private toastrFactory
  ) {}

  ngOnInit() {
    if (this.cachePatientSearchList && (this.cachePatientSearchList.value as Array<any>).length > 0) {
      this.checkingForDuplicates = true;
      this.patientSearchList = this.cachePatientSearchList.value;
    }
    this.duplicatePatients();
    this.maxDate = new Date();
    if (this.personalDetails) {
      this.personalDetails.get("ResponsiblePerson").valueChanges.subscribe((type: any) => {
        if (type) {
          this.showSearch = Number(type) === ResponsiblePersonTypeEnum.other ? true : false;
        }
      });
      this.personalDetails
        .get("DateOfBirth")
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((dob: any) => {
          if (this.route.patientId && this.showSearch) {
            this.responsiblePersonName = this.personalDetails.value ? this.personalDetails.value.ResponsiblePersonName : null;
          }

          if (dob) {
            if (!this.validateYear(dob.getFullYear())) {
              this.isValidDob = false;
              this.personalDetails.controls.DateOfBirth.setErrors({ incorrect: true });
              this.showAge = false;
            } else {
              this.dateOfBirth = new Date(new Date(dob).toDateString());
              this.showAge = this.dateOfBirth > this.maxDate ? false : true;
              if (dob && Number(this.personalDetails.get("ResponsiblePerson").value) === ResponsiblePersonTypeEnum.self) {
                this.validateAge(this.dateOfBirth);
              }
              if (this.agepipe.transform(this.dateOfBirth) < 18) {
                this.isToolTipShow = false;
              } else {
                this.isToolTipShow = true;
              }
              this.isValidDob = true;
              this.personalDetails.controls.DateOfBirth.setErrors(null);
            }
          } else {
            this.showAge = false;
            this.isToolTipShow = true;
          }
        });
    }
    this.registrationService
      .getRegistrationEvent()
      .pipe()
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.SavePatient:
              this.verifyRequiredFields();
              break;
          }
        }
      });
    this.authAccess();
  }

  verifyRequiredFields = () => {
    this.isValidFirstName = this.personalDetails.controls.FirstName.valid;
    this.isValidLastName = this.personalDetails.controls.LastName.valid;
  };
  responsiblePersonTypeChange = (type) => {
    this.onSelectedValueChanged("");
    if (this.dateOfBirth && Number(type) === ResponsiblePersonTypeEnum.self) {
      this.validateAge(this.dateOfBirth);
    }
    this.showSearch = Number(type) === ResponsiblePersonTypeEnum.other ? true : false;
    this.registrationService.setRegistrationEvent({
      eventtype: RegistrationEvent.CheckedResponsiblePerson,
      data: type,
    });
  };
  toolTipText = () => {
    if (!this.showTooltip) {
      this.showTooltip = true;
      this.toolTipMessage = this.translate.instant(`By selecting this option, the patient has authorized the 
        practice to use their signature for insurance claims and agrees to pay for any services not covered by 
        insurance.`);
    }
  };
  duplicatePatients = () => {
    if (this.personalDetails) {
      this.firstnameSub = this.personalDetails
        .get("FirstName")
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((val) => {
          this.populatePatientSearchList();
        });
      this.lastnameSub = this.personalDetails
        .get("LastName")
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((val) => {
          this.populatePatientSearchList();
        });
      this.prefferednameSub = this.personalDetails
        .get("PreferredName")
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((val) => {
          this.populatePatientSearchList();
        });
      this.dobSub = this.personalDetails
        .get("DateOfBirth")
        .valueChanges.pipe(debounceTime(1000))
        .subscribe((val) => {
          this.populatePatientSearchList();
        });
    }
  };
  populatePatientSearchList = () => {
    if (!this.route.patientId) {
      this.checkingForDuplicates = true;
      this.patientSearchList = [
        {
          FirstName: this.personalDetails.value.FirstName,
          LastName: this.personalDetails.value.LastName,
          PreferredName: this.personalDetails.value.PreferredName,
          DateOfBirth: this.personalDetails.value.DateOfBirth,
        },
      ];

      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.SearchForDuplicate,
        data: this.patientSearchList,
      });
      if (this.cachePatientSearchList) {
        this.cachePatientSearchList.setValue(this.patientSearchList);
      }
    }
  };
  onSelectedValueChanged = (selectedValue: any) => {
    this.personalDetails.patchValue({
      ResponsiblePersonId: selectedValue.PatientId,
      ResponsiblePersonName: `${selectedValue.LastName} ${selectedValue.FirstName}`,
    });

    this.registrationService.setRegistrationEvent({
      eventtype: RegistrationEvent.SelectedResponible,
      data: selectedValue,
    });
  };
  onResponsibleValueChanged = (checkedValue: any) => {
    this.registrationService.setRegistrationEvent({
      eventtype: RegistrationEvent.CheckedResponsiblePerson,
      data: checkedValue,
    });
  };
  getCheckedStatus = (value: any, type: any) => {
    return this.personalDetails.get(type).value === value;
  };
  validateYear = (year: number) => {
    var text = /^[0-9]+$/;
    if (year != 0) {
      if (year.toString() != "" && !text.test(year.toString())) {
        this.doberrormessage = this.translate.instant("Please enter numeric values only.");
        return false;
      }
      if (year.toString().length != 4) {
        this.doberrormessage = this.translate.instant("Please enter correct year.");
        return false;
      }
      var current_year = new Date().getFullYear();
      if (year < 1900 || year > current_year) {
        this.doberrormessage = this.translate.instant("Year should be greater than 1900.");
        return false;
      }
      return true;
    }
  };

  validateAge = (dateofbirth: any) => {
    let message, title, continueButtonText, cancelButtonText;
    const dob = this.datepipe.transform(dateofbirth, "MM/dd/yyyy");
    if (dateofbirth != null) {
      const timeDiff = Math.abs(Date.now() - new Date(dateofbirth).getTime());
      const age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
      if (age < 18 && Number(this.personalDetails.get("ResponsiblePerson").value) === ResponsiblePersonTypeEnum.self) {
        message = `Person is under the age of 18.`;
        title = this.translate.instant("Responsible Person Validation");
        continueButtonText = this.translate.instant("Continue");
        cancelButtonText = this.translate.instant("Cancel");
        this.modalFactory.ConfirmModal(title, message, continueButtonText, cancelButtonText).then(this.continueDateOfBirth, this.cancelDateOfBirth);
      }
    }
  };
  continueDateOfBirth = () => {
    this.personalDetails.patchValue({ ResponsiblePerson: "1" });
    this.datePicker.nativeElement.children[1].autofocus = true;
  };
  cancelDateOfBirth = () => {
    this.datePicker.nativeElement.children[1].autofocus = true;
  };
  signatureChanged = (event: any) => {
    this.personalDetails.patchValue({
      SignatureOnFile: event.target.checked,
    });
  };
  checkFirstName = () => {
    if (!this.isValidFirstName) {
      this.isValidFirstName = this.personalDetails.controls.FirstName.valid;
    }
  };
  checkLastName = () => {
    if (!this.isValidLastName) {
      this.isValidLastName = this.personalDetails.controls.LastName.valid;
    }
  };

  checkHeightFeet = () => {
    if (this.personalDetails.controls.HeightFt.value > 8) {
      this.isValidHeightFeet = false;
      this.feeterrormessage = this.translate.instant("valid range (0 - 8 ft.)");
    } else {
      this.isValidHeightFeet = true;
    }
    if (this.personalDetails.controls.DateOfBirth.value != null && this.agepipe.transform(this.personalDetails.controls.DateOfBirth.value) < 18) {
      if (this.personalDetails.controls.HeightFt.value != "") {
        if (this.personalDetails.controls.HeightFt.value > 8) {
          this.isValidHeightFeet = false;
          this.feeterrormessage = this.translate.instant("valid range (0 - 8 ft.)");
        } else {
          this.isValidHeightFeet = true;
        }
      }
    }
  };

  checkHeightInch = () => {
    if (this.personalDetails.controls.HeightIn.value > 11) {
      this.isValidHeighInches = false;
      this.incheserrormessage = this.translate.instant("valid range (0 - 11 in.)");
    } else {
      this.isValidHeighInches = true;
    }
    if (this.personalDetails.controls.DateOfBirth.value != null && this.agepipe.transform(this.personalDetails.controls.DateOfBirth.value) < 18) {
      if (this.personalDetails.controls.HeightIn.value != "") {
        if (this.personalDetails.controls.HeightIn.value > 11) {
          this.isValidHeighInches = false;
          this.incheserrormessage = this.translate.instant("valid range (0 - 11 in.)");
        } else {
          this.isValidHeighInches = true;
        }
      }
    }
  };

  checkWeight = () => {
    if (this.personalDetails.controls.Weight.value > 999.9) {
      this.isValidWeight = false;
      this.weighterrormessage = this.translate.instant(`valid range (0 - 999.9 lbs)`);
    } else {
      this.isValidWeight = true;
    }
    if (this.personalDetails.controls.DateOfBirth.value != null && this.agepipe.transform(this.personalDetails.controls.DateOfBirth.value) < 18) {
      if (this.personalDetails.controls.Weight.value != "") {
        if (this.personalDetails.controls.Weight.value > 999.9) {
          this.isValidWeight = false;
          this.weighterrormessage = this.translate.instant(`valid range (0 - 999.9 lbs)`);
        } else {
          this.isValidWeight = true;
        }
      }
    }
  };

  heightToolTipText = () => {
    if (!this.showHeightTooltip) {
      this.showHeightTooltip = true;
      this.toolTipMessage = this.translate.instant(`ePrescriptions require weight & height for patients under the age of 18.`);
    }
  };
    activeStatusChange = () => {

        if (this.route.patientId) {            
            this.patientAppointmentsFactory.ScheduledAppointmentCount(this.route.patientId).then((res: any) => {
                const numberOfScheduledAppointments = res.Value;
                if (numberOfScheduledAppointments > 0) {
                    this.confirmAppointmentActions();
                } else {
                    this.setPatientActiveStatus(false, false);
                }
            });
        } else {
           this.setPatientActiveStatus(false, false);
        }

    };
  onStatusChange = () => {
    this.activeStatusChange();
  };
  confirmAppointmentActions = () => {
    const patientName = `${this.personalDetails.value.LastName} ${this.personalDetails.value.FirstName}`;
    const message = `${patientName} ${this.translate.instant("has current and/or future scheduled appointments.")}`;
    const message2 = this.translate.instant("To continue, please select one of the following actions:");
    const title = this.translate.instant("Inactivate Patient");
    const button1Text = this.translate.instant("Do Not Inactivate");
    const button2Text = this.translate.instant("Unschedule Appts");
    const button3Text = this.translate.instant("Delete Appts");
    this.modalFactory.DecisionModal(title, message, message2, button1Text, button2Text, button3Text, "").then(this.handleAppts, this.cancelInActivation);
  };
  handleAppts = (unscheduleAppts) => {
    if (unscheduleAppts) {
      // handle future appointments by unscheduling them
      this.setPatientActiveStatus(false, true);
    } else {
      // handle future appointments by deleting them
      this.setPatientActiveStatus(false, false);
    }
  };
  cancelInActivation = () => {
    this.setPatientActiveStatus(true, null);
  };
  setPatientActiveStatus = (isActive: boolean, unscheduleOnly: boolean) => {
    this.personalDetails.patchValue(
      {
        Status: isActive,
        unscheduleOnly,
        updatePatientActive: true,
      },
      { onlySelf: true }
    );
  };
  onPatientStatusChange = () => {
    if (this.route.patientId) {
      // checking if patient has appts or pending charges, if property is mutable they do not
      this.personServices.Persons.getIsPatientPropertyMutability(
        { Id: this.route.patientId },
        (res) => {
          if (res && res.Value === false) {
            this.buildStatusChangeModal();
          }
        },
        () => {
          this.toastrFactory.error(
            this.translate.instant("Failed to determine if patient's status can be updated. Refresh the page to try again."),
            this.translate.instant("Server Error")
          );
          this.patchPatientStatus(true);
        }
      );
    }
  };
  buildStatusChangeModal = () => {
    const title = this.translate.instant("Patient Status Change");
    const name = `${this.personalDetails.value.LastName} ${this.personalDetails.value.FirstName}`;
    let upperMessage =
      name +
      " " +
      this.translate.instant(
        "has scheduled or unscheduled appointments, or has received treatment and cannot be marked as a non-patient. Would you like to inactivate this patient instead?"
      );
    let button1Text = this.translate.instant("Yes");
    const button2Text = this.translate.instant("No");
    if (this.personalDetails.value.Status && this.patSecurityService.IsAuthorizedByAbbreviation(this.inactiveRadioAuthAbbreviation)) {
      this.modalFactory.ConfirmModal(title, upperMessage, button1Text, button2Text).then(
        () => {
          this.patchPatientStatus(false);
          this.activeStatusChange();
          this.patchPatientStatus(true);
        },
        () => {
          this.patchPatientStatus(true);
        }
      );
    } else {
      upperMessage = name + " " + this.translate.instant("has scheduled or unscheduled appointments, or has received treatment and cannot be marked as a non-patient.");
      button1Text = this.translate.instant("OK");
      this.modalFactory.ConfirmModal(title, upperMessage, button1Text).then(() => {
        this.patchPatientStatus(true);
      });
    }
  };
  patchPatientStatus = (isPatient: boolean) => {
    this.personalDetails.patchValue({ Patient: isPatient }, { onlySelf: true });
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  authAccess = () => {
    this.activeInactiveStatusRadio = this.authAccessByType(this.inactiveRadioAuthAbbreviation);
  };

  ngOnDestroy(): void {
    if (this.firstnameSub) {
      this.firstnameSub.unsubscribe();
    }

    if (this.lastnameSub) {
      this.lastnameSub.unsubscribe();
    }
    if (this.prefferednameSub) {
      this.prefferednameSub.unsubscribe();
    }
    if (this.dobSub) {
      this.dobSub.unsubscribe();
    }
  }
}
