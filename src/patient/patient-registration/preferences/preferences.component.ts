import { Component, OnInit, Inject, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { TranslateService } from "@ngx-translate/core";
import cloneDeep from "lodash/cloneDeep";
import { RegistrationEvent } from "src/patient/common/models/enums";
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
import { ResponsiblePersonTypeEnum } from "src/@shared/models/responsible-person-type-enum";
import { OrderByPipe } from "src/@shared/pipes";
import { BroadcastService } from "src/@shared/providers/broad-cast.service";
import { Subscription } from "rxjs";
import { SoarResponse } from "src/@core/models/core/soar-response";
import { GroupType } from "src/business-center/practice-settings/patient-profile/group-types/group-type";
import { GroupTypeService } from "src/@shared/providers/group-type.service";
import { Location } from "src/business-center/practice-settings/location";

@Component({
  selector: "preferences",
  templateUrl: "./preferences.component.html",
  styleUrls: ["./preferences.component.scss"],
})
export class PreferencesComponent implements OnInit {
  @Input() filterByLocationId: any;
  @Input() filterInactiveProviders: boolean = false;
  @Input() onlyActive: boolean = false;
  @Input() selectedProvider: string;
  @Input() patientPreference: FormGroup;
  toolTipMessage: string;
  showTooltip: any = false;
  minDate: Date;
  primaryLocations: Array<{ text: string; value: number; IsDisabled?: boolean }> = [];
  alternateLocations: Array<{ text: string; value: number; IsDisabled?: boolean }> = [];
  discountTypes: Array<{ text: string; value: number; IsDisabled?: boolean }> = [];
  preferredHygienists: Array<{ text: any; value: number }> = [];
  preferredDentists: Array<{ text: any; value: number }> = [];
  masterAlerts: Array<{ text: any; value: number; SymbolId: any }> = [];
  statements: boolean;
  financecharges: boolean;
  allProvidersList: any[] = [];
  providers: any[] = [];
  currentLocation: any;
  preferredHygienistProviderTypeIds: number[] = [1, 2, 3, 5];
  preferredDentistProviderTypeIds: number[] = [1, 5];
  disableStatementsFinaceCharges: boolean;
  alternateOptions: any;
  isLocationExist: any;
  disableFinanceCharges: boolean;
  selectedAlternateLocations: any[] = [];
  cloneSelectedAlternateLocations: any[] = [];
  selectedFlags: any[] = [];
  selectedMasterFlags: any[] = [];
  isValidFlag = true;
  selectedGroups: any[] = [];
  groups: Array<{ text: string; value: string }> = [];
  isValidPrimaryLocation = true;
  patientLocations: any[];
  selectedPrimaryLocation: Array<{ text: string; value: number }> = [];
  oldSelectedPrimaryLocationId: any;
  isPrefHygienistExist: any;
  isPrefDentistExist: any;

  soarAuthCustomFlagsAddKey = "soar-biz-bmalrt-add";
  soarAuthCustomFlagsEditModeKey = "soar-per-peralt-add";
  editDiscountAuthAbbreviation = "soar-per-perdsc-edit";
  editGroupAuthAbbreviation = "soar-per-pergrp-edit";
  hasCreateAccess: any;
  hasEditDiscountAccess = false;
  hasEditGroupAccess = false;
  subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    @Inject("referenceDataService") private referenceDataService,
    @Inject("locationService") private locationService,
    private fb: FormBuilder,
    private registrationService: PatientRegistrationService,
    private translate: TranslateService,
    @Inject("toastrFactory") private toastrFactory,
    private groupTypeService: GroupTypeService,
    @Inject("patSecurityService") private patSecurityService,
    @Inject("$routeParams") private route,
    private broadCastService: BroadcastService
  ) {}

  ngOnInit(): void {
    this.statements = true;
    this.financecharges = true;
    const today = new Date();
    this.minDate = new Date(today);
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.authAccess();
    this.getLocations();
    this.getAllMasterDiscountTypes();
    this.loadProvidersByLocation();
    this.handlePersonRegristerationEvents();
    this.getAllMasterPatientAlerts();
    this.getAllGroups();
    this.broadCastService.messagesOfType("discountTypes").subscribe((message) => {
      if (message) {
        const payload = message.payload;
        const item = { text: payload.data.DiscountName, value: payload.data.MasterDiscountTypeId };
        this.updateSources(payload.mode, this.discountTypes, null, item);
      }
    });
    this.broadCastService.messagesOfType("masterAlerts").subscribe((message) => {
      if (message) {
        const payload = message.payload;
        const item = {
          text: payload.data.Description,
          value: payload.data.MasterAlertId,
          SymbolId: payload.data.SymbolId,
        };
        this.updateSources(payload.mode, this.masterAlerts, this.selectedFlags, item);
      }
    });
    this.broadCastService.messagesOfType("groupTypes").subscribe((message) => {
      if (message) {
        const payload = message.payload;
        const item = { text: payload.data.GroupTypeName, value: payload.data.MasterPatientGroupId };
        this.updateSources(payload.mode, this.groups, this.selectedGroups, item);
      }
    });
  }
  toolTipText = () => {
    if (!this.showTooltip) {
      this.showTooltip = true;
      this.toolTipMessage = this.translate.instant(`Enter multiple Custom Flags simultaneously by using comma (,) to separate text.`);
    }
  };
  updateSources = (mode: any, dropdownSource: any, chipsSource: any, item: any) => {
    if (mode === "add") {
      dropdownSource.push(item);
    } else if (mode === "update") {
      const ddFilter = dropdownSource.filter((x: any) => x.value === item.value);
      if (ddFilter && ddFilter.length) {
        ddFilter[0].text = item.text;
      }
      if (chipsSource) {
        const chipsFilter = chipsSource.filter((x: any) => x.value === item.value);
        if (chipsFilter && chipsFilter.length) {
          chipsFilter[0].text = item.text;
        }
      }
    } else if (mode === "delete") {
      const ddlIndex = dropdownSource.findIndex((x: any) => x.value === item.value);
      dropdownSource.splice(ddlIndex, 1);
      if (chipsSource) {
        const chipsIndex = chipsSource.findIndex((x: any) => x.value === item.value);
        chipsSource.splice(chipsIndex, 1);
      }
    }
  };
  handlePersonRegristerationEvents = () => {
    this.registrationService
      .getRegistrationEvent()
      .pipe()
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.CheckedResponsiblePerson:
              this.handleCheckedResponsiblePerson(event);
              break;
            case RegistrationEvent.SelectedResponible:
              this.handleSelectedResponsiblePerson(event);
              break;
            case RegistrationEvent.CurrentLocation:
              this.handleCurrentLocation(event);
              break;
            case RegistrationEvent.SavePatient:
              this.verifyRequiredFields();
              break;
          }
        }
      });
    this.patientPreferenceUpdate(this.patientPreference);
  };
  handleSelectedResponsiblePerson = (event: RegistrationCustomEvent) => {
    if (event.data) {
      if (event.data.PersonAccount) {
        this.statements = event.data.PersonAccount.ReceivesStatements;
        this.financecharges = event.data.PersonAccount.ReceivesFinanceCharges;
      }
    } else {
      this.statements = true;
      this.financecharges = true;
    }
    this.patientPreference.patchValue(
      {
        ReceivesStatements: this.statements,
        ReceivesFinanceCharges: this.financecharges,
      },
      { emitEvent: false }
    );
  };
  patientPreferenceUpdate = (patientPreference: any) => {
    if (patientPreference) {
      patientPreference.valueChanges.subscribe((preference: any) => {
        if (preference.Flags.length) {
          const flags = preference.Flags.map((flag) => ({
            Description: flag.Description ?? flag.text,
            ExpirationDate: flag.ExpirationDate ?? undefined,
            MasterAlertId: flag.MasterAlertId ?? undefined,
            ObjectState: flag.ObjectState ?? undefined,
            PatientAlertId: flag.PatientAlertId ?? undefined,
            PatientId: flag.PatientId ?? undefined,
            SymbolId: flag.SymbolId ?? undefined,
            text: flag.Description ?? flag.text,
            value: flag.MasterAlertId ?? undefined,
          }));
          //const masterFlags = flags.map(({ Description, ExpirationDate, MasterAlertId, ObjectState, PatientAlertId, PatientId, ...item }) => item);
          this.selectedFlags = flags;
          this.selectedMasterFlags = [...flags.filter((x) => x.SymbolId)];
        }
        if (preference.Groups.length) {
          this.selectedGroups = preference.Groups.map((group) => ({
            text: group.Description,
            value: group.MasterGroupId,
          }));
        }
        if (preference.AlternateLocations.length) {
          this.selectedAlternateLocations = [];
          let alternateLocations = [];
          if (this.selectedPrimaryLocation.length > 0) {
            alternateLocations = preference.AlternateLocations.filter((x) => x.LocationId !== Number(this.selectedPrimaryLocation[0].value));
            this.selectedAlternateLocations = this.getCloneAlternateLocations(alternateLocations);
            this.oldSelectedPrimaryLocationId = Number(this.selectedPrimaryLocation[0].value);
          } else {
            this.selectedAlternateLocations = this.getCloneAlternateLocations(preference.AlternateLocations);
            this.oldSelectedPrimaryLocationId = preference.CurrentPrimaryLocation.LocationId;
          }
        }
        this.statements = preference.ReceivesStatements;
        this.financecharges = preference.ReceivesFinanceCharges;
      });
    }
  };
  ValidatePrimaryLocationSelection = (LocationId: any) => {
    let checkPrimaryLocation = this.primaryLocations.filter((loc) => loc.value == LocationId);
    if (!checkPrimaryLocation.length) {
      this.patientPreference.patchValue({ PrimaryLocation: "", PrimaryLocationName: "" });
    }
  };
  getCloneAlternateLocations = (alternateLocations: any) => {
    if (alternateLocations) {
      alternateLocations.forEach((location: any) => {
        this.selectedAlternateLocations.push({
          text: !!location.LocationName ? location.LocationName : location.text,
          value: !!location.LocationId ? location.LocationId : location.value,
          IsDisabled: location.PatientActivity,
          ObjectState: location.ObjectState,
        });
      });
      if (this.cloneSelectedAlternateLocations.length == 0) {
        alternateLocations.forEach((location: any) => {
          this.cloneSelectedAlternateLocations.push({
            text: !!location.LocationName ? location.LocationName : location.text,
            value: !!location.LocationId ? location.LocationId : location.value,
            ObjectState: location.ObjectState,
            LocationName: location.text,
            LocationId: location.value,
            IsDisabled: location.PatientActivity,
          });
        });
        this.patientPreference.patchValue({
          CloneAlternateLocations: this.cloneSelectedAlternateLocations.map((location: any) => ({
            value: !!location.LocationId ? location.value : location.LocationId,
            ObjectState: location.ObjectState,
            text: !!location.LocationName ? location.LocationName : location.text,
            LocationName: !!location.LocationName ? location.LocationName : location.text,
            LocationId: !!location.LocationId ? location.LocationId : location.value,
            IsDisabled: location.PatientActivity,
          })),
        });
      }
    }
    if (this.alternateLocations.length && this.patientPreference && this.patientPreference.value.PrimaryLocation) {
      this.alternateLocations = this.alternateLocations.filter((x) => x.value !== this.patientPreference.value.PrimaryLocation);
      this.alternateLocations.forEach((location: any) => {
        location.IsDisabled = false;
        const disabledLocation = this.selectedAlternateLocations.filter((x) => x.value === location.value)[0];
        if (disabledLocation) {
          location.IsDisabled = disabledLocation.IsDisabled;
        }
      });
    }
    return this.selectedAlternateLocations;
  };
  verifyRequiredFields = () => {
    this.isValidPrimaryLocation = !!this.patientPreference.controls.PrimaryLocation.value;
  };
  handleCheckedResponsiblePerson = (event: RegistrationCustomEvent) => {
    this.disableStatementsFinaceCharges = Number(event.data) === ResponsiblePersonTypeEnum.other ? true : false;
    this.disableFinanceCharges = Number(event.data) === ResponsiblePersonTypeEnum.other ? true : false;
  };
  handleCurrentLocation = (event: RegistrationCustomEvent) => {
    if (event.data) {
      if (this.patientPreference.get("PrimaryLocation").value) {
        event.data.id = this.patientPreference.get("PrimaryLocation").value;
      }
      this.isLocationExist = this.primaryLocations.filter((x) => x.value === event.data.id)[0];
      if (this.isLocationExist) {
        this.selectedPrimaryLocation = this.isLocationExist;
        this.alternateLocations = this.alternateLocations.filter((x) => x.value !== this.isLocationExist.value);
        this.patientPreference.patchValue({ PrimaryLocation: this.isLocationExist.value, PrimaryLocationName: this.isLocationExist.text });
        this.filterProviderList(this.allProvidersList, event.data.id);
      } else {
        this.patientPreference.patchValue({ PrimaryLocation: "", PrimaryLocationName: "" });
      }

      //Shahzad.ilyas
      //bug: 475002
      //desription: in-case of Dentist/Hygienist mark as 'not a provider' system should set primary Dentist/Hygienist equal to null
      let hygienistId = this.patientPreference.get("PreferredHygienists").value;
      let dentistId = this.patientPreference.get("PreferredDentists").value;
      if (hygienistId) {
        this.isPrefHygienistExist = this.preferredHygienists.filter((Hygienist) => Hygienist.value === hygienistId)[0];
        if (!this.isPrefHygienistExist) {
          this.patientPreference.patchValue({ PreferredHygienists: null }, { emitEvent: false });
        }
      }
      if (dentistId) {
        this.isPrefDentistExist = this.preferredHygienists.filter((dentist) => dentist.value === dentistId)[0];
        if (!this.isPrefDentistExist) {
          this.patientPreference.patchValue({ PreferredDentists: null }, { emitEvent: false });
        }
      }
    }
  };

  receiveStatements = (event: any) => {
    this.statements = event.currentTarget.checked;
    if (!this.statements) {
      this.financecharges = false;
      this.disableFinanceCharges = true;
    } else {
      this.disableFinanceCharges = false;
    }
    this.patientPreference.patchValue({
      ReceivesStatements: this.statements,
      ReceivesFinanceCharges: this.financecharges,
    });
  };
  receiveFinanceCharges = (event: any) => {
    this.financecharges = event.currentTarget.checked;
    this.patientPreference.patchValue({
      ReceivesFinanceCharges: this.financecharges,
    });
  };
  getLocations = () => {
    this.referenceDataService.getData(this.referenceDataService.entityNames.locations).then((res:Location) => {
      this.locationServicesGetOnSuccess({ Value: res });
    });
  };
  locationServicesGetOnSuccess = (res) => {
    const allLocations = res.Value;
    this.locationService.getCurrentPracticeLocations().then((userLocations) => {
      this.filterLocations(allLocations, userLocations);
    });
  };
  filterLocationsByUserLocations = (allLocations, userLocations) => {
    const userLocationIds = userLocations.map((location) => location.id);
    return allLocations.filter((location: any) => {
      return userLocationIds.indexOf(location.LocationId) !== -1;
    });
  };

  filterLocations = (allLocations, userLocations) => {
    const filteredLocations = this.filterLocationsByUserLocations(allLocations, userLocations);
    this.patientPreference.patchValue({
      PrimaryLocations: this.primaryLocations,
    });

    if (filteredLocations.length > 0) {
      filteredLocations.forEach((location: any) => {
        this.primaryLocations.push({
          text: location.NameLine1,
          value: location.LocationId,
        });
      });
      this.primaryLocations = this.applyOrderByPipe(this.primaryLocations);
      this.ValidatePrimaryLocationSelection(this.patientPreference.controls["CurrentPrimaryLocation"].value.LocationId);
      if (!this.route.patientId) {
        setTimeout(() => {
          const userLocation = JSON.parse(sessionStorage.getItem("userLocation"));
          this.isLocationExist = this.primaryLocations.filter((x) => x.value === userLocation.id);
          if (userLocation && this.isLocationExist.length) {
            this.patientPreference.patchValue({ PrimaryLocation: userLocation.id });
            const selectedlocation = this.primaryLocations.filter((x) => x.value === userLocation.id)[0];
            this.patientPreference.patchValue({
              PrimaryLocationName: selectedlocation.text,
            });
            this.alternateLocations = this.primaryLocations.filter((x) => x.value !== selectedlocation.value);
            this.alternateLocations = this.applyOrderByPipe(this.alternateLocations);
          } else {
            this.patientPreference.patchValue({ PrimaryLocation: "", PrimaryLocationName: "" });
          }
        }, 1000);
      } else {
        this.oldSelectedPrimaryLocationId = this.patientPreference.get("PrimaryLocation").value;
      }
      this.alternateLocations = this.primaryLocations.filter((x) => x.value !== this.patientPreference.get("PrimaryLocation").value);
      this.alternateLocations = this.applyOrderByPipe(this.alternateLocations);
    }
  };
  onPrimaryLocationSelected = (event: any) => {
    if (event.target.value && event.target.value !== "0") {
      this.isValidPrimaryLocation = true;
      this.selectedPrimaryLocation = this.primaryLocations.filter((x) => x.value === Number(event.target.value));
      this.alternateLocations = this.primaryLocations.filter((x) => x.value !== Number(event.target.value));
      if (this.selectedAlternateLocations.length) {
        this.selectedAlternateLocations = this.selectedAlternateLocations.filter((x) => x.value !== parseInt(event.target.value));
        this.cloneSelectedAlternateLocations = this.cloneSelectedAlternateLocations.filter((x) => x.value !== parseInt(event.target.value));
      }
      if (this.oldSelectedPrimaryLocationId != event.target.value) {
        let oldPrimaryLocation = this.primaryLocations.filter((x) => x.value == this.oldSelectedPrimaryLocationId);
        if (!oldPrimaryLocation.length) {
          oldPrimaryLocation.push({
            text: this.patientPreference.controls["CurrentPrimaryLocation"].value.LocationName,
            value: this.patientPreference.controls["CurrentPrimaryLocation"].value.LocationId,
          });
        }
        if (oldPrimaryLocation.length > 0) {
          this.cloneSelectedAlternateLocations.push({
            value: oldPrimaryLocation[0].value,
            ObjectState: "Delete",
            text: oldPrimaryLocation[0].text,
            LocationName: oldPrimaryLocation[0].text,
            LocationId: oldPrimaryLocation[0].value,
          });
        }
      }
      this.patientPreference.patchValue({
        CloneAlternateLocations: this.cloneSelectedAlternateLocations.map((location: any) => ({
          value: location.value,
          ObjectState: location.ObjectState,
          text: location.text,
          LocationName: location.text,
          LocationId: location.value,
        })),
        PrimaryLocationName: this.selectedPrimaryLocation[0].text,
        PreferredDentists: "",
        PreferredHygienists: "",
        PrimaryLocation: Number(event.target.value),
      });
      this.oldSelectedPrimaryLocationId = this.selectedPrimaryLocation.length > 0 ? this.selectedPrimaryLocation[0].value : "";
      this.filterProviderList(this.allProvidersList, this.selectedPrimaryLocation[0].value);
    }
  };
  getAllMasterDiscountTypes = () => {
    this.registrationService.getAllMasterDiscountTypes().subscribe(
      (data: any) => this.getAllMasterDiscountTypesSuccess(data),
      (error) => this.getAllMasterDiscountTypesFailure()
    );
  };
  getAllMasterDiscountTypesSuccess = (res: any) => {
    this.discountTypes = [];
    if (res) {
      res.forEach((discountType: any) => {
        if (discountType.IsActive) {
          this.discountTypes.push({ text: discountType.DiscountName, value: discountType.MasterDiscountTypeId });
        }
      });
    }
  };
  getAllMasterDiscountTypesFailure = () => {
    this.toastrFactory.error(this.translate.instant("Failed to retrieve the Discount Information."), this.translate.instant("Server Error"));
  };
  loadProvidersByLocation() {
    this.allProvidersList = [];
    this.providers = [];
    this.currentLocation = this.locationService.getCurrentLocation();
    this.allProvidersList = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    if (this.currentLocation) {
      this.filterProviderList(this.allProvidersList, this.currentLocation.id);
    }
  }
  filterProviderList = (allProvidersList, filterByLocationId) => {
    filterByLocationId = parseInt(filterByLocationId);
    let filteredProviderList = [];
    // if filterByLocation is passed to directive, filter by this location
    filteredProviderList = this.filterProvidersByUserLocations(allProvidersList, filterByLocationId);
    // filter list for onlyActive
    filteredProviderList = this.filterProviderListForOnlyActive(filteredProviderList);
    // filter by providerType
    filteredProviderList = this.filterByProviderType(filteredProviderList);
  };
  filterByProviderType = (providerList) => {
    let filteredProviderList = [];
    const filteredPreferredDentist = [];
    this.preferredDentists = [];
    this.preferredHygienists = [];
    if (this.preferredHygienistProviderTypeIds) {
      providerList.forEach((provider) => {
        const index = this.preferredHygienistProviderTypeIds.indexOf(provider.UserLocationSetup.ProviderTypeId);
        if (index !== -1) {
          filteredProviderList.push(provider);
        }
      });
    }
    if (this.preferredDentistProviderTypeIds) {
      providerList.forEach((provider) => {
        const index = this.preferredDentistProviderTypeIds.indexOf(provider.UserLocationSetup.ProviderTypeId);
        if (index !== -1) {
          filteredPreferredDentist.push(provider);
        }
      });
    } else {
      filteredProviderList = providerList;
    }
    if (filteredProviderList.length) {
      this.populateLists(filteredProviderList, "PreferredHygienist");
    }
    if (filteredPreferredDentist.length) {
      this.populateLists(filteredPreferredDentist, "PreferredDentist");
    }

    return filteredProviderList;
  };
  populateLists = (filteredList: any, listType: any) => {
    if (listType === "PreferredDentist") {
      filteredList.forEach((providerList: any) => {
        this.preferredDentists.push({
          text: `${providerList.FirstName} ${providerList.LastName}${providerList.ProfessionalDesignation ? `, ${providerList.ProfessionalDesignation}` : ""}`,
          value: providerList.UserId,
        });
      });
      this.preferredDentists = this.applyOrderByPipe(this.preferredDentists);
    } else if (listType === "PreferredHygienist") {
      filteredList.forEach((providerList: any) => {
        this.preferredHygienists.push({
          text: `${providerList.FirstName} ${providerList.LastName}${providerList.ProfessionalDesignation ? `, ${providerList.ProfessionalDesignation}` : ""}`,
          value: providerList.UserId,
        });
      });
      this.preferredHygienists = this.applyOrderByPipe(this.preferredHygienists);
    }
  };
  filterProvidersByUserLocations = (providerList, filterByLocationId) => {
    const filteredProviderList = [];
    providerList.forEach((provider) => {
      const userLocationSetup = provider.Locations
        ? provider.Locations.find((userLocationSetup) => {
            return userLocationSetup.LocationId === filterByLocationId;
          })
        : null;
      if (userLocationSetup) {
        // NOTE
        // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
        // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
        // bottom of provider list when list is based on a location
        provider.IsActive = userLocationSetup.IsActive;
        provider.UserLocationSetup = cloneDeep(userLocationSetup);
        filteredProviderList.push(provider);
      }
    });
    return filteredProviderList;
  };
  filterProviderListForOnlyActive(providerList) {
    // if selectedProvider is not in list, add it to filtered list for display
    // (may have been deactivated after service transaction created)
    return this.onlyActive === true
      ? providerList.filter((provider) => {
          return provider.IsActive === true || (this.selectedProvider && provider.UserId === this.selectedProvider);
        })
      : providerList;
  }
  getAllMasterPatientAlerts = () => {
    this.registrationService.getAllMasterPatientAlerts().subscribe(
      (data: any) => this.getAllMasterPatientAlertsSuccess(data),
      (error) => this.getAllMasterPatientAlertsFailure()
    );
  };
  getAllMasterPatientAlertsSuccess = (res: any) => {
    if (res) {
      this.masterAlerts = [];
      res.forEach((masterAlert: any) => {
        this.masterAlerts.push({
          text: masterAlert.Description,
          value: masterAlert.MasterAlertId,
          SymbolId: masterAlert.SymbolId,
        });
      });
      this.masterAlerts = this.applyOrderByPipe(this.masterAlerts);
    }
  };
  getAllMasterPatientAlertsFailure = () => {
    this.toastrFactory.error(this.translate.instant("Failed to retrieve the list of alerts. Refresh the page to try again."), this.translate.instant("Server Error"));
  };
  applyOrderByPipe = (list: any) => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(list, { sortColumnName: "text", sortDirection: 1 });
  };

  getSelectedAlternateLocations = (locations: any) => {
    this.selectedAlternateLocations = locations;
    this.patientPreference.patchValue({
      AlternateLocations: this.selectedAlternateLocations.map((location: any) => ({
        value: location.value,
        ObjectState: !!location.ObjectState ? location.ObjectState : "Add",
        text: location.text,
        LocationName: location.text,
        LocationId: location.value,
        IsDisabled: location.IsDisabled,
        PatientActivity: location.IsDisabled,
      })),
    });

    this.cloneSelectedAlternateLocations = locations;
    this.patientPreference.patchValue({
      CloneAlternateLocations: this.cloneSelectedAlternateLocations.map((location: any) => ({
        value: location.value,
        ObjectState: "Add",
        text: location.text,
        LocationName: location.text,
        LocationId: location.value,
        IsDisabled: location.IsDisabled,
        PatientActivity: location.IsDisabled,
      })),
    });
    this.patientPreference.markAsDirty();
  };
  removeSelectedAlternateLocations = ($event: any, index: any) => {
    if ($event) {
      let splicedLocation = this.selectedAlternateLocations.splice(index, 1);
      let clonSplicedLocation = this.cloneSelectedAlternateLocations.splice(index, 1);
      this.patientPreference.patchValue({
        AlternateLocations: this.selectedAlternateLocations.map((location: any) => ({
          value: location.value,
          ObjectState: location.ObjectState != undefined ? location.ObjectState : "None",
          text: location.text,
          LocationName: location.text,
          LocationId: location.value,
          IsDisabled: location.IsDisabled,
          PatientActivity: location.IsDisabled,
        })),
      });

      this.cloneSelectedAlternateLocations.push({
        value: splicedLocation[0].value,
        ObjectState: "Delete",
        text: splicedLocation[0].text,
        LocationName: splicedLocation[0].text,
        LocationId: splicedLocation[0].value,
        IsDisabled: splicedLocation[0].IsDisabled,
        PatientActivity: splicedLocation[0].IsDisabled,
      });
      this.patientPreference.patchValue({
        CloneAlternateLocations: this.cloneSelectedAlternateLocations,
      });
    }
    this.patientPreference.markAsDirty();
  };
  getSelectedFlags = (masterFlags: any) => {
    this.selectedMasterFlags = masterFlags;
    this.selectedFlags = [...new Set([...this.selectedFlags, ...masterFlags])];
    this.selectedFlags = this.selectedFlags.filter((x) => x.isCustom || !x.SymbolId || this.selectedMasterFlags.includes(x));
    this.patientPreference.patchValue(
      {
        Flags: this.selectedFlags.map((flag: any) => ({
          Description: flag.text,
          MasterAlertId: flag.value ? flag.value : undefined,
          SymbolId: flag.SymbolId ? flag.SymbolId : undefined,
          ObjectState: "Add",
          ExpirationDate: flag.ExpirationDate,
          PatientId: this.route.patientId ? this.route.patientId : null,
          PatientAlertId: flag.PatientAlertId,
        })),
      },
      { emitEvent: false }
    );
    this.patientPreference.markAsDirty();
  };
  removeSelectedFlags = ($event: any, index: any) => {
    if ($event) {
      const flag = this.selectedFlags[index];
      if (!flag.isCustom) {
        const masterflagIndex = this.selectedMasterFlags.indexOf(flag);
        this.selectedMasterFlags.splice(masterflagIndex, 1);
      }
      this.selectedFlags.splice(index, 1);
      this.patientPreference.patchValue({
        Flags: this.selectedFlags.map((flag: any) => ({
          Description: flag.text,
          MasterAlertId: flag.value ? flag.value : null,
          SymbolId: flag.SymbolId ? flag.SymbolId : null,
          ObjectState: "Add",
          ExpirationDate: flag.ExpirationDate,
          PatientId: this.route.patientId ? this.route.patientId : null,
          PatientAlertId: flag.PatientAlertId,
        })),
      });
    }
    this.patientPreference.markAsDirty();
  };
  addCustomFlag = () => {
    if (this.hasCreateAccess) {
      if (this.patientPreference.controls.CustomFlag.valid) {
        this.patientPreference.markAsDirty();
        let flagvalue = `${this.patientPreference.controls.CustomFlag.value}`;
        let flagArray = flagvalue.split(",");
        for (let i = 0; i <= flagArray.length - 1; i++) {
          const flag = this.patientPreference.controls.EndDate.value
            ? flagArray[i] + ` (${this.patientPreference.controls.EndDate.value.toLocaleDateString("en-US")})`
            : flagArray[i];
          const customFlag = {
            text: flag,
            value: flag,
            isCustom: true,
            ExpirationDate: this.patientPreference.controls.EndDate.value,
            customFlagText: this.patientPreference.controls.CustomFlag.value,
          };
          this.selectedFlags.push({
            text: customFlag.text,
            value: undefined,
            Description: customFlag.isCustom ? customFlag.text : customFlag.customFlagText,
            MasterAlertId: undefined,
            SymbolId: "",
            ObjectState: "Add",
            ExpirationDate: customFlag.ExpirationDate ? customFlag.ExpirationDate : undefined,
            PatientId: this.route.patientId ? this.route.patientId : undefined,
            PatientAlertId: undefined,
          });
        }
        this.patientPreference.patchValue(
          {
            CustomFlag: "",
            EndDate: "",
            Flags: this.selectedFlags,
          },
          { emitEvent: true }
        );
        this.isValidFlag = true;
      } else {
        this.isValidFlag = this.patientPreference.controls.CustomFlag.valid;
      }
    }
  };
  getAllGroups = () => {
    this.subscriptions.push(this.groupTypeService.get()?.subscribe({
      next: (groupTypesList: SoarResponse<Array<GroupType>>) => this.groupAllGetSuccess(groupTypesList),
      error: () => this.groupAllGetFailed()
    }));
  };
  groupAllGetSuccess = (groups: SoarResponse<Array<GroupType>>) => {
    if (groups?.Value && this.hasEditGroupAccess) {
      this.groups = [];
      const list = groups.Value;
      list.forEach((group: GroupType) => {
        this.groups.push({ text: group?.GroupTypeName, value: group?.MasterPatientGroupId });
      });
    }
  };

  groupAllGetFailed = () => {
    this.toastrFactory.error(this.translate.instant("Failed to retrieve the list of group types. Refresh the page to try again."), this.translate.instant("Server Error"));
  };

  getSelectedGroups = (groups: any) => {
    this.selectedGroups = groups;
    this.patientPreference.patchValue({
      Groups: this.selectedGroups.map((group: any) => ({
        Description: group.text,
        MasterGroupId: group.value,
        ObjectState: "Add",
      })),
    });
    this.patientPreference.markAsDirty();
  };
  removeSelectedGroups = ($event: any, index: any) => {
    if ($event) {
      this.selectedGroups.splice(index, 1);
      this.patientPreference.patchValue({
        Groups: this.selectedGroups.map((group: any) => ({
          Description: group.text,
          MasterGroupId: group.value,
          ObjectState: "Add",
        })),
      });
    }
    this.patientPreference.markAsDirty();
  };
  onDentistSelected = (event: any) => {
    if (event.target.value && event.target.value !== "0") {
      const selectedDentist = this.preferredDentists.filter((x) => x.value === event.target.value)[0];
      this.patientPreference.patchValue({
        PreferredDentistsName: selectedDentist.text,
      });
    } else {
      this.patientPreference.patchValue({
        PreferredDentistsName: "",
      });
    }
  };
  onHygienistsSelected = (event: any) => {
    if (event.target.value && event.target.value !== "0") {
      const selectedDentist = this.preferredHygienists.filter((x) => x.value === event.target.value)[0];
      this.patientPreference.patchValue({
        PreferredHygienistsName: selectedDentist.text,
      });
    } else {
      this.patientPreference.patchValue({
        PreferredHygienistsName: "",
      });
    }
  };
  onDiscountSelected = (event: any) => {
    if (event.target.value && event.target.value !== "0") {
      const selectedDiscount = this.discountTypes.filter((x) => x.value === event.target.value)[0];
      let ObjectState = this.patientPreference.controls.DiscountTypeObjectState.value;
      if (ObjectState !== "Add") {
        ObjectState = "Update";
      }
      this.patientPreference.patchValue({
        DiscountName: selectedDiscount.text,
        DiscountTypeObjectState: ObjectState,
      });
    } else {
      this.patientPreference.patchValue({
        DiscountName: "",
        DiscountTypeObjectState: "Delete",
      });
    }
  };
  authAccess = () => {
    this.hasCreateAccess = this.authAccessByType(this.route.patientId ? this.soarAuthCustomFlagsEditModeKey : this.soarAuthCustomFlagsAddKey);
    this.hasEditDiscountAccess = this.authAccessByType(this.editDiscountAuthAbbreviation);
    this.hasEditGroupAccess = this.authAccessByType(this.editGroupAuthAbbreviation);
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe())
  }
  
}
