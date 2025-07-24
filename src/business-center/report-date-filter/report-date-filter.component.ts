import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
  KeyValueDiffers
} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'report-date-filter',
  templateUrl: './report-date-filter.component.html',
  styleUrls: ['./report-date-filter.component.scss']
})
export class ReportDateFilterComponent implements OnInit {
  differ;
  constructor(@Inject('toastrFactory') private toastrFactory,
              @Inject('localize') private localize, differs: KeyValueDiffers,
              @Inject('ReportIdsForDateOptions') private reportIdsForDateOptions) {
    this.differ = differs.find({}).create();
  }
  @Input() filterModels;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onChanged  = new EventEmitter<any>();
  @Output() changeData = new EventEmitter<any>();
  // initializations
  customOption;
  radioOptions;
  dateFilterModel;
  textDateRange;
  createdDateValid;
  maxDate;
  minDate;
  startDate;
  endDate;
  errorRequiredDate;
  errorDateRange;
  invaliDate;
  classExpandCollapse;
  isValidDateRange;
  hasValidDates;
  currentDate;
  firstDayOfMonth;
  lastDayOfMonth;
  lastDayOfNextMonth;
  tomorrow;
  ActivityLogReportId;
  EncountersByFeeScheduleReportId;
  ProjectedNetProductionReportId;
  ProjectedNetProductionBetaReportId;
  ProposedTreatmentReportId;
  ProposedTreatmentBetaReportId;
  ScheduleReportCategoryId;
  ActivityLogBetaReportId;
  dateRangeFlag;
  dateTypeVal;
  ignoreVal;
  // initialize variables that are used for date range filter
  initializeDateRangeElements(reset) {
    this.dateFilterModel.UseOptions = false;
    this.ignoreVal = this.dateFilterModel.defaultType;
    this.errorRequiredDate = this.localize.getLocalizedString(
      'From Date and To Date are required'
    );
    this.errorDateRange = this.localize.getLocalizedString(
      'From date must be the same or less than to date.'
    );
    this.invaliDate = this.localize.getLocalizedString(
      'Invalid Date'
    );

    this.classExpandCollapse = 'btn soar-link icon-button font-14 expand-all';
    this.isValidDateRange = true;
    this.hasValidDates = true;
    this.currentDate = new Date();
    this.firstDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    this.lastDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    );
    this.lastDayOfNextMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 2,
      0
    );
    this.tomorrow = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      this.currentDate.getDate() + 1
    );

    // initialize report id constants
    this.ActivityLogReportId = 24;
    this.EncountersByFeeScheduleReportId = 48;
    this.ProjectedNetProductionReportId = 56;
    this.ProposedTreatmentReportId = 61;
    this.ProposedTreatmentBetaReportId = 124;
    this.ProjectedNetProductionBetaReportId = 102;

    // initialize report category id constants
    this.ScheduleReportCategoryId = 3;
    this.ActivityLogBetaReportId = 105;
    if (this.dateFilterModel.Name !== 'Original Transaction Date Range') {
    for (const id of this.reportIdsForDateOptions) {
      if (this.dateFilterModel.ReportId === id.ReportId) {
        this.dateFilterModel.UseOptions = true;
        break;
      }
    }
  } else {
    if (!this.dateFilterModel.ignoreType && this.dateFilterModel.Ignore === '0') {
    this.dateRangeSelected();
    }
  }
    if (this.dateFilterModel.UseOptions) {
    const dateType = sessionStorage.getItem('dateType');
    if (dateType === 'fromReports' || dateType === 'fromInsurance' ) {
    this.dateTypeVal = this.dateFilterModel.defaultDateType;
    this.toggleRadio(this.dateTypeVal);
    this.dateRangeFlag = false;
    this.radioOptions = [
       {
         Field: 'DateOption',
         Value: (this.dateFilterModel.ReportId === 56 || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId) ? this.localize.getLocalizedString('Tomorrow') : 
                                                       this.localize.getLocalizedString('Today'),
         Key: true,
         Checked: this.dateTypeVal === 1 ? true : false,
         Id: 1,
         FilterValue: null,
         isVisible: true
       },
       {
         Field: 'DateOption',
         Value: (this.dateFilterModel.ReportId === 56 || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId) ? this.localize.getLocalizedString('This Month') : 
                                                       this.localize.getLocalizedString('Month to Date'),
         Key: true,
         Checked: this.dateTypeVal === 2  ? true : false,
         Id: 2,
         FilterValue: null,
         isVisible: true
       },
       {
         Field: 'DateOption',
         Value: (this.dateFilterModel.ReportId === 56 || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId) ? this.localize.getLocalizedString('This Year') : 
                                                       this.localize.getLocalizedString('Year to Date'),
         Key: true,
         Checked: this.dateTypeVal === 3 ? true : false,
         Id: 3,
         FilterValue: null,
         isVisible: true
       }
     ];
    this.customOption = {
       Field: 'DateOption',
       Value: '',
       Key: true,
       Checked: this.dateTypeVal === 4 ? true : false,
       Id: 4,
       FilterValue: null,
       isVisible: true
     };
   } else {
     this.dateRangeFlag = true;
     this.radioOptions = [
       {
         Field: 'DateOption',
         Value: this.localize.getLocalizedString('Today'),
         Key: true,
         Checked: false,
         Id: 1,
         FilterValue: null,
         isVisible: true
       },
       {
         Field: 'DateOption',
         Value: this.localize.getLocalizedString('Month to Date'),
         Key: true,
         Checked: reset ?  true : false,
         Id: 2,
         FilterValue: null,
         isVisible: true
       },
       {
         Field: 'DateOption',
         Value: this.localize.getLocalizedString('Year to Date'),
         Key: true,
         Checked: false,
         Id: 3,
         FilterValue: null,
         isVisible: true
       }
     ];
     this.customOption = {
       Field: 'DateOption',
       Value: '',
       Key: true,
       Checked: false,
       Id: 4,
       FilterValue: null,
       isVisible: true
     };
     if (!reset) {
     if (dateType === 'YTD') {
       this.radioOptions[2].Checked = true;
     } else if (dateType === 'MTD') {
       this.radioOptions[1].Checked = true;
     } else if (dateType === 'Today') {
       this.radioOptions[0].Checked = true;
     } else {
       // Last Year  Last Month  Date Rangee
       this.customOption.Checked = true;
     }
    }
   }
   }
    this.errorDateRange = this.localize.getLocalizedString(
      'Please enter a valid To and From date range'
    );
    this.textDateRange = this.localize.getLocalizedString('Date Range');
    this.createdDateValid = true;
    this.maxDate =
      this.dateFilterModel.ReportCategory ===
        this.ScheduleReportCategoryId ||
        this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId || this.dateFilterModel.ReportId === this.ProposedTreatmentReportId || this.dateFilterModel.ReportId === this.ProposedTreatmentBetaReportId
        ? new Date(8640000000000000)
        : this.currentDate;
    this.minDate =
        this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId
        ? this.tomorrow
        : null;
    this.startDate = {
      Name: this.localize.getLocalizedString('From'),
      FilterField: 'StartDate',
      FilterOperator: 'str'
    };
    this.endDate = {
      Name: this.localize.getLocalizedString('To'),
      FilterField: 'EndDate',
      FilterOperator: 'end'
    };
    const dateTypeSession = sessionStorage.getItem('dateType');
    if (this.dateTypeVal === 2 ||  this.dateFilterModel.Ignore === '1' ||
        (dateTypeSession !== 'fromReports' && dateTypeSession !== 'fromInsurance' && dateTypeSession!=='Date Range')) {
        this.setDefaultDateRange();
      }
  }
  changeDefault() {
    if (!this.dateFilterModel.ignoreType && this.dateFilterModel.Ignore === '0') {
      this.dateFilterModel.StartDate = null;
      this.dateFilterModel.EndDate   = null;
      this.validDateRange(null, null, false);
      this.onChanged.emit(true);
    }
    this.changeData.emit();
  }
  // set default date range to current date
  setDefaultDateRange() {
      this.dateFilterModel.StartDate =
      // (this.dateFilterModel.ReportId ===  this.ActivityLogReportId)
      // ? this.currentDate :
         this.dateFilterModel.ReportId ===
          this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId
          ? this.tomorrow
          : this.firstDayOfMonth;
      if (this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId) {
            if (this.dateFilterModel.StartDate.getMonth() === this.currentDate.getMonth()) {
              this.dateFilterModel.EndDate = this.lastDayOfMonth;
            } else {
              this.dateFilterModel.EndDate = this.lastDayOfNextMonth;
            }
          } else {
            this.dateFilterModel.EndDate = this.currentDate;
          }
      this.changeStartDate(
      this.dateFilterModel.StartDate,
      this.dateFilterModel.EndDate,
      true,
      false
    );
      this.changeEndDate(
      this.dateFilterModel.StartDate,
      this.dateFilterModel.EndDate, false, true
    );
      this.onChanged.emit();
  }

  toggleRadio(id) {
    this.dateRangeFlag = false;
    if (this.customOption !== undefined) {this.customOption.Checked = false;}
    this.dateFilterModel.dateType = id;
    if (this.dateFilterModel.Name === 'Collection Date') { this.dateFilterModel.CollectioDateType = id;}
    if (this.dateFilterModel.Name === 'Production Date') { this.dateFilterModel.ProductionDateType = id;}

    switch (id) {
      case 1:
        this.setDefaultDateRange();
            this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId ? this.setTomorrow():this.setToday();
        break;
      case 2:
        this.setDefaultDateRange();
            this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId ? this.lastDayOfMonth:this.setMonth();
        break;
      case 3:
        this.setDefaultDateRange();
        this.setYear();
        break;
      case 4:
        if (this.customOption !== undefined) {this.customOption.Checked = true; }
        this.dateRangeSelected();
    }
    this.changeData.emit();
  }

  dateRangeSelected() {
    const initialDateRange = sessionStorage.getItem('dateRangeFlag');
    let startDateFlag = false;
    let endDateFlag = false;
    if (this.dateFilterModel.UserStartDate && this.dateFilterModel.UserStartDate !== 'Invalid date' && initialDateRange === 'true') {
      this.dateFilterModel.StartDate = new Date(this.dateFilterModel.UserStartDate);
      startDateFlag = false;
    } else {
      this.dateFilterModel.StartDate = null;
      startDateFlag = true;
    }
    if (this.dateFilterModel.UserEndDate && this.dateFilterModel.UserEndDate !== 'Invalid date' && initialDateRange === 'true') {
      this.dateFilterModel.EndDate =  new Date(this.dateFilterModel.UserEndDate);
      endDateFlag = false;
    } else {
      this.dateFilterModel.EndDate = null;
      endDateFlag = true;
    }

    this.changeStartDate(
      this.dateFilterModel.StartDate,
      this.dateFilterModel.EndDate,
      true,
      startDateFlag
    );
    this.changeEndDate(
      this.dateFilterModel.StartDate,
      this.dateFilterModel.EndDate, endDateFlag, true
    );
}
  setToday() {
    this.changeStartDate(this.currentDate, this.currentDate, true, false);
    this.changeEndDate(this.currentDate, this.currentDate, false, true);
  }
  setTomorrow() {
    this.changeStartDate(this.tomorrow, this.tomorrow, true, false);
    this.changeEndDate(this.tomorrow, this.tomorrow, false, true);
  }

  setMonth() {
    this.changeStartDate(this.firstDayOfMonth, this.currentDate, true, false);
    this.changeEndDate(this.firstDayOfMonth, this.currentDate, false, true);
  }

  setYear() {
      if (this.dateFilterModel.ReportId === this.ProjectedNetProductionReportId || this.dateFilterModel.ReportId === this.ProjectedNetProductionBetaReportId) {
      const lastDayOfYear = new Date(this.currentDate.getFullYear(), 11, 31);
      this.changeStartDate(this.tomorrow, lastDayOfYear, true, false);
      this.changeEndDate(this.tomorrow, lastDayOfYear, false, true);
    } else{
      const firstDayOfYear = new Date(this.currentDate.getFullYear(), 0, 1);
      this.changeStartDate(firstDayOfYear, this.currentDate, true, false);
      this.changeEndDate(firstDayOfYear, this.currentDate, false, true);
    }

  }

  validDateRange(start, end, dateErr) {
    if (dateErr) {
      this.hasValidDates = false;
    } else {
      this.hasValidDates =
        this.dateFilterModel != null && start != null && end != null;
    }

    return this.hasValidDates;
  }
  // displays the data range for reports that are filtered that way
  setTitleDateRange(start, end, dateErr?) {
    let _: any;
    this.dateFilterModel.TitleDateRangeString = '';
    if (this.validDateRange(start, end, dateErr)) {
      if (
        (start === end) &&
        moment(new Date()).format('MM/DD/YYYY') ===
        moment(start).format('MM/DD/YYYY')) {
        this.dateFilterModel.TitleDateRangeString = this.localize.getLocalizedString(
          'Today'
        );
      } else {
        this.dateFilterModel.TitleDateRangeString =
          this.localize.getLocalizedString('From') +
          ' ' +
          moment(start).format('MM/DD/YYYY') +
          ' - ' +
          this.localize.getLocalizedString('To') +
          ' ' +
          moment(end).format('MM/DD/YYYY');
      }
    }
  }

  setFilterString(start, end, dateErr?) {
    // for Original Transaction Date Range radio button selects ignore
  if (this.dateFilterModel.Name === 'Original Transaction Date Range' && this.dateFilterModel.Ignore && this.dateFilterModel.Ignore === '1') {
      this.dateFilterModel.FilterString = 'Ignore';
    } else {
    if (this.validDateRange(start, end, dateErr)) {
      this.dateFilterModel.FilterString =
        moment(start).format('MM/DD/YYYY') +
        this.localize.getLocalizedString(' - ') +
        moment(end).format('MM/DD/YYYY');
    } else {
      this.dateFilterModel.FilterString = '';
    }
  }
  }

  changeStartDate(start, end, from, err) {
    const dateErr = '';
    this.dateFilterModel.FilterDtoStartDate = this.validDateRange(
      start,
      end,
      dateErr
    )
      ? new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0
      )
      : null;
    this.setFilterString(start, end, dateErr);
    this.setTitleDateRange(start, end, dateErr);
    if (from) {
       this.onChanged.emit(err);
    }
  }

  changeEndDate(start, end, dateErr, from) {
    this.dateFilterModel.FilterDtoEndDate = this.validDateRange(start, end, dateErr)
      ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0)
      : null;
    this.setFilterString(start, end, dateErr);
    this.setTitleDateRange(start, end, dateErr);
    if (from) {
      this.onChanged.emit(dateErr);
    }
  }
  isDateInvalid = true;
  watchStartDate(newValue) {
    if (newValue != null && (newValue.getFullYear() < 1900 || newValue.getFullYear() > 2099)) {
      this.isDateInvalid = true;
    }
    else {
      this.isDateInvalid = false;
      this.dateFilterModel.StartDate = newValue;
    }
    this.isValidDateRange =
      this.dateFilterModel.StartDate <= this.dateFilterModel.EndDate;
    if (
      (!this.dateFilterModel.UseOptions) || (this.dateRangeFlag) ||
      (this.dateFilterModel.UseOptions && this.customOption && this.customOption.Checked)
    ) {
      this.changeStartDate(
        this.dateFilterModel.StartDate,
        this.dateFilterModel.EndDate,
        false,
        this.isDateInvalid
      );
      this.changeEndDate(
        this.dateFilterModel.StartDate,
        this.dateFilterModel.EndDate,
        false,
        true
      );
    }
  }

  watchEndDate(newValue) {
    if (newValue != null && (newValue.getFullYear() < 1900 || newValue.getFullYear() > 2099)) {
      this.isDateInvalid = true;
    }
    else {
      this.isDateInvalid = false;
      this.dateFilterModel.EndDate = newValue;
    }

    this.isValidDateRange =
      this.dateFilterModel.StartDate <= this.dateFilterModel.EndDate;
    if (
      !this.dateFilterModel.UseOptions ||
      (this.dateFilterModel.UseOptions && this.customOption && this.customOption.Checked)
    ) {
      this.changeEndDate(
        this.dateFilterModel.StartDate,
        this.dateFilterModel.EndDate,
        this.isDateInvalid,
        true
      );
      this.changeStartDate(
        this.dateFilterModel.StartDate,
        this.dateFilterModel.EndDate,
        false,
        false
      );
    }
  }
  resetMethod() {
    if (this.dateFilterModel.Name === 'Original Transaction Date Range') {
      this.dateFilterModel.Ignore = this.ignoreVal;
      if (!this.dateFilterModel.ignoreType && this.dateFilterModel.Ignore === '0') {
        this.changeDefault();
      }
    }
    this.initializeDateRangeElements('reset');
    this.dateFilterModel.Reset = false;
  }

  ngOnInit() {
    if (this.filterModels) {
      if (!this.filterModels.ReportId) {
        this.filterModels.ReportId = this.dateFilterModel.ReportId;
      }
      this.dateFilterModel = this.filterModels;
      this.initializeDateRangeElements('');
    }
  }
  ngDoCheck() {
    const changes = this.differ.diff(this.dateFilterModel); // check for changes
    if (changes) {
      this.watchStartDate(this.dateFilterModel.StartDate);
      this.watchEndDate(this.dateFilterModel.EndDate);
    }
  }
}
