import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'referral-affiliates-referral-out-migration',
  templateUrl: './referral-affiliates-referral-out-migration.component.html',
  styleUrls: ['./referral-affiliates-referral-out-migration.component.scss']
})
export class ReferralAffiliatesReferralOutMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  _data: any;
  reportView: string = "summary";
  totalRecords: number = 0;
  pageSize: number = 15;
  currentPageNumber: number = 1;

  numberOfPages: number = 0;
  pagesArray: number[];
  pageNumberClicked: boolean = false;
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  constructor() { }

    ngOnInit(): void {
  }
  refreshData() {
    //debugger;


    if (this.data && ((this.data.ReferralAffiliatesSummary
      && this.data.ReferralAffiliatesSummary.length > 0) ||
      (this.data.ReferralAffiliates
        && this.data.ReferralAffiliates.length > 0))) {

      if (this.data.ReferralAffiliatesSummary != null && this.data.ReferralAffiliatesSummary.length > 0) {
        this.reportView = "summary";
      } else if (this.data.ReferralAffiliates != null && this.data.ReferralAffiliates.length > 0) {
        this.reportView = "detailed";
      }

      if (this.reportView == "detailed") {
        this._data = this.data.ReferralAffiliates;

        if (this.data.TotalRecords == -1) {
          return;
        }

        this.totalRecords = this.data.TotalRecords;
        this.numberOfPages = Math.ceil(this.totalRecords / this.pageSize);
        this.pagesArray = Array(this.numberOfPages).fill(0).map((x, i) => i + 1);

        this.isDataLoaded = false;
        this.reportData = [];
        var element = {};

        for (var i = 0; i < this._data.length; i++) {
          element = {};
          element = angular.copy(this._data[i]);
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          element['ExternalProvider'] = (element['PracticeName'] == null ? '' : element['PracticeName']) + 
            ((element['ExternalProvider'] == ' ' || element['PracticeName'] == null) ? '' : ' - ') + 
            (element['ExternalProvider'] == ' ' ? '' : element['ExternalProvider']);
          this.reportData.push(element);
        }

        //this._data.totalRecords = this.reportData.length;
        this.isDataLoaded = true;
      }
      else if (this.reportView == "summary") {
        this._data = this.data.ReferralAffiliatesSummary;

        if (this.data.TotalRecords == -1) {
          return;
        }
        this.totalRecords = this.data.TotalRecords;
        this.numberOfPages = Math.ceil(this.totalRecords / this.pageSize);
        this.pagesArray = Array(this.numberOfPages).fill(0).map((x, i) => i + 1);

        this.isDataLoaded = false;
        this.reportData = [];
        var element = {};

        for (var i = 0; i < this._data.length; i++) {
          element = {};
          element = angular.copy(this._data[i]);
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          element['ExternalProvider'] = (element['PracticeName'] == null ? '' : element['PracticeName']) + ((element['ExternalProvider'] == ' ' || element['PracticeName'] == null) ? '' : ' - ') + (element['ExternalProvider'] == ' ' ? '' : element['ExternalProvider']);
          
          this.reportData.push(element);
        }

        //this._data.totalRecords = this.reportData.length;
        this.isDataLoaded = true;
      }
    } else {
      this.numberOfPages = 0;
      this.pagesArray = [];
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

    sessionStorage.setItem("fuse-reporting-page-number-" + this.data.ReportTitle, (this.currentPageNumber - 1).toString());
    let applyFilterBtn = document.getElementById('btnApplyFilters');
      if (applyFilterBtn && applyFilterBtn.hasAttribute('disabled')) {
          applyFilterBtn.removeAttribute('disabled');
          applyFilterBtn.click();
          applyFilterBtn.setAttribute('disabled', '');
      }
      else
          applyFilterBtn.click();

    sessionStorage.setItem("fuse-reporting-page-number-" + this.data.ReportTitle, '0');
  }
}
