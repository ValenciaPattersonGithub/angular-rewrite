import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { CommunicationCategory, CommunicationSort, CommunicationEvent } from '../../common/models/enums';

@Component({
  selector: 'communication-center-filterbar',
  templateUrl: './communication-center-filterbar.component.html',
  styleUrls: ['./communication-center-filterbar.component.scss']
})
export class CommunicationCenterFilterbarComponent implements OnInit {

  sortList: Array<{ text: string, value: number }> = [];
  categoryList: Array<{ text: string, value: number }> = [];
  selectedSortItem: any;
  selectedCategoryItem: any;
  communicationsFilterObject = { SortFilter: 0, CategoryFilter: 0, StartDate: null, EndDate: null };
  minDate: Date;
  maxDate: Date;
  endDateError: boolean;
  startDateError: boolean;
  dateplaceHolder: any;
  CommunicationSort = CommunicationSort;
  constructor(
    private translate: TranslateService,
    private patientCommunicationCenterService: PatientCommunicationCenterService) { }

  ngOnInit() {
    this.getSorts();
    this.getCategories();
    this.selectedCategoryItem = -1;
    this.selectedSortItem = CommunicationSort.NewestToOldest;
    this.communicationsFilterObject.SortFilter = this.selectedSortItem;
    this.maxDate = new Date();
    this.minDate = new Date(this.maxDate.getFullYear() - 1, this.maxDate.getMonth(), this.maxDate.getDate());
    this.dateplaceHolder = { year: 'YYYY', month: 'MM', day: 'DD' };
    this.communicationsFilterObject.StartDate = new Date(this.minDate.toDateString());
    this.communicationsFilterObject.EndDate = new Date(this.maxDate.toDateString());
    setTimeout(() => {
      this.patientCommunicationCenterService
        .setCommunicationEvent({ eventtype: CommunicationEvent.ApplyCommunicationsFilters, data: this.communicationsFilterObject });
    }, 100);
  }
  getSorts = () => {
    this.sortList = [
      { text: this.translate.instant('Newest to Oldest'), value: CommunicationSort.NewestToOldest },
      { text: this.translate.instant('Oldest to Newest'), value: CommunicationSort.OldestToNewest }
    ];
  }
  getCategories = () => {
    this.categoryList = [
      { text: this.translate.instant('All Categories'), value: -1 },
      { text: this.translate.instant('Account'), value: CommunicationCategory.Account },
      { text: this.translate.instant('Insurance'), value: CommunicationCategory.Insurance },
      { text: this.translate.instant('Misc Communication'), value: CommunicationCategory.MiscCommunication },
      { text: this.translate.instant('Patient Care'), value: CommunicationCategory.PatientCare }
    ];
  }
  onSortSelected = (event: any) => {
    if (event.target.value) {
      this.communicationsFilterObject.SortFilter = Number(event.target.value);
      this.patientCommunicationCenterService
        .setCommunicationEvent({ eventtype: CommunicationEvent.ApplyCommunicationsFilters, data: this.communicationsFilterObject });
    }
  }
  onCategorySelected = (event: any) => {
    if (event.target.value) {
        this.communicationsFilterObject.CategoryFilter = Number(event.target.value);
        this.patientCommunicationCenterService
          .setCommunicationEvent({ eventtype: CommunicationEvent.ApplyCommunicationsFilters, data: this.communicationsFilterObject });
      }
    }
  OnStartDateChanged = (startDate: any) => {
    if (startDate) {
      this.communicationsFilterObject.StartDate = new Date(new Date(startDate).toDateString());
      this.startDateError = (this.communicationsFilterObject.StartDate > this.communicationsFilterObject.EndDate);
      this.endDateError = (this.communicationsFilterObject.EndDate < this.communicationsFilterObject.StartDate);
    } else {
      this.endDateError = this.startDateError = false;
      this.communicationsFilterObject.StartDate = startDate;
    }
    if (!this.startDateError) {
      this.patientCommunicationCenterService
        .setCommunicationEvent({ eventtype: CommunicationEvent.ApplyCommunicationsFilters, data: this.communicationsFilterObject });
    }
  }
  OnEndDateChanged = (endDate: any) => {
    if (endDate) {
      this.communicationsFilterObject.EndDate = new Date(new Date(endDate).toDateString());
      this.endDateError = (this.communicationsFilterObject.EndDate < this.communicationsFilterObject.StartDate);
      this.startDateError = (this.communicationsFilterObject.StartDate > this.communicationsFilterObject.EndDate);
    } else {
      this.endDateError = this.startDateError = false;
      this.communicationsFilterObject.EndDate = endDate;
    }
    if (!this.endDateError) {
      this.patientCommunicationCenterService
        .setCommunicationEvent({ eventtype: CommunicationEvent.ApplyCommunicationsFilters, data: this.communicationsFilterObject });
    }
  }
}
