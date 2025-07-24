import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { isNullOrUndefined, isNull } from 'util';

@Component({
  selector: 'report-numeric-filter',
  templateUrl: './report-numeric-filter.component.html',
  styleUrls: ['./report-numeric-filter.component.scss'],
})
export class ReportNumericFilterComponent implements OnInit {
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize
  ) {}
  @Input() filterModels;
  @Input() angingOption;
  @Output() onChanged = new EventEmitter<any>();
  @Output() changeData = new EventEmitter<any>();
  //initializations
  reportNumericFilterModel;
  storedValue;
  storedValue2;
  defaultData;
  OptionTypes;
  errorMessage;
  invalidValues;
  lessThanValue = '';
  greaterThanValue = '';
  betweenLessValue = '';
  betweengreaterValue = '';
  setFilterDto(option, val1, val2) {
    if (isNull(option)) {
      this.reportNumericFilterModel.isValid = false;
    }
    this.reportNumericFilterModel.FilterDto = {
      OptionType: option,
      FirstValue: val1,
      SecondValue: val2,
    };
  }

  toggleRadio(filterValue) {
    this.resetFilterValues(filterValue);
    for (let item of this.reportNumericFilterModel.data) {
      item.Checked = false;
      if (filterValue === item.Value) {
        item.Checked = true;
        this.setFilterDto(item.OptionType, null, null);
        this.reportNumericFilterModel.FilterString = this.buildFilterString(
          item,
          ''
        );
        this.reportNumericFilterModel.isValid =
          item.OptionType === this.OptionTypes.All;
      }
    }
    this.invalidValues = false;
    this.errorMessage = '';
    this.onChanged.emit(this.reportNumericFilterModel.isValid);
    this.changeData.emit();
  }
  change(item, index, value) {
    this.invalidValues = false;
    this.errorMessage = '';
    this.reportNumericFilterModel.isValid = true;
    if (isNull(item)) {
      this.reportNumericFilterModel.isValid = false;
    } else {
      if (item.OptionType !== this.OptionTypes.Between) {
        // Greater than or less than option selected
        var val1 = this.checkValidity(item, index, 1);
        if (index === 1) {
          this.lessThanValue = val1;
        } else {
          this.greaterThanValue = val1;
        }
        value = val1;
        if (val1 !== '') {
          this.setFilterDto(item.OptionType, parseInt(val1), null);
        } else {
          this.reportNumericFilterModel.isValid = false;
        }
      } else {
        // Between option selected
        var value1 = this.checkValidity(item, this.OptionTypes.Between - 1, 1);
        var value2 = this.checkValidity(item, this.OptionTypes.Between, 2);
        if (index === 3) {
          value = value1;
          this.betweenLessValue = value1;
        } else {
          value = value2;
          this.betweengreaterValue = value2;
        }
        if (value1 !== '' && value2 !== '') {
          if (parseInt(value1) <= parseInt(value2)) {
            this.setFilterDto(
              item.OptionType,
              parseInt(value1),
              parseInt(value2)
            );
          } else {
            this.errorMessage = this.localize.getLocalizedString(
              'Please enter valid values'
            );
            this.invalidValues = true;
            this.reportNumericFilterModel.isValid = false;
          }
        } else {
          this.reportNumericFilterModel.isValid = false;
        }
      }
      this.reportNumericFilterModel.FilterString = this.buildFilterString(
        item,
        value
      );
    }
    this.onChanged.emit(this.reportNumericFilterModel.isValid);
    this.changeData.emit();
  }

  checkValidity(item, index, storedValueNumber) {
    var input: any = document.getElementById(item.Value + index);
    if (input.validity.valid) {
      this.updateStoredValue(storedValueNumber, input.value);
    } else {
      input.value = this.getStoredValue(storedValueNumber);
    }
    return input.value;
  }

  updateStoredValue(storedValueNumber, newValue) {
    if (storedValueNumber === 1) {
      this.storedValue = newValue;
    }
    if (storedValueNumber === 2) {
      this.storedValue2 = newValue;
    }
  }

  getStoredValue(storedValueNumber) {
    if (storedValueNumber === 1) {
      return this.storedValue;
    }
    if (storedValueNumber === 2) {
      return this.storedValue2;
    }
  }

  resetFilterValues(filterValue) {
    this.lessThanValue = '';
    this.greaterThanValue = '';
    this.betweenLessValue = '';
    this.betweengreaterValue = '';
    this.storedValue = '';
    this.storedValue2 = '';
  }

  buildFilterString(item, value) {
    var filterString = item.Value;
    if (item.OptionType !== this.OptionTypes.All) {
      if (item.OptionType !== 4) {
        filterString += '\xa0' + value;
      }
      if (item.OptionType === this.OptionTypes.Between) {
        filterString +=
          '\xa0' +
          this.betweenLessValue +
          '\xa0' +
          this.localize.getLocalizedString('and') +
          '\xa0' +
          this.betweengreaterValue;
      }
      filterString += '\xa0' + item.Units;
    }
    if (filterString === '') {
      filterString = this.localize.getLocalizedString('No filters applied');
    }
    return filterString;
  }

  numericReset() {
    this.defaultFilterDto();
    this.invalidValues = false;
    this.errorMessage = '';
    if (!this.angingOption || (this.angingOption && this.angingOption === 1)) {
      this.resetFilterValues('');
    } else {
      this.storedValue = '';
      this.storedValue2 = '';
    }
    this.onChanged.emit(true);
  }

  defaultFilterDto() {
    if (this.angingOption) {
      if (this.angingOption === 1) {
        this.setFilterDto(
          this.reportNumericFilterModel.data[0].OptionType,
          null,
          null
        );
        this.reportNumericFilterModel.FilterString = this.buildFilterString(
          this.reportNumericFilterModel.data[0],
          ''
        );
        this.reportNumericFilterModel.isValid = true;
      } else if (this.angingOption === 2) {
        this.lessThanValue = this.reportNumericFilterModel.data[1].FirstValue;
        this.setFilterDto(
          this.angingOption,
          this.reportNumericFilterModel.data[1].FirstValue,
          null
        );
        this.reportNumericFilterModel.FilterString = this.buildFilterString(
          this.reportNumericFilterModel.data[1],
          this.reportNumericFilterModel.data[1].FirstValue
        );
      } else if (this.angingOption === 3) {
        this.greaterThanValue =
          this.reportNumericFilterModel.data[2].FirstValue;
        this.setFilterDto(
          this.angingOption,
          this.reportNumericFilterModel.data[2].FirstValue,
          null
        );
        this.reportNumericFilterModel.FilterString = this.buildFilterString(
          this.reportNumericFilterModel.data[2],
          this.reportNumericFilterModel.data[2].FirstValue
        );
      } else if (this.angingOption === 4) {
        this.betweenLessValue =
          this.reportNumericFilterModel.data[3].FirstValue;
        this.betweengreaterValue =
          this.reportNumericFilterModel.data[3].SecondValue;
        this.setFilterDto(
          this.angingOption,
          this.reportNumericFilterModel.data[3].FirstValue,
          this.reportNumericFilterModel.data[3].SecondValue
        );
        this.reportNumericFilterModel.FilterString = this.buildFilterString(
          this.reportNumericFilterModel.data[3],
          ''
        );
      }
    } else {
      this.setFilterDto(
        this.reportNumericFilterModel.data[0].OptionType,
        null,
        null
      );
      this.reportNumericFilterModel.FilterString = this.buildFilterString(
        this.reportNumericFilterModel.data[0],
        ''
      );
      this.reportNumericFilterModel.isValid = true;
    }
  }
  ngOnInit() {
    this.reportNumericFilterModel = this.filterModels;
    this.defaultData = this.reportNumericFilterModel.data;
    this.reportNumericFilterModel.isValid = true;
    this.storedValue = '';
    this.storedValue2 = '';

    this.OptionTypes = {
      All: 1,
      LessThan: 2,
      GreaterThan: 3,
      Between: 4,
    };
    this.defaultFilterDto();
  }
}
