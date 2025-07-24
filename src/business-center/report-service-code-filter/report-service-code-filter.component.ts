import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { isNullOrUndefined, isNull } from 'util';
import * as moment from 'moment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'report-service-code-filter',
  templateUrl: './report-service-code-filter.component.html',
  styleUrls: ['./report-service-code-filter.component.scss'],
})
export class ReportServiceCodeFilterComponent implements OnInit {
  //data from report-filter-box component
  @Input() filterModels;
  @Input() includeAll;
  @Input() userDefinedFilter;
  @Output() changeData = new EventEmitter<any>();
  //initializations
  searchFilterModel;
  emptyGuid: string;
  data;
  searchClass;
  searchKeywords;
  selectedItemName;
  selectedItem;
  selectedItems=[];
  itemSelected;
  matchingItems;
  filterId;
 
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize
  ) {}


  initializeMethod() {
    this.searchFilterModel.FilterDto = [];
    this.selectedItems=[]
    this.filterId =
      this.searchFilterModel.Name.charAt(0).toLowerCase() +
      this.searchFilterModel.Name.replace(/\s/g, '').slice(1);
    var fieldName = this.searchFilterModel.Name.replace(/\s/g, '');
    this.data = [];
    let checkedAllValue = false;
    let checkedSelectedValue = false;
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.ServiceCodeIds &&
      this.userDefinedFilter.ServiceCodeIds[0] !== this.emptyGuid
    ) {
      checkedSelectedValue = true;
    } else {
      checkedAllValue = true;
    }
    this.data.push({
      Field: fieldName,
      Value: this.localize.getLocalizedString('All'),
      Key: true,
      Checked: checkedAllValue,
      isVisible: true,
    });
    this.data.push({
      Field: fieldName,
      Value: this.localize.getLocalizedString('Search'),
      Key: true,
      Checked: checkedSelectedValue,
      isVisible: true,
    });
    this.searchClass = this.includeAll ? 'col-sm-11 searchBox' : 'col-sm-11';
    this.searchKeywords = '';
    this.selectedItemName = '';
    this.selectedItem = this.emptyGuid;
    this.itemSelected = false;
    this.matchingItems = [];
  }
  // toggle between all and search radio buttons.
  toggleRadio(filterValue) {
    if (filterValue === this.data[0].Value) {
      this.searchFilterModel.FilterDto=[];

      this.searchFilterModel.FilterDto.push(this.emptyGuid);
      this.searchFilterModel.FilterString =
        this.localize.getLocalizedString('All');
      this.data[0].Checked = true;
      this.data[1].Checked = false;
      this.matchingItems = [];
    } 
    else {
      this.searchFilterModel.FilterDto = [];
      this.selectedItems.forEach((item: { ServiceCodeId: any }) => {
        this.searchFilterModel.FilterDto.push(item.ServiceCodeId);
      });
      this.searchFilterModel.FilterString =
        this.selectedItem === this.emptyGuid
          ? this.localize.getLocalizedString('All')
          : this.selectedItemName;
      this.data[0].Checked = false;
      this.data[1].Checked = true;
    }
    this.changeData.emit();
  }

  // get matching items each time search keywords are changed
  searchKeyCode() {
    if (!this.itemSelected) {
      this.getListFromSearchKeywords();
    }
    this.itemSelected = false;
  }

  // reset the controller
  resetMethod() {
    this.selectedItems=[];
    this.initializeMethod();
    this.searchFilterModel.Reset = true;
    this.matchingItems = [];
    this.callSelectedFilters();
  }

  // find the items that match the search keywords
  getListFromSearchKeywords() {
    this.matchingItems = [];
    for (let item of this.searchFilterModel.SearchMaterial) {
      for (let column of this.searchFilterModel.DisplayColumns) {
        if (
          item[column] &&
          item[column]
            .toLocaleLowerCase()
            .includes(this.searchKeywords.toLocaleLowerCase()) &&
          this.matchingItems.indexOf(item) === -1
        ) {
          this.matchingItems.push(item);
        }
      }
    }
  }
  // set different variables when an item is selected
  selectItem(item) {
    if (item) {
      // Extract the value of the unique property (e.g., 'Code')
      this.selectedItem = item[this.searchFilterModel.FilterDtoColumns[0]];

      // Check if the selectedItem doesn't already exist in selectedItems
      const exists = this.selectedItems.some(existingItem => 
        existingItem[this.searchFilterModel.FilterDtoColumns[0]] === this.selectedItem
      );

      // Only push the item if it doesn't exist in the array
      if (!exists) {
        this.selectedItems.push(item);
        this.searchFilterModel.FilterDto.push(this.selectedItem);
        this.searchFilterModel.FilterString = this.buildFilterString();
        this.searchKeywords = item[this.searchFilterModel.DisplayColumns[0]];
        this.selectedItemName = item[this.searchFilterModel.DisplayColumns[0]];
      }
      this.matchingItems = [];
      this.itemSelected = true;
    }
    this.changeData.emit();
  }


  buildFilterString() {
    if (this.data[0].Checked === 'true') {
      return this.localize.getLocalizedString('All');
    }
    var filterString = '';
    for (let item of this.selectedItems) {
      filterString = filterString.concat(
        item.Code + this.localize.getLocalizedString(', ')
      );
    }
    filterString = filterString.substring(0, filterString.length - 2);
    if (filterString === '') {
      filterString = this.localize.getLocalizedString('No filters applied');
    }
    return filterString;
  }

  removeSelectedCode(index, item) {
    this.selectedItems.splice(index, 1);
    this.searchFilterModel.FilterDto = [];
    this.selectedItems.forEach((item: { ServiceCodeId: any }) => {
      this.searchFilterModel.FilterDto.push(item.ServiceCodeId);
    });
    
    this.searchFilterModel.FilterString = this.buildFilterString();
    this.notifyChange();
  }

  notifyChange() {
    var selectedPatients = [];
   
    this.changeData.emit();
  }
  callSelectedFilters() {
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.ServiceCodeIds &&
      this.userDefinedFilter.ServiceCodeIds[0] !== this.emptyGuid
    ) {

      const maxRetries = 10;  // Set maximum retry attempts
      let retryCount = 0;

      const checkDataLoaded = () => {
        if (this.searchFilterModel && this.searchFilterModel.SearchMaterial && this.searchFilterModel.SearchMaterial.length > 0) {
          // Data is loaded, proceed with the next steps
          this.searchFilterModel.FilterDto = [];
          this.userDefinedFilter.ServiceCodeIds.forEach(code => {
            for (let item of this.searchFilterModel.SearchMaterial) {
              if(item.ServiceCodeId === code) {
                this.selectedItems.push(item);
                this.searchFilterModel.FilterDto.push(code);
              }
            }
          });
          
          this.searchFilterModel.FilterString = this.buildFilterString();
        } else if (retryCount < maxRetries) {
          // Data is not yet loaded, retry after a short delay
          retryCount++;
          console.log(`Data not loaded yet, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(checkDataLoaded, 1000); // Retry after 1 second
        } else {
          // Max retries reached, handle failure (maybe show a message or log an error)
          console.log("Failed to load SearchMaterial after several attempts.");
        }
      };

       // Start checking if the data is loaded
      checkDataLoaded();


    }
    else {
      this.searchFilterModel.FilterDto = [];
      this.searchFilterModel.FilterDto.push(this.emptyGuid);
      this.searchFilterModel.FilterString =this.localize.getLocalizedString('All');
    }

  }

  
 
  ngOnInit() {
    this.emptyGuid = '00000000-0000-0000-0000-000000000000';
    this.searchFilterModel = this.filterModels;
    if (this.searchFilterModel) {
      this.initializeMethod();
      this.callSelectedFilters();
    }
  }
}

