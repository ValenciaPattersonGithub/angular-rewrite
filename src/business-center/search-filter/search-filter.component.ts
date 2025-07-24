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
  selector: 'search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
})
export class SearchFilterComponent implements OnInit {
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
  itemSelected;
  matchingItems;
  filterId;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize
  ) {}

  initializeMethod() {
    this.filterId =
      this.searchFilterModel.Name.charAt(0).toLowerCase() +
      this.searchFilterModel.Name.replace(/\s/g, '').slice(1);
    var fieldName = this.searchFilterModel.Name.replace(/\s/g, '');
    this.data = [];
    let checkedAllValue = false;
    let checkedSelectedValue = false;
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.ServiceCodeId &&
      this.userDefinedFilter.ServiceCodeId !== this.emptyGuid
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
      this.searchFilterModel.FilterDto = this.emptyGuid;
      this.searchFilterModel.FilterString =
        this.localize.getLocalizedString('All');
      this.data[0].Checked = true;
      this.data[1].Checked = false;
      this.matchingItems = [];
    } else {
      this.searchFilterModel.FilterDto = this.selectedItem;
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
      this.selectedItem = item[this.searchFilterModel.FilterDtoColumns[0]];
      this.searchFilterModel.FilterDto =
        item[this.searchFilterModel.FilterDtoColumns[0]];
      this.searchFilterModel.FilterString =
        item[this.searchFilterModel.DisplayColumns[0]];
      this.searchKeywords = item[this.searchFilterModel.DisplayColumns[0]];
      this.selectedItemName = item[this.searchFilterModel.DisplayColumns[0]];
      this.matchingItems = [];
      this.itemSelected = true;
    }
    this.changeData.emit();
  }
  callSelectedFilters() {
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.ServiceCodeId &&
      this.userDefinedFilter.ServiceCodeId !== this.emptyGuid
    ) {
      this.selectItem({
        ServiceCodeId: this.userDefinedFilter.ServiceCodeId,
        Code: this.userDefinedFilter.ServiceCode,
      });
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
