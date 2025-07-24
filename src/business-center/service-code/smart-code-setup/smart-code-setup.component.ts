import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import cloneDeep from 'lodash/cloneDeep';
import { take } from 'rxjs/operators';

@Component({
  selector: 'smart-code-setup',
  templateUrl: './smart-code-setup.component.html',
  styleUrls: ['./smart-code-setup.component.scss'],
})
export class SmartCodeSetupComponent implements OnInit {
  constructor(
    @Inject('localize') private localize,
    private dialogService: DialogService
  ) {}

  @Input() serviceCodeInputData: any;
  @Output() ClosePopup: EventEmitter<any> = new EventEmitter<any>();
  @Input() allServiceCodes: any;
  @ViewChild('templateRef') templateElement: TemplateRef<any>;
  @ViewChild('dialogActions') dialogActions: TemplateRef<any>;

  dialog: DialogRef;
  codesByArea: any = {};
  filteredServices: Array<{
    Code?: string;
    CdtCodeName?: string;
    Description?: string;
    Fee?: string;
  }> = [];
  filteredServicesInitial: Array<{
    Code?: string;
    CdtCodeName?: string;
    Description?: string;
    Fee?: string;
  }> = [];
  placeholder = this.localize.getLocalizedString('Search for a service...');
  template = this.localize.getLocalizedString(
    'kendoAutoCompleteSmartCodeTemplate'
  );
  searchData: any = {};
  label = '';
  label2 = '';
  radioButtonModel = null;
  showSection = false;
  hasErrors: boolean;
  serviceCode: any;

  ngOnInit(): void {
    this.serviceCode = cloneDeep(this.serviceCodeInputData);
    this.setCodesByAffectedArea();
    this.validateOptions();
    this.filterServices();
    this.setSearchData();
  }

  openPreviewDialog = () => {
    this.dialog = this.dialogService.open({
      content: this.templateElement,
      actions: this.dialogActions,
    });
    this.dialog.result.pipe(take(1)).subscribe((result: any) => {
      if (!result.primary) {
        this.dialog.close();
        this.ClosePopup.emit(false);
      }
    });
  };

  // Filter the cached list of services based on the current service codes affect area
  filterServices = () => {
    this.filteredServices = [];
    if (this.allServiceCodes?.length > 0) {
      this.allServiceCodes?.forEach(code => {
        if (
          parseInt(code?.AffectedAreaId) ==
            parseInt(this.serviceCode?.AffectedAreaId) &&
          parseInt(this.serviceCode?.AffectedAreaId) != 5
        ) {
          code['Name'] = code?.Code;
          this.filteredServices.push(code);
        } else if (
          parseInt(this.serviceCode?.AffectedAreaId) == 5 &&
          parseInt(code?.AffectedAreaId) == 5 &&
          code?.UseCodeForRangeOfTeeth
        ) {
          code['Name'] = code?.Code;
          this.filteredServices.push(code);
        }
      });
      this.filteredServicesInitial = cloneDeep(this.filteredServices);
    }
  };

  // Set the number of search features to display on the view, and create the label based on affected area
  setCodesByAffectedArea = () => {
    switch (parseInt(this.serviceCode?.AffectedAreaId)) {
      case 3:
        this.radioButtonModel = this.serviceCode?.UseSmartCodes;
        this.codesByArea.count = 3;
        this.codesByArea.RoT = [];
        this.codesByArea.label = this.localize.getLocalizedString('Channel(s)');
        this.label = this.localize.getLocalizedString(
          'Use Code for entire Root'
        );
        this.label2 = this.localize.getLocalizedString(
          'Use Smart Code for Root Channels'
        );
        break;
      case 4:
        this.radioButtonModel = this.serviceCode?.UseSmartCodes;
        this.codesByArea.count = 5;
        this.codesByArea.RoT = [];
        this.codesByArea.label = this.localize.getLocalizedString('Surface(s)');
        this.label = this.localize.getLocalizedString(
          'Use Code for all Surfaces'
        );
        this.label2 = this.localize.getLocalizedString(
          'Use Smart Code for Surfaces'
        );
        break;
      case 5:
        this.radioButtonModel = this.serviceCode?.UseCodeForRangeOfTeeth;
        this.codesByArea.count = 2;
        this.codesByArea.RoT = [
          this.localize.getLocalizedString('Upper'),
          this.localize.getLocalizedString('Lower'),
        ];
        this.label = this.localize.getLocalizedString(
          'Use this Code Once per Tooth'
        );
        this.label2 = this.localize.getLocalizedString(
          'Use this Code Once for a Range of Teeth'
        );
        break;
    }
  };

  // Create a term for each of the smart code ids, based on affected area
  setSearchData = () => {
    if (this.codesByArea && this.codesByArea != {}) {
      var searchTerms = [];
      for (var i = 1; i <= this.codesByArea?.count; i++) {
        var smartCode = 'SmartCode' + i + 'Id';
        if (this.serviceCode[smartCode] != null) {
          var currentCode = this.allServiceCodes?.find(
            x => x.ServiceCodeId == this.serviceCode[smartCode]
          );
          if (currentCode) {
            searchTerms?.push({ term: currentCode?.Code });
          } else {
            searchTerms?.push({ term: null });
          }
        } else {
          searchTerms?.push({ term: null });
        }
      }
    }
    this.searchData.searchTerms = searchTerms;
  };

  cancel = () => {
    this.dialog.close();
  };

  // Capture the result from the typeahead search, and update values
  selectResult = (result: any, $index: any) => {
    this.hasErrors = false;
    var index = $index + 1;
    if (result) {
      var smartCode = 'SmartCode' + index + 'Id';
      var selectedCode = this.allServiceCodes?.find(x => x.Code == result);
      if (selectedCode) {
        this.searchData.searchTerms[$index].term = selectedCode?.Code;
        this.serviceCode[smartCode] = selectedCode.ServiceCodeId;
      } else {
        this.searchData.searchTerms[$index].term = result;
      }
    } else {
      // Clear the currently entered value and remove the value from this service codes smart code index
      var smartCode = 'SmartCode' + index + 'Id';
      this.searchData.searchTerms[$index].term = '';
      this.serviceCode[smartCode] = null;
    }
  };

  // Change function for all toggles
  toggle = () => {
    this.showSection = this.validateOptions();
  };

  validateSmartCodeSelection = (searchTerms: any) => {
    var formIsValid = true;

    searchTerms.forEach(searchTerm => {
      searchTerm.invalidCode = false;
      searchTerm.validationMessage = '';
      // searchTerm can be empty, if so this is a valid entry
      if (searchTerm.term && searchTerm.term !== '') {
        // look the smart code service code selection up in the list, is it a valid one for this service
        var match = this.allServiceCodes.find(x => x.Code == searchTerm.term);
        // if we find a match in allServiceCodes
        if (match) {
          // if AffectedAreaId other than Tooth, AffectedAreaId must match
          if (
            parseInt(this.serviceCode?.AffectedAreaId) === 5 &&
            this.serviceCode?.UseCodeForRangeOfTeeth === false
          ) {
            searchTerm.invalidCode =
              parseInt(match?.AffectedAreaId) !==
              parseInt(this.serviceCode?.AffectedAreaId);
            if (searchTerm.invalidCode === true) {
              formIsValid = false;
              searchTerm.validationMessage = this.localize.getLocalizedString(
                'Smart codes for this service code must have the same affected area as this service code.'
              );
            }
          }
          // if AffectedAreaId other than Tooth, AffectedAreaId must match
          if (parseInt(this.serviceCode?.AffectedAreaId) != 5) {
            searchTerm.invalidCode =
              parseInt(match?.AffectedAreaId) !==
              parseInt(this.serviceCode?.AffectedAreaId);
            if (searchTerm?.invalidCode === true) {
              formIsValid = false;
              searchTerm.validationMessage = this.localize.getLocalizedString(
                'Smart codes for this service code must have the same affected area as this service code.'
              );
            }
          }
        } else {
          // if this code is not in list
          searchTerm.invalidCode = true;
          if (searchTerm.invalidCode === true) {
            formIsValid = false;
            searchTerm.validationMessage = this.localize.getLocalizedString(
              'Smart codes for this service code must have the same affected area as this service code.'
            );
          }
        }
      }
    });
    this.hasErrors = !formIsValid;
    return formIsValid;
  };

  close = () => {
    var selectionsAreValid = this.validateSmartCodeSelection(
      this.searchData.searchTerms
    );
    if (selectionsAreValid) {
      // Need to recheck the search terms in case they have entered in manually one of the relevant fields
      for (var i = 0; i <= this.searchData?.searchTerms.length - 1; i++) {
        var index = i + 1;
        var term = this.searchData.searchTerms[i].term;
        var smartCode = 'SmartCode' + index + 'Id';
        if (term && term != null && term.length == 5) {
          var resultSet = this.allServiceCodes.find(x => x.Code == term);
          if (resultSet && resultSet != null) {
            this.serviceCode[smartCode] = resultSet.ServiceCodeId;
          }
        } else if (term == '') {
          this.serviceCode[smartCode] = null;
        }
      }
      //Clear the smart codes previously selected
      if (parseInt(this.serviceCode?.AffectedAreaId) == 5) {
        for (let i = 3; i < 6; i++) {
          this.serviceCode['SmartCode' + i + 'Id'] = null;
        }
      } else if (parseInt(this.serviceCode?.AffectedAreaId) == 3) {
        for (let i = 4; i < 6; i++) {
          this.serviceCode['SmartCode' + i + 'Id'] = null;
        }
      }

      this.dialog.close();
      this.ClosePopup.emit(this.serviceCode);
    }
  };
  // UI show/hide logic
  validateOptions = () => {
    switch (parseInt(this.serviceCode?.AffectedAreaId)) {
      case 3:
      case 4:
        this.serviceCode.UseSmartCodes = this.radioButtonModel;
        if (
          this.serviceCode?.UseSmartCodes == true ||
          this.serviceCode?.UseSmartCodes == 'true'
        ) {
          return true;
        }
        break;
      case 5:
        this.serviceCode.UseCodeForRangeOfTeeth = this.radioButtonModel;
        if (
          this.serviceCode?.UseCodeForRangeOfTeeth == 'false' ||
          !this.serviceCode?.UseCodeForRangeOfTeeth
        ) {
          this.serviceCode.UseSmartCodes = false;
        }
        if (
          (this.serviceCode?.UseCodeForRangeOfTeeth == true ||
            this.serviceCode?.UseCodeForRangeOfTeeth == 'true') &&
          (this.serviceCode?.UseSmartCodes == true ||
            this.serviceCode?.UseSmartCodes == 'true')
        ) {
          return true;
        }
        break;
      default:
        return false;
    }
  };

  filterServiceCodes = (term: string) => {
    var resultSet = [];
    if (term && this.filteredServicesInitial) {
      if (term.trim() != '') {
        term = term.toLocaleLowerCase();
        resultSet = this.filteredServicesInitial.filter(
          x =>
            x.Code?.toLocaleLowerCase().includes(term) ||
            x.CdtCodeName?.toLocaleLowerCase().includes(term) ||
            x.Description?.toLocaleLowerCase().includes(term)
        );
      }
    }
    this.filteredServices = resultSet;
  };
}
