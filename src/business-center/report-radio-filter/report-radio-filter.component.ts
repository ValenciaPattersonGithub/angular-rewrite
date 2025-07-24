import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
@Component({
  selector: 'report-radio-filter',
  templateUrl: './report-radio-filter.component.html',
  styleUrls: ['./report-radio-filter.component.scss']
})
export class ReportRadioFilterComponent implements OnInit {

  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize
    ) { }
    @Input() filterModels;
    @Output() changeData = new EventEmitter<any>();
  // initializations
  defaultData;
  showMoreButtonText;
  reportRadioFilterModel;

onChangeText() {
    this.reportRadioFilterModel.FilterDto = this.getSelectedItemIds();
    if (this.reportRadioFilterModel.reportId && this.reportRadioFilterModel.reportId === 9) {
      this.changeData.emit(this.reportRadioFilterModel);
    } else {
      this.changeData.emit();
    }
}

toggleRadio(filterValue) {
    for (const item of this.reportRadioFilterModel.data) {
        item.Checked = false;
        if (filterValue === item.Value) {
            item.Checked = true;
        }
    }
    this.reportRadioFilterModel.FilterDto = this.getSelectedItemIds();
    this.reportRadioFilterModel.FilterString = this.buildFilterString();
    if (this.reportRadioFilterModel.reportId && this.reportRadioFilterModel.reportId === 9) {
      this.changeData.emit(this.reportRadioFilterModel);
    } else {
      this.changeData.emit();
    }
}

buildFilterString() {
    let filterString = '';
    for (const item of this.reportRadioFilterModel.data) {
        if (item.Checked) {
            filterString = item.Value;
        }
    }
    if (filterString === '') {
        filterString = this.localize.getLocalizedString('No filters applied');
    }
    return filterString;
}

getSelectedItemIds() {
    const id = []; // Make array because not sure the type of variable
    if (this.reportRadioFilterModel.data.length > 0) {
        for (const item of this.reportRadioFilterModel.data) {
                if (item.Checked) {
                    id.push(item.Id);
                }
            }
    }
    return id[0];
}

resetMethod() {
      if (this.showMoreButtonText == this.localize.getLocalizedString('Show Less')) {
          this.showMoreButton();
      }
      this.showMoreCheck();
}

// set visibility of multiple filter options
showMoreCheck() {
  if (this.reportRadioFilterModel.data.length > 5) {
      const isVisible = this.showMoreButtonText == this.localize.getLocalizedString('Show More') ? false : true;
      this.setArrayVisibility(isVisible);
  }
}

setArrayVisibility(isVisible) {
  for (let i = 5; i < this.reportRadioFilterModel.data.length; i++) {
      this.reportRadioFilterModel.data[i].isVisible = isVisible;
  }
}

hasLocations(locs, locStatus) {
  let result = false;
  if (locs.length > 0) {
    for (const item of locs) {
      if (item.LocationStatus === locStatus && item.isVisible) {
        return result = true;
        break;
      }
    }

  }
  return result;
}

//#region show more/less button

// Toggle show more button
showMoreButton() {
  if (this.showMoreButtonText === this.localize.getLocalizedString('Show More')) {
      for (const item of this.reportRadioFilterModel.data) {
          item.isVisible = true;
      }
      this.showMoreButtonText = this.localize.getLocalizedString('Show Less');
  } else {
      let ctr = 1;
      for (const item of this.reportRadioFilterModel.data) {
          if (ctr > 5) {
              item.isVisible = false;
          }
          ctr++;
      }
      this.showMoreButtonText = this.localize.getLocalizedString('Show More');
  }
}

  ngOnInit() {
    if (this.filterModels) {
    this.reportRadioFilterModel = this.filterModels;
    }
    if (this.reportRadioFilterModel) {
      if (this.reportRadioFilterModel) {
        if (this.showMoreButtonText && this.showMoreButtonText === 'Show Less') {
          this.showMoreButtonText = this.localize.getLocalizedString('Show More');
          this.showMoreButton();
        } else {
          this.showMoreButtonText = this.localize.getLocalizedString('Show More');
        }
        this.showMoreCheck();
    }
        this.showMoreCheck();
  }
}
}
