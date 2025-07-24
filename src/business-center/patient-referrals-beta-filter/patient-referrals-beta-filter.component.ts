import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { GetPatientAffiliatesRequest, GetPatientAffiliatesResponse, GetPracticeProvidersRequest, GetProviderReferralAffiliatesRequest, ReferralType } from '../practice-settings/patient-profile/referral-type/referral-type.model';
import { Observable, of } from 'rxjs';
declare let _: any;
declare var angular: any;
@Component({
  selector: 'patient-referrals-beta-filter',
  templateUrl: './patient-referrals-beta-filter.component.html',
  styleUrls: ['./patient-referrals-beta-filter.component.scss'],
})
export class PatientReferralsBetaFilterComponent implements OnInit {
  // Data from report filter component
  @Input() filterModels;
  @Input() options;
  @Input() userDefinedFilter;
  @Output() onChanged = new EventEmitter<any>();
  @Output() changeData = new EventEmitter<any>();
  @Input() useAllOptionInDto: boolean;
  // Initializations
  patientSearch;
  patientSearchParams;
  externalProviderSearch: any = {};
  externalProviderSearchParams;
  emptyGuid: string;
  selectedAll: boolean;
  selectedPatients;
  selectedExternalProviders;
  selectedReferralSources;
  patientReferralTypes;
  patientReferralTypeOptions;
  patientReferralTypesData;
  referral;
  inputReferralFilterModel: any = {};
  inputReferralFilterModelssssss: any;
  referralSources;
  patientAffiliates: GetPatientAffiliatesResponse[];
  practiceId: any;
  sourceNames = [];
  isAllSelected: boolean = false;
  isAllFilterSaved: boolean = false;
  showMoreButtonText = "Show More";
  showMoreButtonExProviderText = "Show More";
  allGuid = '00000000-0000-0000-0000-000000000000';
  allExternalProviders: any;

  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('SearchFactory') private searchFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('ReferralSourcesService') private referralSourcesService,
    @Inject('ListHelper') private listHelper,
    @Inject('GlobalSearchFactory') public globalSearchFactory,
    @Inject('practiceService') private practiceService,
    private referralManagementHttpService: ReferralManagementHttpService,
    private cdr: ChangeDetectorRef
  ) {
    
  }

  getOptions() {
    this.patientReferralTypeOptions.push({
      name: this.localize.getLocalizedString('All Categories'),
      value: null,
    });
    for (let value of this.patientReferralTypesData) {
      this.patientReferralTypeOptions.push({
        name: value.Name,
        value: value.Id,
      });
      this.patientReferralTypes[value.Name] = value.Id;
    }
    this.patientReferralTypeOptions.push({
      name: this.localize.getLocalizedString('External Provider'),
      value: 3,
    });
    this.patientReferralTypes['ExternalProvider'] = 3;
    if (this.isAllFilterSaved === true) {
      this.patientReferralTypeOptions.forEach(item => item.selected = true);
    }

    const index = this.patientReferralTypeOptions.findIndex(category => category.name === "Other" || category.name === "External Sources");
    if (index !== -1) {
      const [category] = this.patientReferralTypeOptions.splice(index, 1);
      this.patientReferralTypeOptions.push(category);
    }
  }

  onCheckboxChange(changedItem) {
    if (changedItem.value === null) {
      this.isAllSelected = true;
      this.patientReferralTypeOptions.forEach(item => item.selected = changedItem.selected);
      this.selectedPatients = [];
      this.selectedReferralSources = [];
    } else {
      const othersAndPerson = this.patientReferralTypeOptions.filter(item => item.value !== null);
      const allSelected = othersAndPerson.every(item => item.selected);
      this.isAllSelected = false;
      this.patientReferralTypeOptions.find(item => item.name === 'All Categories').selected = false;
    }

    if (this.patientReferralTypeOptions.find(item => item.name === 'Other' || item.name === 'External Sources').selected === false) {
      this.inputReferralFilterModel.ReferringSourceIdFilterDto = [];
      this.selectedReferralSources = [];
      this.inputReferralFilterModel.ReferringSourceIdFilterDto?.push(this.emptyGuid);
    }

    if (this.patientReferralTypeOptions.find(item => item.name === 'Person').selected === false) {
      this.inputReferralFilterModel.ReferringPatientIdFilterDto = [];
      this.selectedPatients = [];
      this.inputReferralFilterModel.ReferringPatientIdFilterDto?.push(this.emptyGuid);
    }

    if (this.patientReferralTypeOptions.find(item => item.name === 'External Provider').selected === false) {
      this.inputReferralFilterModel.ExternalProviderIdFilterDto = [];
      this.selectedExternalProviders = [];
      this.inputReferralFilterModel.ExternalProviderIdFilterDto?.push(this.emptyGuid);
    }

    if ((changedItem.name == "Other" || changedItem.name == "External Sources") && this.patientReferralTypeOptions.find(item => item.name === 'Other' || item.name === 'External Sources').selected === true) {
      var ctr = 1;
      for (let item of this.referralSources) {
        if (ctr > 5) {
          item.isVisible = false;
        }
        else
        {
          item.isVisible = true;
        }
        item.selected = true;
        item.Checked = true;
        this.SelectOther(item);
        this.notifyChange();
        ctr++;
      };
    }

    if (changedItem.name == "External Provider" && this.patientReferralTypeOptions.find(item => item.name === 'External Provider').selected === true) {
      var ctr = 1;
      for (let item of this.allExternalProviders) {
        if (ctr > 5) {
          item.isVisible = false;
        }
        else
        {
          item.isVisible = true;
        }
        item.selected = true;
        item.Checked = true;
        this.SelectExternalProvider(item);
        this.notifyChange();
        ctr++;
      };
    }

    this.ReferralTypeChanged(changedItem.value);
  }

  ReferralTypeChanged(type) {
    if (this.inputReferralFilterModel == undefined) {
      this.inputReferralFilterModel = {};
    }
    this.inputReferralFilterModel.selectedReferralType = this.patientReferralTypeOptions
      .filter(item => item.selected)
      .map(item => item.value);

    if (!this.patientReferralTypeOptions) {
      this.patientReferralTypeOptions = [];
    }
    if (!this.patientSearchParams) {
      this.patientSearchParams = {};
    }
    if (!this.externalProviderSearchParams) {
        this.externalProviderSearchParams = {};
    }

    this.selectedAll = this.patientReferralTypeOptions.find(item => item.name === 'All Categories').selected;
    this.referral = {};
    this.patientSearchParams.searchFor = '';
    this.externalProviderSearchParams.searchFor = '';
    this.notifyChange();
  }

  getReferralSources() {
    this.referralManagementHttpService.getSources().then((res) => {
      this.sourceNames = res;
      this.referralSources = this.sourceNames.map(source => ({
        SourceName: source.text,
        PatientReferralSourceId: source.value
      }));
      this.referralSourcesServiceGetSuccess({ Value: this.referralSources });
    });
  }

  showMoreButton(model) {
    if (this.showMoreButtonText === this.localize.getLocalizedString('Show More')) {
      for (let item of model) {
        item.isVisible = true;
      };
      this.showMoreButtonText = this.localize.getLocalizedString('Show Less');
    } else {
      var ctr = 1;
      for (let item of model) {
        if (ctr > 5) {
          item.isVisible = false;
        }
        ctr++;
      };
      this.showMoreButtonText = this.localize.getLocalizedString('Show More');
    }

  };

  showMoreButtonExProvider(model) {
    if (this.showMoreButtonExProviderText === this.localize.getLocalizedString('Show More')) {
      for (let item of model) {
        item.isVisible = true;
      };
      this.showMoreButtonExProviderText = this.localize.getLocalizedString('Show Less');
    } else {
      var ctr = 1;
      for (let item of model) {
        if (ctr > 5) {
          item.isVisible = false;
        }
        ctr++;
      };
      this.showMoreButtonExProviderText = this.localize.getLocalizedString('Show More');
    }
  };

  getCheckedCheckboxes(allStatus) {
    var checkedCheckboxes = allStatus.filter(function(checkbox) {
      return checkbox.checked; // Filter for checked checkboxes
    });
    
    return checkedCheckboxes;
  }

  toggleSelect(filterValue, filterHeader, model) {
    var allStatus = angular
      .element("ul[id='" + filterHeader + "']")
      .find('input[type=checkbox]')
      .toArray();
      
    var newFilterCount = 0;
    var index = 0;
    if (filterValue === 'All') {
      if (!allStatus[0].checked) {
        this.selectedReferralSources = [];
        for (let liObject of allStatus) {
          liObject.checked = false;
          model[index].Checked = liObject.checked;
          index++;
        };
      } else {
        for (let liObject of allStatus) {
          liObject.checked = true;
          model[index].Checked = liObject.checked;
          index++;
          newFilterCount += 1;
        };
        this.selectedReferralSources = [];
        for(let value of this.referralSources) {
            this.selectedReferralSources.push(value);
            this.notifyChange();
        }
      }
    }
    else
    {
      var checked= this.getCheckedCheckboxes(allStatus);

      var withoutAll = this.referralSources;
      var idx = this.referralSources.filter(x => x.SourceName != "All");

      if(idx.length==checked.length){
        allStatus[0].checked=true;
        var AllValue = {
          SourceName: this.localize.getLocalizedString('All'),
          PatientReferralSourceId: this.allGuid,
          isVisible: true,
          selected: true
        };
        this.selectedReferralSources.push(AllValue);
      }
      else{
        allStatus[0].checked=false;
      }
    } 
  }

  toggleSelectExProviders(filterValue, filterHeader, model) {
    var allStatus = angular
      .element("ul[id='" + filterHeader + "']")
      .find('input[type=checkbox]')
      .toArray();
      
    var newFilterCount = 0;
    var index = 0;
    if (filterValue === 'All') {
      if (!allStatus[0].checked) {
        this.selectedExternalProviders = [];
        for (let liObject of allStatus) {
          liObject.checked = false;
          model[index].Checked = liObject.checked;
          index++;
        };
      } else {
        for (let liObject of allStatus) {
          liObject.checked = true;
          model[index].Checked = liObject.checked;
          index++;
          newFilterCount += 1;
        };
        this.selectedExternalProviders = [];
        for(let value of this.allExternalProviders) {
            this.selectedExternalProviders.push(value);
            this.notifyChange();
        }
      }
    }
    else
    {
      var checked= this.getCheckedCheckboxes(allStatus);

      var withoutAll = this.allExternalProviders;
      var idx = this.allExternalProviders.filter(x => x.PreferredName != "All");

      if(idx.length==checked.length){
        allStatus[0].checked=true;
        var AllValue = {
          PreferredName: this.localize.getLocalizedString('All'),
          PatientId: this.allGuid,
          isVisible: true,
          selected: true,
          FirstName: null,
          LastName: null,
          IsActive: true,
          Email: null,
          Phone: null
        };
        this.selectedExternalProviders.push(AllValue);
      }
      else{
        allStatus[0].checked=false;
      }
    } 
  }
 
  showMoreCheck(model) {
    if (model.data.length > 5) {
      var isVisible =
        this.showMoreButtonText == this.localize.getLocalizedString('Show More')
          ? false
          : true;
      this.setArrayVisibility(model.data, isVisible);
    }
  };

  setArrayVisibility(array, isVisible) {
    for (var i = 5; i < array.length; i++) {
      array[i].isVisible = isVisible;
    }
  };


  referralSourcesServiceGetSuccess(res) {
    res.Value.splice(0, 1);
    res.Value.unshift({
      SourceName: this.localize.getLocalizedString('All'),
      PatientReferralSourceId: this.allGuid,
    });
    this.referralSources = res.Value;
    
    var ctr = 1;
    for (let item of this.referralSources) {
      if (ctr > 5) {
        item.isVisible = false;
      }
      else
      {
        item.isVisible = true;
      }
      ctr++;
    };

    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType?.includes(this.patientReferralTypes.Other)
    ) {
      this.selectedAll = this.inputReferralFilterModel.selectedAll;
      if (this.userDefinedFilter.ReferralSourceIds.length > 0) {
        _.each(this.userDefinedFilter.ReferralSourceIds, item => {
          const sourceObj = this.listHelper.findItemByFieldValue(
            this.referralSources,
            'PatientReferralSourceId',
            item
          );
          this.referral.ReferralSourceId = sourceObj;
          this.SelectOther(item);
        });
      } else {
        this.ReferralTypeChanged(
          this.userDefinedFilter.selectedReferralType.value
        );
      }
      this.patientReferralTypeOptions.find(item => item.name === 'Other' || item.name === 'External Sources').selected = true;
    }
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType?.includes(this.patientReferralTypes.Person)
    ) {
      this.selectedAll = this.inputReferralFilterModel.selectedAll;
      if (this.userDefinedFilter.ReferringPatientIds.length > 0) {
        _.each(this.userDefinedFilter.selectedAllPatients, item => {
          this.SelectPatient(item);
        });
      } else {
        this.ReferralTypeChanged(
          this.userDefinedFilter.selectedReferralType.value
        );
      }
      this.patientReferralTypeOptions.find(item => item.name === 'Person').selected = true;
    }
    //debugger;
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType?.includes(this.patientReferralTypes.ExternalProvider)
    ) {
      this.selectedAll = this.inputReferralFilterModel.selectedAll;
      if (this.userDefinedFilter.ExternalProviderIds.length > 0) {
        _.each(this.userDefinedFilter.selectedAllExternalProviders, item => {
          this.SelectExternalProvider(item);
        });
      } else {
        this.ReferralTypeChanged(
          this.userDefinedFilter.selectedReferralType.value
        );
      }
      this.patientReferralTypeOptions.find(item => item.name === 'External Provider').selected = true;
    }

    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType?.includes(null)
    ) {
      this.isAllSelected = true;
      this.patientReferralTypeOptions.find(item => item.name === 'All Categories').selected = true;
    }

    this.cdr.detectChanges();
  }

  referralSourcesServiceGetFailure() {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Referral sources failed to load.'),
      this.localize.getLocalizedString('Server Error')
    );
  }

  executePatientSearch(scrolling) {
    if (this.patientSearchParams && this.patientSearchParams.searchFor != '') {
      this.patientSearch.Execute(this.patientSearchParams, scrolling);
    }
  }

  executeExternalProviderSearch(scrolling) {
    if (this.externalProviderSearchParams && this.externalProviderSearchParams.searchFor != '') {
      this.getExternalProviders(this.externalProviderSearchParams.searchFor);
    }
  }

  getExternalProviders(searchKeyword: string) {
    let req: GetPracticeProvidersRequest = { Search: searchKeyword, PracticeId: this.practiceId };

    this.referralManagementHttpService
      .getPracticeProvidersForReport(req)
      .subscribe((response: any[]) => {

        const affiliates = response.map(item => item.provider);

        if (affiliates) {
          const mappedAffiliates = affiliates.map((affiliate, index) => ({
            PatientId: affiliate.providerAffiliateId,
            FirstName: affiliate.firstName,
            LastName: affiliate.lastName,
            MiddleName: null,
            Suffix: null,
            PreferredName: response[index].practice.name,
            Sex: null,
            DateOfBirth: null,
            IsPatient: false,
            PatientCode: null,
            IsActive: affiliate.status === "True",
            DirectoryAllocationId: null,
            DisplayStatementAccountId: null,
            Address1: null,
            Address2: null,
            City: null,
            ZipCode: null,
            Email: affiliate.emailAddress,
            Phone: affiliate.phone,
            State: null
          }));

          mappedAffiliates.sort((a, b) => a.FirstName.localeCompare(b.FirstName));

          this.externalProviderSearch.Results = mappedAffiliates;
          this.externalProviderSearch.ResultCount = mappedAffiliates.length;
        }

        this.cdr.detectChanges();
      });
  }

  private getAllExternalProviders(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req: GetPracticeProvidersRequest = { 
        Search: '', 
        PracticeId: this.practiceId 
      };

      this.referralManagementHttpService
        .getPracticeProvidersForReport(req)
        .subscribe({
          next: (response: any[]) => {
            try {
              if (!Array.isArray(response)) {
                throw new Error('Invalid response format: Expected an array.');
              }

              const affiliates = response.map(item => item.provider);

              if (affiliates) {
                const mappedAffiliates = affiliates.map((affiliate, index) => ({
                  PatientId: affiliate.providerAffiliateId,
                  FirstName: affiliate.firstName,
                  LastName: affiliate.lastName,
                  PreferredName: response[index].practice.name,
                  IsActive: affiliate.status === "True",
                  Email: affiliate.emailAddress,
                  Phone: affiliate.phone
                }));

                mappedAffiliates.sort((a, b) => a.FirstName.localeCompare(b.FirstName));

                this.externalProviderSearch.Results = mappedAffiliates;
                this.externalProviderSearch.ResultCount = mappedAffiliates.length;

                mappedAffiliates.unshift({
                  PreferredName: this.localize.getLocalizedString('All'),
                  PatientId: this.allGuid,
                  FirstName: null,
                  LastName: null,
                  IsActive: true,
                  Email: null,
                  Phone: null
                });

                this.allExternalProviders = mappedAffiliates;
                
                for (let i = 0; i < this.allExternalProviders.length; i++) {
                  this.allExternalProviders[i].isVisible = i < 5;
                }

                this.cdr.detectChanges();
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => {
            console.error('Error fetching external providers:', error);
            reject(error);
          }
        });
    });
  }

  notifyChange() {
    var selectedPatients = [];
    var selectedExternalProviders = [];
    var selectedReferralSources = [];
    for (let patient of this.selectedPatients) {
      selectedPatients.push({
        PatientId: patient.PatientId,
        DisplayName:
          patient.LastName +
          ', ' +
          patient.FirstName +
          ' - ' +
          patient.PatientCode,
      });
    }

    for (let extProvider of this.selectedExternalProviders) {
      selectedExternalProviders.push({
        PatientId: extProvider.PatientId,
        DisplayName:
          extProvider.LastName +
          ', ' +
          extProvider.FirstName,
      });
    }

    for (let value of this.selectedReferralSources) {
      selectedReferralSources.push({
        SourceId: value.PatientReferralSourceId,
        DisplayName: value.SourceName,
      });
    }

    var prevTotalSelected = this.inputReferralFilterModel.totalSelected;
    this.inputReferralFilterModel.selectedAll = this.selectedAll;
    this.inputReferralFilterModel.selectedPatients = selectedPatients;
    this.inputReferralFilterModel.selectedExternalProviders = selectedExternalProviders;
    this.inputReferralFilterModel.selectedAllPatients = this.selectedPatients;
    this.inputReferralFilterModel.selectedAllExternalProviders = this.selectedExternalProviders;
    this.inputReferralFilterModel.selectedReferralSources =
      selectedReferralSources;
    this.inputReferralFilterModel.FilterString =
      this.buildReferralSourcesFilterString();
    this.buildReferralSourcesFilterDto();

    this.onChanged.emit(
      this.inputReferralFilterModel.totalSelected - prevTotalSelected
    );

    if (this.inputReferralFilterModel.ReferringPatientIdFilterDto?.length === 0) {
      this.inputReferralFilterModel.ReferringPatientIdFilterDto?.push(this.emptyGuid);
    }

    if (this.inputReferralFilterModel.ExternalProviderIdFilterDto?.length === 0) {
      this.inputReferralFilterModel.ExternalProviderIdFilterDto?.push(this.emptyGuid);
    }

    if (this.inputReferralFilterModel.ReferringSourceIdFilterDto?.length === 0) {
      this.inputReferralFilterModel.ReferringSourceIdFilterDto?.push(this.emptyGuid);
    }

    this.changeData.emit();
  }

  buildReferralSourcesFilterString() {
    if (this.inputReferralFilterModel.selectedAll) {
      return this.localize.getLocalizedString('All');
    } else {
      let filterString = this.localize.getLocalizedString('');

      for (let obj of this.inputReferralFilterModel.selectedPatients) {
        filterString = filterString.concat(
          obj.DisplayName + this.localize.getLocalizedString(', ')
        );
      }
      if (this.inputReferralFilterModel.selectedExternalProviders) {
        for (let obj of this.inputReferralFilterModel.selectedExternalProviders) {
          filterString = filterString.concat(
            obj.DisplayName + this.localize.getLocalizedString(', ')
          );
        }
      }

      for (let obj of this.inputReferralFilterModel.selectedReferralSources) {
        filterString = filterString.concat(
          obj.DisplayName + this.localize.getLocalizedString(', ')
        );
      }

      filterString = filterString.substring(0, filterString.length - 2);
      if (filterString === '') {
        filterString = this.localize.getLocalizedString('No filters applied');
      }
      return filterString;
    }
  }

  buildReferralSourcesFilterDto() {
    var selectedPatientIds = [];
    var selectedExternalProviderIds = [];
    var selectedReferralSourceIds = [];
    if (this.inputReferralFilterModel.selectedAll) {
      selectedPatientIds.push(this.emptyGuid);
      selectedReferralSourceIds.push(this.emptyGuid);
    } else {
      for (let patient of this.inputReferralFilterModel.selectedPatients) {
        selectedPatientIds.push(patient.PatientId);
      }

      for (let extProvider of this.inputReferralFilterModel.selectedExternalProviders) {
        selectedExternalProviderIds.push(extProvider.PatientId);
      }

      for (let value of this.inputReferralFilterModel.selectedReferralSources) {
        selectedReferralSourceIds.push(value.SourceId);
      }
    }
    this.inputReferralFilterModel.ReferringPatientIdFilterDto =
      selectedPatientIds;
    this.inputReferralFilterModel.ExternalProviderIdFilterDto =
      selectedExternalProviderIds;
    this.inputReferralFilterModel.ReferringSourceIdFilterDto =
      selectedReferralSourceIds;
  }

  SelectPatient(patient) {
    if (patient) {
      this.patientSearchParams.searchFor =
        patient.LastName +
        ', ' +
        patient.FirstName +
        ' - ' +
        patient.PatientCode;
      this.patientSearch.Results = [];
      let found = false;
      for (let value of this.selectedPatients) {
        if (value.PatientId === patient.PatientId) {
          found = true;
          return;
        }
      }
      if (!found) {
        this.selectedPatients.push(patient);
        this.notifyChange();
        this.saveMostRecent(patient.PatientId);
      }
    }
  }

  SelectExternalProvider(externalProvider) {
    if (externalProvider) {
      var allStatus = angular
      .element("ul[id='externalProvidersUl']")
      .find('input[type=checkbox]')
      .toArray();
      if(allStatus.length>0 && externalProvider.PreferredName != 'All')
      {
        allStatus[0].checked = false;
      }

      let found = false;
      for (let value of this.selectedExternalProviders) {
        if (value.PatientId === externalProvider.PatientId) {
          externalProvider.selected=false;
          found = true;
          var index = this.selectedExternalProviders.findIndex(source => source.PatientId === value.PatientId);
          if (index !== -1) {          
            this.selectedExternalProviders.splice(index, 1);
            this.notifyChange();
          } 

          index = this.selectedExternalProviders.findIndex(source => source.PreferredName === "All");
          if (index !== -1) {
            this.selectedExternalProviders.splice(index, 1);
            this.notifyChange();
          } 
          return;
        }
      }
      if (!found) {
        externalProvider.selected=true;
        this.selectedExternalProviders.push(externalProvider);
        this.notifyChange();
      }
    }
  }

  SelectOther(other) {
    var item = this.listHelper.findItemByFieldValue(
      this.referralSources,
      'PatientReferralSourceId',
      other
    );

    
    
    if (item) {
      var allStatus = angular
      .element("ul[id='otherReferralsUl']")
      .find('input[type=checkbox]')
      .toArray();
      if(allStatus.length>0 && item.SourceName != 'All')
      {
        allStatus[0].checked = false;
      }
        let found = false;
      for (let value of this.selectedReferralSources) {

        if (value === item) {
          item.selected=false;
          found = true;
          var index = this.selectedReferralSources.findIndex(source => source.SourceName === value.SourceName);
          if (index !== -1) {
           
           this.selectedReferralSources.splice(index, 1);
           this.notifyChange();
          } 

          index = this.selectedReferralSources.findIndex(source => source.SourceName === "All");
          if (index !== -1) {
           this.selectedReferralSources.splice(index, 1);
           this.notifyChange();
          } 
          return;
        }
      }
      if (!found) {
        item.selected=true;
        this.selectedReferralSources.push(item);
        this.notifyChange();
      }
    }
    this.patientSearchParams.searchFor = '';
    this.externalProviderSearchParams.searchFor = '';
  }

  removeSelectedPatient(index, patient) {
    this.selectedPatients.splice(index, 1);
    this.notifyChange();
  }

  removeSelectedExternalProvider(index, externalProvider) {
    this.selectedExternalProviders.splice(index, 1);
    this.notifyChange();
  }

  removeSelectedReferenceSource(index, item) {
    this.selectedReferralSources.splice(index, 1);
    this.notifyChange();
  }

  saveMostRecent(personId) {
    this.globalSearchFactory.SaveMostRecentPerson(personId);
  }

  onSearchSuccess(data) {
    let req: GetPatientAffiliatesRequest = { Search: this.patientSearchParams.searchFor };

    this.referralManagementHttpService
      .getPatientAffiliates(req)
      .subscribe((affiliates: any[]) => {
        if (affiliates) {
          const mappedAffiliates = affiliates.map(affiliate => ({
            PatientId: affiliate.patientAffiliateId,
            FirstName: affiliate.firstName,
            LastName: affiliate.lastName,
            MiddleName: null,
            Suffix: null,
            PreferredName: null,
            Sex: null,
            DateOfBirth: null,
            IsPatient: false,
            PatientCode: null,
            IsActive: affiliate.status === "True",
            DirectoryAllocationId: null,
            DisplayStatementAccountId: null,
            Address1: null,
            Address2: null,
            City: null,
            ZipCode: null,
            Email: affiliate.emailAddress,
            Phone: affiliate.phone,
            State: null
          }));

          const mergedResults = [...data.Value, ...mappedAffiliates];

          mergedResults.sort((a, b) => a.FirstName.localeCompare(b.FirstName));

          this.patientSearch.Results = mergedResults;
          this.patientSearch.ResultCount = mergedResults.length;
        } else {
          data.Value.sort((a, b) => a.FirstName.localeCompare(b.FirstName));
          this.patientSearch.Results = data.Value;
          this.patientSearch.ResultCount = data.Count;
        }
        this.cdr.detectChanges();
      });
  }


  initialMethod() {
    this.patientSearch = this.searchFactory.CreateSearch(
      this.patientServices.Patients.search,
      this.onSearchSuccess.bind(this)
    );
    this.patientSearchParams = {
      searchFor: '',
      skip: 0,
      take: 45,
      sortBy: 'FirstName',
      includeInactive: false,
    };
    this.externalProviderSearchParams = {
      searchFor: '',
      skip: 0,
      take: 45,
      sortBy: 'FirstName',
      includeInactive: false,
    };
    this.emptyGuid = '00000000-0000-0000-0000-000000000000';
    this.selectedAll = true;
    this.selectedPatients = [];
    this.selectedReferralSources = [];
    this.patientReferralTypesData = this.options;
    this.patientReferralTypes = {};
    this.patientReferralTypeOptions = [];
    this.referral = {};
    this.referral.ReferralSourceId = null;
    this.referralSources = [];
    this.getOptions();
    this.getReferralSources();
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.practiceId = this.practiceService.getCurrentPractice().id;
    this.selectedExternalProviders = [];
    this.getAllExternalProviders().then(() => {
      this.initFunctions();
    }).catch(error => {
      console.error('Error fetching external providers:', error);
    });
  }

  initFunctions(){
    this.inputReferralFilterModel = this.filterModels;
    if (this.inputReferralFilterModel) {
      this.isAllFilterSaved = this.inputReferralFilterModel.selectedAll;
      this.initialMethod();
    }

    if (this.referralSources) {      
      if (this.showMoreButtonText && this.showMoreButtonText === 'Show Less') {
        this.showMoreButtonText = this.localize.getLocalizedString('Show More');
        this.showMoreButton(this.referralSources);
      } else {
        this.showMoreButtonText = this.localize.getLocalizedString('Show More');
      }     
    }
    if (this.allExternalProviders) {      
      if (this.showMoreButtonExProviderText && this.showMoreButtonExProviderText === 'Show Less') {
        this.showMoreButtonExProviderText = this.localize.getLocalizedString('Show More');
        this.showMoreButtonExProvider(this.allExternalProviders);
      } else {
        this.showMoreButtonExProviderText = this.localize.getLocalizedString('Show More');
      }  
      
      if (
        this.userDefinedFilter &&
        this.userDefinedFilter.selectedReferralType &&
        this.userDefinedFilter.selectedReferralType?.includes(this.patientReferralTypes.ExternalProvider)
      ) {
        this.selectedAll = this.inputReferralFilterModel.selectedAll;
        if (this.userDefinedFilter.ExternalProviderIds.length > 0) {
          _.each(this.userDefinedFilter.selectedAllExternalProviders, item => {
            this.allExternalProviders.find(ext => ext.PatientId === item.PatientId).selected = true;
          });
        } else {
          this.ReferralTypeChanged(
            this.userDefinedFilter.selectedReferralType.value
          );
        }
        this.patientReferralTypeOptions.find(item => item.name === 'External Provider').selected = true;
      }

      this.cdr.detectChanges();
    }
  }
}
