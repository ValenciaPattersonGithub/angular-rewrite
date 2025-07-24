import { Component, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'netproduction-by-provider-migration',
  templateUrl: './production-by-provider-migration.component.html',
  styleUrls: ['./production-by-provider-migration.component.scss']
})
export class NetproductionByProviderMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
    constructor(private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer) {
        this.matIconRegistry.addSvgIcon(
            'assignment',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                '../v1.0/images/assignment.svg'
            )
        );
    }

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
        element['TotalProduction'] = this.data.Providers[i].Production;
        element['TotalAdjustment'] = this.data.Providers[i].Adjustments;
        element['TotalNetProduction'] = this.data.Providers[i].NetProduction;
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
