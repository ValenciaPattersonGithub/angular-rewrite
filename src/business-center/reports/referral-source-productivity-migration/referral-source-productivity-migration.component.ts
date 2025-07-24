import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'referral-source-productivity-migration',
  templateUrl: './referral-source-productivity-migration.component.html',
  styleUrls: ['./referral-source-productivity-migration.component.scss']
})
export class ReferralSourceProductivityMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  _data: any;
  reportView: string = "summary";
  totalRecords: number = 0;
  pageSize: number = 15;
  currentPageNumber: number = 1;
  maxPagesToShow: number = 10;
  numberOfPages: number = 0;
  pageNumberClicked: boolean = false;
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

  ReportTotalRangeSelected: number = 0;
  ReportTotalThisMonth: number = 0;
  ReportTotalThisYear: number = 0;
  asyncBlobId: string = '';
  constructor() {
    const hash = window.location.hash;
        if (hash) {
            const queryParams = hash.split('?')[1];
            if (queryParams) {
                const urlParams = new URLSearchParams(queryParams);
                this.asyncBlobId = urlParams.get('bid');
                this.pageSize = 100000;
            }
        }
   }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && ((this.data.ReferralSourceProductivitySummary
      && this.data.ReferralSourceProductivitySummary.Locations
      && this.data.ReferralSourceProductivitySummary.Locations.length > 0) ||
      (this.data.ReferralSourceProductivityDetailed
        && this.data.ReferralSourceProductivityDetailed.Locations
        && this.data.ReferralSourceProductivityDetailed.Locations.length > 0))) {

      if (this.data.ReferralSourceProductivitySummary != null && this.data.ReferralSourceProductivitySummary.Locations && this.data.ReferralSourceProductivitySummary.Locations.length > 0) {
        this.reportView = "summary";
      } else if (this.data.ReferralSourceProductivityDetailed != null && this.data.ReferralSourceProductivityDetailed.Locations && this.data.ReferralSourceProductivityDetailed.Locations.length > 0) {
        this.reportView = "detailed";
      }

      if (this.reportView == "detailed") {
        this._data = this.data.ReferralSourceProductivityDetailed;

        if (this.data.TotalRecords == -1) {
          return;
        }
        this.totalRecords = this.data.TotalRecords;
        this.numberOfPages = Math.ceil(this.totalRecords / this.pageSize);
        this.isDataLoaded = false;
        this.reportData = [];
        var element = {};
        let isLocationChanged: boolean = false;

        let ltd_rangeTotal = 0;
        //let ltd_monthProductivityTotal = 0;
        //let ltd_yearProductivityTotal = 0;
        let ltd_locationName = "";
        let ltd_referralName = "";

        for (var i = 0; i < this._data.Locations.length; i++) {
          isLocationChanged = true;
          ltd_locationName = this._data.Locations[i].Location;
          for (var j = 0; j < this._data.Locations[i].Sources.length; j++) {
            ltd_referralName = this._data.Locations[i].Sources[j].ReferredPatient;
            for (var k = 0; k < this._data.Locations[i].Sources[j].Patients.length; k++) {
              element = {};
              element = angular.copy(this._data.Locations[i].Sources[j].Patients[k]);
              element['Location'] = this._data.Locations[i].Location;
              element['ReferralSource'] = this._data.Locations[i].Sources[j].ReferralSource;
              element['RangeSelected'] = this._data.Locations[i].Sources[j].Patients[k].RangeSelected;
              element['Patient'] = this._data.Locations[i].Sources[j].Patients[k].Patient;
              element['ReferralDate'] = this._data.Locations[i].Sources[j].Patients[k].ReferralDate;
              element['ReferredPatient'] = this._data.Locations[i].Sources[j].ReferredPatient;
              element['FirstVisit'] = this._data.Locations[i].Sources[j].Patients[k].FirstVisit;
              element['ThisMonth'] = this._data.Locations[i].Sources[j].Patients[k].ThisMonth;
              element['ThisYear'] = this._data.Locations[i].Sources[j].Patients[k].ThisYear;
              element['IsFooter'] = false;
              //element['ReferenceSourceRangeSelectedTotal'] = this._data.Locations[i].Sources[j].RangeSelected;
              //element['ReferenceSourceThisMonthTotal'] = this._data.Locations[i].Sources[j].ThisMonth;
              //element['ReferenceSourceThisYearTotal'] = this._data.Locations[i].Sources[j].ThisYear;
              element['Class'] = j % 2 == 0 ? "stripOdd" : "stripOdd";

              if (isLocationChanged == true) {
                element['IsReferralSourceHeader'] = true;
                isLocationChanged = false;
              } else {
                element['IsReferralSourceHeader'] = false;
              }

              this.reportData.push(element);
            }
            element = {};
            element['Class'] = j % 2 == 0 ? "stripOdd" : "stripOdd";
            element['LocationName'] = ltd_locationName;
            element['ReferralNameForTotal'] = ltd_referralName;
            element['RangeSelectedTotal'] = this._data.Locations[i].Sources[j].RangeSelected;
            element['ThisMonthTotal'] = this._data.Locations[i].Sources[j].ThisMonth;
            element['ThisYearTotal'] = this._data.Locations[i].Sources[j].ThisYear;
            element['IsReportTotals'] = true;
            this.reportData.push(element);
          }
          element = {};
          element['Class'] = j % 2 == 0 ? "stripEven" : "stripEven";
          element['LocationName'] = this._data.Locations[i].Location;
          element['RangeSelectedLocationTotal'] = this._data.Locations[i].RangeSelected;
          element['ThisMonthLocationTotal'] = this._data.Locations[i].ThisMonth;
          element['ThisYearLocationTotal'] = this._data.Locations[i].ThisYear;
          element['IsLocationReportTotals'] = true;
          element['ShowTotals'] = this._data.Locations[i].ShowTotals;
          this.reportData.push(element);
        }
        element = {};
        element['Class'] = j % 2 == 0 ? "stripOdd" : "stripOdd";
        element['ReportTotalRangeSelected'] = this._data.RangeSelected;
        element['ReportTotalThisMonth'] = this._data.ThisMonth;
        element['ReportTotalThisYear'] = this._data.ThisYear;
        element['IsReportTotals'] = false;
        element['IsFinalReportTotals'] = true;
        this.reportData.push(element);

        this._data.totalRecords = this.reportData.length;
        this.isDataLoaded = true;
      }
      else if (this.reportView == "summary") {
        this._data = this.data.ReferralSourceProductivitySummary;

        if (this.data.TotalRecords == -1) {
          return;
        }
        this.totalRecords = this.data.TotalRecords;
        this.numberOfPages = Math.ceil(this.totalRecords / this.pageSize);
        this.isDataLoaded = false;
        this.reportData = [];
        var element = {};
        var isLocationChanged = false;

        let lt_locationName = "";

        for (var i = 0; i < this._data.Locations.length; i++) { // Locations Array
          lt_locationName = this._data.Locations[i].Location;

          for (var j = 0; j < this._data.Locations[i].Sources.length; j++) 
            {
            element = {};
            //element = angular.copy(this._data.Locations[i].Sources[j]);

            element['Location'] = this._data.Locations[i].Location;
            element['Rank'] = this._data.Locations[i].Sources[j].Rank;
            element['ReferralSource'] = this._data.Locations[i].Sources[j].ReferralSource;
            element['NumberReferred'] = this._data.Locations[i].Sources[j].NumberReferred;
            element['Productivity'] = this._data.Locations[i].Sources[j].Productivity;
            element['AverageProductivity'] = this._data.Locations[i].Sources[j].AverageProductivity;


            element['Class'] = j % 2 == 0 ? "stripOdd" : "stripOdd";
            if (j == 0) {
              element['IsReferralSourceHeader'] = true;
            } else {
              element['IsReferralSourceHeader'] = false;
            }
            element['IsReportTotals'] = false;
            this.reportData.push(element);

            for(var k=0; k<this._data.Locations[i].Sources[j].ReferredSources?.length; ++k)
              {
                element = {};
                //element = angular.copy(this._data.Locations[i].Sources[j].ReferredSources[k]);
                element['Class'] = k % 2 == 0 ? "stripEven" : "stripEven";
                element['Rank'] = this._data.Locations[i].Sources[j].ReferredSources[k].Rank;
                element['ReferralSourceName'] = this._data.Locations[i].Sources[j].ReferredSources[k].ReferralSourceName;
                element['NumberReferred'] = this._data.Locations[i].Sources[j].ReferredSources[k].NumberReferred;
                element['Productivity'] = this._data.Locations[i].Sources[j].ReferredSources[k].Productivity;
                element['AverageProductivity'] = this._data.Locations[i].Sources[j].ReferredSources[k].AverageProductivity;
                element['IsReferralSourceHeader'] = false;
                element['IsReportTotals'] = false;
                this.reportData.push(element);
              } // End of ReferredSourcesLoop
          } // End of Sources Loop
          element = {};
          element['Class'] = j % 2 == 0 ? "stripEven" : "stripEven";
          element['LocationName'] = lt_locationName;
          element['NumberReferredTotal'] = this._data.Locations[i].NumberReferred;
          element['ProductivityTotal'] = this._data.Locations[i].Productivity;
          element['AverageProductivityTotal'] = this._data.Locations[i].AverageProductivity;
          element['IsReportTotals'] = true;
          element['ShowTotals'] = this._data.Locations[i].ShowTotals;
          this.reportData.push(element);
        }

        element = {};
        element['Class'] = j % 2 == 0 ? "stripOdd" : "stripOdd";
        element['ReportTotalNumberReferred'] = this._data.NumberReferred;
        element['ReportTotalProductivity'] = this._data.Productivity;
        element['ReportTotalAverageProductivity'] = this._data.AverageProductivity;
        element['IsReportTotals'] = false;
        element['IsFinalReportTotals'] = true;
        this.reportData.push(element);
        this._data.totalRecords = this.reportData.length;
        this.isDataLoaded = true;
      }
    } else {
      this.numberOfPages = 0;
    }
    if (this.pageNumberClicked === true) {
      this.pageNumberClicked = false;
    } else {
      this.currentPageNumber = 1;
    }
  }
  ngOnChanges() {
    this.refreshData();
  }

  onPageChange(pageNumber) {
    this.currentPageNumber = pageNumber;
    this.pageNumberClicked = true;

    // Set the current page number in sessionStorage
    sessionStorage.setItem("fuse-reporting-page-number-" + this.data.ReportTitle, (this.currentPageNumber - 1).toString());

    // Trigger filter application
    let applyFilterBtn = document.getElementById('btnApplyFilters');
    if (applyFilterBtn) {
      applyFilterBtn.click();
    }
  }


  get pagesArray(): number[] {
    const halfPagesToShow = Math.floor(this.maxPagesToShow / 2);
    let start = Math.max(1, this.currentPageNumber - halfPagesToShow);
    let end = Math.min(this.numberOfPages, start + this.maxPagesToShow - 1);

    if (end > this.numberOfPages) {
      end = this.numberOfPages;
      start = Math.max(1, end - this.maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  showFirstEllipsis(): boolean {
    return this.pagesArray[0] > 2;
  }

  showLastEllipsis(): boolean {
    return this.pagesArray[this.pagesArray.length - 1] < this.numberOfPages - 1;
  }

  isFirstPage(): boolean {
    return this.currentPageNumber === 1;
  }

  isLastPage(): boolean {
    return this.currentPageNumber === this.numberOfPages;
  }

}
