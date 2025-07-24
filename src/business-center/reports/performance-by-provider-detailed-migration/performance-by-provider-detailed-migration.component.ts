import { Component, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'performance-by-provider-detailed-migration',
  templateUrl: './performance-by-provider-detailed-migration.component.html',
  styleUrls: ['./performance-by-provider-detailed-migration.component.scss']
})
export class PerformanceByProviderDetailedMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  // constructor() {
  //  }

   constructor(
    private matIconRegistry: MatIconRegistry,
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
        element['TotalProduction'] = this.data.ProviderDetails[i].Production;
        element['TotalCollection'] = this.data.ProviderDetails[i].Collection;
        element['TotalAdjustments'] = this.data.ProviderDetails[i].Adjustments;
        element['Provider'] = this.data.ProviderDetails[i].Provider;
        element['IsFooter'] = true;
        this.reportData.push(element);
          
      }
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
  }
  ngOnChanges(changes: any) {
    this.refreshData();
   }

}
