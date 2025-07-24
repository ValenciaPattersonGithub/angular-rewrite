import { Component, OnInit, Input } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'net-collection-by-provider-migration',
  templateUrl: './collection-by-provider-migration.component.html',
  styleUrls: ['./collection-by-provider-migration.component.scss']
})
export class NetCollectionByProviderMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  constructor() {}

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Providers && this.data.Providers.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.Providers.length; i++) {
        for (var j = 0; j < this.data.Providers[i].Transactions.length; j++) {
          element = angular.copy(this.data.Providers[i].Transactions[j]);
          element['IsFooter'] = false;
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          if (j == 0)
             element['Provider'] = this.data.Providers[i].Provider;
             element['IsHeader'] = true;
            this.reportData.push(element);
        }
        element = {};
        element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";        
        element['TotalCollection'] = this.data.Providers[i].Collection;
        element['TotalAdjustments'] = this.data.Providers[i].Adjustments;
        element['TotalNetCollection'] = this.data.Providers[i].NetCollection;
        element['Provider'] = this.data.Providers[i].Provider;
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
