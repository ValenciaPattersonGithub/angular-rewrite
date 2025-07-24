import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'adjustments-by-provider-migration',
  templateUrl: './adjustments-by-provider-migration.component.html',
  styleUrls: ['./adjustments-by-provider-migration.component.scss']
})
export class AdjustmentsByProviderMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  constructor() {}

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.ProviderDetails && this.data.ProviderDetails.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.ProviderDetails.length; i++) {
        for (var j = 0; j < this.data.ProviderDetails[i].Transactions.length; j++) {
          element = angular.copy(this.data.ProviderDetails[i].Transactions[j]);
          element['IsFooter'] = false;
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          if (j == 0)
             element['Provider'] = this.data.ProviderDetails[i].Provider;
            this.reportData.push(element);
        }
        element = {};
        element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";        
         element['TotalAmount'] = this.data.ProviderDetails[i].Amount;
        element['Provider'] = this.data.ProviderDetails[i].Provider;
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
