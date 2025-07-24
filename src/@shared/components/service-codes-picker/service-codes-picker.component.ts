import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';

import { Search1Pipe } from 'src/@shared/pipes/search1/search1.pipe';

@Component({
  selector: 'service-codes-picker',
  templateUrl: './service-codes-picker.component.html',
  styleUrls: ['./service-codes-picker.component.scss'],
})
export class ServiceCodesPickerComponent implements OnInit {
  @Output() onSelect: any = new EventEmitter<[]>();
  showTemplate: boolean = false;
  parentindex = 0;
  childindex = 0;
  orderBy: { field: string; asc: number } = {
    field: '',
    asc: 1,
  };
  serviceCodes: any = []; //ToDo: Replace any type data with serviceCodes object when parent component is migrated
  selectedServiceCodes: any = []; //ToDo: Replace any type data with serviceCodes object when parent component is migrated
  filteredServiceCodes: any = []; //ToDo: Replace any type data with serviceCodes object when parent component is migrated
  loadingServices: boolean = true;
  filteringServices: boolean = false;
  disableQuickAdd: boolean = false;
  filteringMessageNoResults: string;
  loadingMessageNoResults: string;
  searchServiceCodesKeyword: string;

  constructor(
    @Inject('localize') private localize,
    @Inject('referenceDataService') private referenceDataService,
    private searchPipe: Search1Pipe
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  initialize = () => {
    this.loadingServices = true;
    this.serviceCodes = this.referenceDataService.get(
      this.referenceDataService.entityNames.serviceCodes
    );
    this.loadingServices = false;
    this.loadingMessageNoResults =
      this.localize.getLocalizedString('There are no {0}.', [
        'service codes',
      ]) || 'There are no service codes';
    this.filteringMessageNoResults =
      this.localize.getLocalizedString(
        'There are no {0} that match the filter.',
        ['service codes']
      ) || 'There are no service codes that match the filter.';
    if (!this.serviceCodes.length) {
      return;
    }
    this.serviceCodes = this.serviceCodes?.filter(
      (x: { IsSwiftPickCode: boolean }) => x.IsSwiftPickCode == false
    );
    this.filteredServiceCodes = this.serviceCodes;
  };

  // function to apply orderBy functionality on grid
  changeSortingForGrid = (field: string) => {
    const asc = this.orderBy.field === field ? 1 : -1;
    this.orderBy = { field: field, asc: asc };
  };

  quickAddStatus = () => {
    return this.disableQuickAdd;
  };

  selectedService = (event, serviceCode) => {
    const checked = event.target.checked;

    if (checked) {
      this.selectedServiceCodes.push(serviceCode);
    } else {
      this.selectedServiceCodes.splice(
        this.selectedServiceCodes.indexOf(serviceCode),
        1
      );
    }

    this.disableQuickAdd = this.selectedServiceCodes.length > 0 ? true : false;
  };

  quickAddService = serviceCode => {
    this.selectedServiceCodes.push(serviceCode);
    this.onSelectedCodes();
  };

  onSelectedCodes = () => {
    this.onSelect.emit(this.selectedServiceCodes);
  };

  onsearchServiceCodesKeywordChange = () => {
    this.filteringServices = true;
    this.filteredServiceCodes = this.searchPipe.transform(this.serviceCodes, {
      Code: this.searchServiceCodesKeyword,
      CdtCodeName: this.searchServiceCodesKeyword,
      Description: this.searchServiceCodesKeyword,
      ServiceTypeDescription: this.searchServiceCodesKeyword,
    });
  };

  toogleNoteInfo = ($event, index, rowIndex) => {
    this.parentindex = rowIndex;
    this.childindex = index;
    this.showTemplate = true;
    $event.stopPropagation();
  };

  closePopOver = () => {
    this.showTemplate = false;
  };
}
