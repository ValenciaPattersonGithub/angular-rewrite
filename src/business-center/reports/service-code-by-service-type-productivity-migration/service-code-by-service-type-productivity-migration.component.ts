import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'service-code-by-service-type-productivity-migration',
  templateUrl: './service-code-by-service-type-productivity-migration.component.html',
  styleUrls: ['./service-code-by-service-type-productivity-migration.component.scss']
})
export class ServiceCodeByServiceTypeProductivityMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  showProdtoolTip: boolean = false;
  showAveragetoolTip: boolean = false;
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

    showMessage(message) {
        if (message == 'Production')
            this.showProdtoolTip = true;
        else if (message == 'Average')
            this.showAveragetoolTip = true;
        else { this.showAveragetoolTip = false; this.showProdtoolTip = false; }
    }


}
