import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'referred-patient-migration',
  templateUrl: './referred-patient-migration.component.html',
  styleUrls: ['./referred-patient-migration.component.scss']
})
export class ReferredPatientsBetaMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  totalRecords: number = 0;
  pageSize: number = 15;
  currentPageNumber: number = 1;
  maxPagesToShow: number = 10;
  numberOfPages: number = 0;
  pageNumberClicked: boolean = false;

  constructor() {

  }

  ngOnInit(): void {
  }

  refreshData() {
    if (this.data && this.data.ReferralTypes && this.data.ReferralTypes.length > 0) {
      if (this.data.TotalRecords == -1) {
        return;
      }
      this.totalRecords = this.data.TotalRecords;
      this.numberOfPages = Math.ceil(this.totalRecords / this.pageSize);
      this.isDataLoaded = false;
      this.reportData = [];

      var element = {};
      
      for (var i = 0; i < this.data.ReferralTypes.length; i++) {
        for (var j = 0; j < this.data.ReferralTypes[i].ReferralSources.length; j++) {
          for (var k = 0; k < this.data.ReferralTypes[i].ReferralSources[j].Patients.length; k++) {
            element = angular.copy(this.data.ReferralTypes[i].ReferralSources[j].Patients[k]);
            element['IsFooter'] = false;
            element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
            if (j == 0 && k == 0) {
              element['ReferralType'] = this.data.ReferralTypes[i].ReferralCategories;
              element['IsReferralTypeHeader'] = true;
            }
            if (k == 0) {
              element['ReferralSource'] = this.data.ReferralTypes[i].ReferralSources[j].ReferringFrom;
              element['IsReferralSourceHeader'] = true;
            }
            this.reportData.push(element);
          }
          element = {};
          element['IsFooter'] = true;
          element['ShowPatientTotal'] = this.data.ReferralTypes[i].ReferralSources[j].ShowTotals;
          element['TotalReferral'] = this.data.ReferralTypes[i].ReferralSources[j].TotalReferrals;
          element['PatientFooterReferralSource'] = this.data.ReferralTypes[i].ReferralSources[j].ReferringFrom;
          this.reportData.push(element);
        }
        element = {};
        element['IsFooter'] = false;
        element['IsCategoryFooter'] = this.data.ReferralTypes[i].ShowTotals;
        element['ShowCategoryTotal'] = this.data.ReferralTypes[i].ShowTotals;
        element['TotalCategoryReferral'] = this.data.ReferralTypes[i].TotalReferrals;
        element['FooterReferralType'] = this.data.ReferralTypes[i].ReferralCategories;
        this.reportData.push(element);
      }

      element = {};
      element['IsFinalReportTotals'] = true;
      this.reportData.push(element);

      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
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
      if(applyFilterBtn && applyFilterBtn.hasAttribute('disabled')) {
          applyFilterBtn.removeAttribute('disabled');
          applyFilterBtn.click();
          applyFilterBtn.setAttribute('disabled', '');
      }
      else
          applyFilterBtn.click();
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
