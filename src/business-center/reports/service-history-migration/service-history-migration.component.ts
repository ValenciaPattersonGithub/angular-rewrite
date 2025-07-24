import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'service-history-migration',
  templateUrl: './service-history-migration.component.html',
  styleUrls: ['./service-history-migration.component.scss']
})
export class ServiceHistoryMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  constructor() { }

  ngOnInit(): void {
  }

  refreshData() {
      if (this.data) {
          this.isDataLoaded = true;
          this.reportData = this.data;
      }
  }

  ngOnChanges() {
      this.refreshData();
  }

}
