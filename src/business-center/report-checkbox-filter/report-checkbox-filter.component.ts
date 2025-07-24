import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output
} from "@angular/core";
declare var angular: any;

@Component({
  selector: 'report-checkbox-filter',
  templateUrl: './report-checkbox-filter.component.html',
  styleUrls: ['./report-checkbox-filter.component.scss']
})
export class ReportCheckboxFilterComponent implements OnInit {
  @Input() filterModels;
  @Input() useAllOptionInDto: boolean;
  @Output() showMoreParent = new EventEmitter<any>();
  @Output() onChanged = new EventEmitter<any>();

  //initializations
  isVisibleShowLessbutton = false;
  isVisibleShowMorebutton = false;
  showMoreButtonText;
  textExpandCollapse = this.localize.getLocalizedString('Expand All');
  classExpandCollapse = 'btn soar-link icon-button font-14 expand-all';
  DisplayOptionsName = 'Display Options';
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  defaultData: any;
  reportCheckboxFilterModel: any;

  // set "all" checkbox depending on which boxes are selected
  toggleSelect(filterValue, filterHeader, model) {
    var allStatus = angular
      .element("ul[id='" + filterHeader + "']")
      .find('input[type=checkbox]')
      .toArray();
    var newFilterCount = 0;
    var index = 0;
    if (filterValue === 'All') {
      if (!allStatus[0].checked) {
        for (let liObject of allStatus) {
          liObject.checked = false;
          model.data[index].Checked = liObject.checked;
          index++;
        };
      } else {
        for (let liObject of allStatus) {
          liObject.checked = true;
          model.data[index].Checked = liObject.checked;
          index++;
          newFilterCount += 1;
        };
      }
    } else {
      if (model.Name !== this.DisplayOptionsName) {
        allStatus[0].checked = true;
        model.data[0].Checked = allStatus[0].checked;
        for (let liObject of allStatus) {
          if (index > 0) {
            model.data[index].Checked = liObject.checked;
            if (liObject.checked) {
              newFilterCount += 1;
            }
          }
          index++;
          if (!liObject.checked) {
            allStatus[0].checked = false;
            model.data[0].Checked = allStatus[0].checked;
          }
        };
        if (allStatus[0].checked) {
          newFilterCount += 1;
        }
      } else {
        model.data[index].Checked = allStatus[0].checked;
        if (allStatus[0].checked) {
          newFilterCount += 1;
        }
      }
    }
    var onChangeObj = { 'count': newFilterCount - model.DefaultFilterCount, 'name': model.Name, dataReport: this.reportCheckboxFilterModel };
    
    if (
      this.reportCheckboxFilterModel.FilterFilterModel &&
      model.Name === this.reportCheckboxFilterModel.FilterFilterModel.Name
    ) {
      this.setFilterString(this.reportCheckboxFilterModel);
      this.reportCheckboxFilterModel.FilterDto =
        this.reportCheckboxFilterModel.data[0].Id !== undefined
          ? this.getSelectedItemIds(this.reportCheckboxFilterModel)
          : this.getSelectedItemStrings(this.reportCheckboxFilterModel);
    }
    this.setFilterString(model);
    model.FilterDto =
      model.data[0].Id !== undefined
        ? this.getSelectedItemIds(model)
        : this.getSelectedItemStrings(model);
    model.DefaultFilterCount = newFilterCount;
    this.onChanged.emit(onChangeObj);
  };

  buildFilterString(model) {
    if (
      model.data[0] &&
      model.data[0].Checked &&
      model.data[0].Value === this.localize.getLocalizedString('All')
    ) {
      return this.localize.getLocalizedString('All');
    } else {
      var filterString = this.localize.getLocalizedString('');
      for (let obj of model.data) {
        if (obj.Checked) {
          filterString = filterString.concat(
            obj.Value + ((model.Name === 'Providers' || model.Name === 'Team Members') ? this.localize.getLocalizedString('; ') : this.localize.getLocalizedString(', '))
          );
        }
      };
      filterString = filterString.substring(0, filterString.length - 2);
      if (filterString === '') {
        filterString = this.localize.getLocalizedString('No filters applied');
      }
      return filterString;
    }
  };

  setFilterString(model) {
    model.FilterString = this.buildFilterString(model);
  };

  getSelectedItemIds(model) {
    var ids = [];
    var index = 0;
    if (model.data.length > 0) {
      // Will skip if all is checked.
      for (let item of model.data) {
        if (
          (index > 0 ||
            (index === 0 && this.useAllOptionInDto) ||
            (index === 0 &&
              model.FilterFilterModel &&
              model.FilterFilterModel.data[0].Checked)) &&
          item.Checked
        ) {
          ids.push(item.Id);
        }
        index++;
      };
    }
    return ids;
  };

  getSelectedItemStrings(model) {
    var strings = [];
    if (model.data.length > 0) {
      // Will skip if all is checked.
      for (let item of model.data) {
        if (item.Checked) {
          strings.push(item.Value);
        }
      };
    }
    return strings;
  };
  resetMethod() {
    if (
      this.showMoreButtonText === this.localize.getLocalizedString('Show Less')
    ) {
      this.showMoreButton(this.reportCheckboxFilterModel);
    }
    this.showMoreCheck(this.reportCheckboxFilterModel);
    if (this.filterModels.Name === 'Discount Type') {
      // this.discountTypeFilterString();
    }
  }

  // set visibility of multiple filter options
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

  hasLocations(locs, locStatus) {
    var result = false;
    if (locs.length > 0) {
      for (let item of locs) {
        if (item.LocationStatus === locStatus && item.isVisible) {
          return result = true;
          break;
        }
      }

    }
    return result;
  };

  hasUsersWithGivenActiveState(elements, state) {
    var result = false;
    if (elements.length > 0) {
      for (let item of elements) {
        if (item.IsActive === state && item.isVisible) {
          return result = true;
          break;
        }
      }

    }
    return result;
  };

  //#region show more/less button

  // Toggle show more button
  showMoreButton(model) {
    if (this.showMoreButtonText === this.localize.getLocalizedString('Show More')) {
      for (let item of model.data) {
        item.isVisible = true;
      };
      this.showMoreButtonText = this.localize.getLocalizedString('Show Less');
    } else {
      var ctr = 1;
      for (let item of model.data) {
        if (ctr > 5) {
          item.isVisible = false;
        }
        ctr++;
      };
      this.showMoreButtonText = this.localize.getLocalizedString('Show More');
    }

    var sendObj = {
      'name': model.Name,
      'showPartialList': this.showMoreButtonText === this.localize.getLocalizedString('Show More')
    }
    this.showMoreParent.emit(sendObj);
  };

  constructor(
    @Inject("toastrFactory") private toastrFactory,
    @Inject("localize") private localize
  ) { }
  discountTypeFilterString() {
    this.filterModels.FilterString = 'All';
  }
  ngOnInit() {
    this.reportCheckboxFilterModel = this.filterModels;
    if (this.reportCheckboxFilterModel) {
      this.defaultData = this.reportCheckboxFilterModel;
      if (this.showMoreButtonText && this.showMoreButtonText === 'Show Less') {
        this.showMoreButtonText = this.localize.getLocalizedString('Show More');
        this.showMoreButton(this.reportCheckboxFilterModel);
      } else {
        this.showMoreButtonText = this.localize.getLocalizedString('Show More');
      }
      if (this.filterModels.Name === 'Discount Type') {
        // this.discountTypeFilterString();
      }
    }
  }
}
