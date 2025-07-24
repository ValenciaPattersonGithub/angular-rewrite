import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, takeWhile } from 'rxjs/operators';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { MassUpdateService } from '../mass-update.service';
import * as moment from 'moment-timezone';
declare var angular: any;

@Component({
  selector: 'mass-update-results',
  templateUrl: './mass-update-results.component.html',
  styleUrls: ['./mass-update-results.component.scss'],
})
export class MassUpdateResultsComponent implements OnInit {
  location: string;
  fromProvider: string;
  toProvider: string;
  providerType: string;
  alive = true;
  batchInfo;
  currentBatchInfo;
  @Input() massUpdateId: any;
  @Input() isProcessing = false;
  @Input() type = '';
  @Input() recentRecords = [];

  constructor(
    private massUpdateService: MassUpdateService,
    @Inject('localize') private localize
  ) {
    // this.massUpdateId = window.location.href.split('?id=')[1];
  }
  ngOnInit(): void {
    // this.loadData();
  }
  ngOnChanges(changes: any) {
    if (
      changes.massUpdateId &&
      !changes.massUpdateId.firstChange &&
      changes.massUpdateId.currentValue
    ) {
      this.loadData();
    }
  }
  loadData() {
    this.massUpdateService
      .getMassUpdatePatientInfo(this.massUpdateId)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.currentBatchInfo = data['Value'];
        this.recentRecords.splice(0, 0, this.currentBatchInfo);
        this.isProcessing = false;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  close() {
    window.location.href = '#/BusinessCenter/MassUpdate';
  }
  export(type, massUpdateId) {
    this.massUpdateService
      .getMassUpdatePatientInfo(massUpdateId)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.batchInfo = data['Value'];

        if (this.batchInfo) {
          const toShortDisplayDateLocal = new ToShortDisplayDateUtcPipe();
          var headerText =
            'Location: ' +
            this.batchInfo.LocationString +
            ' | From: ' +
            this.batchInfo.FromProvider +
            ' | To: ' +
            this.batchInfo.ToProvider +
            ' | Provider Type: ' +
            this.batchInfo.ProviderType +
            ' | Inactive Patients: ' +
            this.batchInfo.InActivePatient.toString() +
            '\r\n';
          var patientsString = '';
          for (const patient of this.batchInfo.PatientInfo) {
            if (patient.Status == type)
              patientsString +=
                patient.FirstName +
                ',' +
                patient.LastName +
                ',' +
                toShortDisplayDateLocal.transform(patient.DateCreated) +
                ' ' +
                moment.utc(patient.DateCreated).local().format('h:mm a') +
                '\r\n';
          }
          if (patientsString.length > 0) {
            var fileName =
              'massUpdatesResult ' + (type == 2 ? 'success ' : 'failed ');
            let csvArray =
              headerText +
              '\r\n' +
              'First Name,Last Name,Update On' +
              '\r\n' +
              patientsString;
            var blob = new Blob([csvArray], {
              type: 'text/csv;charset=utf-8;',
            });
            if (window.navigator.msSaveOrOpenBlob) {
              navigator.msSaveBlob(blob, fileName + ' ' + new Date() + '.csv');
            } else {
              const filename = fileName + ' ' + new Date() + '.csv';
              const element = document.createElement('a');
              element.setAttribute('href', window.URL.createObjectURL(blob));
              element.setAttribute('download', filename);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }
          }
        }
      });
  }
}
