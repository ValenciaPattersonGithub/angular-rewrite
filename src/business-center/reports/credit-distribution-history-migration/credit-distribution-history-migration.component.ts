import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'credit-distribution-history-migration',
  templateUrl: './credit-distribution-history-migration.component.html',
  styleUrls: ['./credit-distribution-history-migration.component.scss']
})
export class CreditDistributionHistoryMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = true;
  constructor() { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.creditDistributionHistoryReportDto && this.data.creditDistributionHistoryReportDto.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var subHeader = false;
      for (var i = 0; i < this.data.creditDistributionHistoryReportDto.length; i++) {
        element = {};
        element["TransactionTypeMain"] = this.data.creditDistributionHistoryReportDto[i].TransactionType;
        element["ResponsiblePartyMain"] = this.data.creditDistributionHistoryReportDto[i].ResponsibleParty;
        element["LocationMain"] = this.data.creditDistributionHistoryReportDto[i].Location;
        element["AmountMain"] = this.data.creditDistributionHistoryReportDto[i].Amount;
        element["DateMain"] = this.data.creditDistributionHistoryReportDto[i].Date;
        element["DescriptionMain"] = this.data.creditDistributionHistoryReportDto[i].Description;
        element["ImpactionMain"] = this.data.creditDistributionHistoryReportDto[i].Impaction;
        element["IsHeader"] = true;
        this.reportData.push(element);
        subHeader = true;

        for (var j = 0; j < this.data.creditDistributionHistoryReportDto[i].AppliedToTransactions.length; j++) {
          element = {}
          element = angular.copy(this.data.creditDistributionHistoryReportDto[i].AppliedToTransactions[j]);
          element["IsSubHeader"] = subHeader;
          element["IsData"] = true;
          element["ClassData"] = this.data.creditDistributionHistoryReportDto[i]
            .AppliedToTransactions[j].IsDeleted ? "modifiedData" : "tableData";
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          this.reportData.push(element);
          subHeader = false;
        }
         element = {};
       
         element['Total'] = this.data.creditDistributionHistoryReportDto[i].Total;
         element['IsFooter'] = true;
         this.reportData.push(element);
      }
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
  }

  ngOnChanges() {
    this.refreshData();
  }

}
