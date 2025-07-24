import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { takeWhile } from 'rxjs/operators';
import { OrderByPipe } from '../../../@shared/pipes';
import { MassUpdateService } from '../mass-update.service';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { ServerlessSignalrHubConnectionService } from 'src/@shared/providers/serverless-signalr-hub-connection.service';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mass-update',
  templateUrl: './mass-update.component.html',
  styleUrls: ['./mass-update.component.scss'],
})
export class MassUpdateComponent implements OnInit {
  massUpdateFormGroup: FormGroup;
  massUpdate: any;
  //locations: Array<{ text: string, value: number, IsDisabled?: boolean }> = [];
  primaryLocations: Array<{
    text: string;
    value: number;
    IsDisabled?: boolean;
  }> = [];
  currentLocation: any;
  preferredHygienistProviderTypeIds: number[] = [1, 2, 3, 5];
  preferredDentistProviderTypeIds: number[] = [1, 5];
  selectedPrimaryLocations: any[] = [];
  selectedSecondaryLocations: any[] = [];
  selectedPrimaryLocIds: any[] = [];
  selectedSecondaryLocIds: any[] = [];
  primaryLocDisable: boolean = true;
  alive = true;
  isBatchRunning = false;
  headerMessage = '';
  locationId = 0;
  showInactiveProviders = true;
  selectedFromProvider = null;
  selectedToProvider = null;
  isProcessing = false;
  recentRecords = [];
  providerTypes = [1, 5];
  massUpdateId: any;
  type = '';
  currentBatchInfo: any;
  batchInfo: any;
  maxretry = 120;
  currentRetryCounter = 0;
  sub: Subscription;

  @ViewChild('resultsDiv', { static: false }) resultsDiv: ElementRef;
  donotIncudeInactivePatients = true;

  constructor(
    @Inject('localize') private localize,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('locationService') private locationService,
    @Inject('practiceService') private practiceService,
    @Inject('platformSessionCachingService')
    private platformSessionCachingService,
    @Inject('toastrFactory') private toastrFactory,
    private serverlessSignalrHubConnectionService: ServerlessSignalrHubConnectionService,
    private fb: FormBuilder,
    private massUpdateService: MassUpdateService
  ) {}

    ngOnInit(): void {
        this.loadRecentRecords();
        this.massUpdateService
            .massUpdateCheckForPendingBatch()
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
                this.isBatchRunning = Number(data['Value'].Count) > 0;
                if (this.isBatchRunning) {
                    this.isProcessing = true;
                    this.headerMessage = 'Previous batch is still running.';
                }
            });

        this.getLocations();
        this.initiateFormBuilder();

        this.serverlessSignalrHubConnectionService.init();
        this.sub = this.serverlessSignalrHubConnectionService
            .signalRObservable()
            .subscribe({
                next: messages => {
                    //This needs to reserached why it's coming as ApplicationProperties or applicationProperties
                    let appProperties = messages.ApplicationProperties;
                    if (messages.ApplicationProperties.MessageType == 'MassUpdateProviderCompleted') {
                        if (messages.ApplicationProperties.Status === '2') {
                            this.toastrFactory.success(
                                this.localize.getLocalizedString('Mass Patient Transfer Completed'),
                                this.localize.getLocalizedString('Success')
                            );
                            this.loadCurrentRunData();
                        }
                        else {
                            this.toastrFactory.error(
                                this.localize.getLocalizedString('Mass Patient Transfer Failed')
                            );
                        }
                    }
                    else if (messages.ApplicationProperties.MessageType == 'MassUpdateScheduleAppCompleted' || messages.ApplicationProperties.MessageType == 'MassUpdateUnscheduleAppCompleted') {
                        if (messages.ApplicationProperties.Status === '2') {
                            this.toastrFactory.success(
                                this.localize.getLocalizedString('Mass Appointment Transfer Completed'),
                                this.localize.getLocalizedString('Success')
                            );
                            this.loadCurrentRunData();
                        }
                        else {
                            this.toastrFactory.error(
                                this.localize.getLocalizedString('Mass Appointment Transfer Failed')
                            );
                        }

                    }
                    this.isProcessing = false;
                    this.isBatchRunning = false;
                }, error: error => { },
            });
    }

  loadRecentRecords() {
    this.massUpdateService
      .getRecentPatientMassUpdates()
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.recentRecords = data['Value'];
      });
  }

  getLocations = () => {
    const locations = this.referenceDataService.get(
      this.referenceDataService.entityNames.locations
    );
    if (locations) {
      this.locationServicesGetOnSuccess({ Value: locations });
    }
  };
  locationServicesGetOnSuccess = res => {
    const allLocations = res.Value;
    this.locationService.getCurrentPracticeLocations().then(userLocations => {
      this.filterLocations(allLocations, userLocations);
    });
  };

  filterLocationsByUserLocations = (allLocations, userLocations) => {
    const userLocationIds = userLocations.map(location => location.id);
    return allLocations.filter((location: any) => {
      return userLocationIds.indexOf(location.LocationId) !== -1;
    });
  };

  filterLocations = (allLocations, userLocations) => {
    const filteredLocations = this.filterLocationsByUserLocations(
      allLocations,
      userLocations
    );

    if (filteredLocations.length > 0) {
      filteredLocations.forEach((location: any) => {
        this.primaryLocations.push({
          text: location.NameLine1,
          value: location.LocationId,
        });
      });
      this.primaryLocations = this.applyOrderByPipe(this.primaryLocations);
    }
  };
  applyOrderByPipe = (list: any) => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(list, {
      sortColumnName: 'text',
      sortDirection: 1,
    });
  };

  getFormInfo() {
    var practiceId = this.practiceService.getCurrentPractice().id;
    var locationId = this.locationService.getCurrentLocation().id;
    const users = this.referenceDataService.get(
      this.referenceDataService.entityNames.users
    );
    const userContext = this.platformSessionCachingService.userContext.get();
    const toShortDisplayDateLocal = new ToShortDisplayDateUtcPipe();
    const toDisplayTime = new ToDisplayTimePipe();
    var date = new Date();
    this.massUpdate = {
      PrimaryLocations: [this.locationId],
      SecondaryLocations: this.selectedSecondaryLocIds,
      FromProvider: this.selectedFromProvider,
      ToProvider: this.selectedToProvider,
      ProviderType: this.massUpdateFormGroup.controls['radioOptions'].value,
      InActivePatient:
        this.massUpdateFormGroup.controls['chkInactivePatient'].value,
      ActivityArea: 1, // For Patient Transfer Module,
      PracticeId: practiceId,
      LocationId: locationId,
      UserId: userContext.Result.User.UserId,
      ModifiedDate: date.toDateString() + ' ' + toDisplayTime.transform(date),
    };
  }
  loadCurrentRunData() {
    this.massUpdateService
      .getMassUpdatePatientInfo(this.massUpdateId)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        var tmpbatchinfo = data['Value'];
        if (
          tmpbatchinfo &&
          tmpbatchinfo.MassUpdateId &&
          tmpbatchinfo.MassUpdateId != '00000000-0000-0000-0000-000000000000'
        ) {
          this.currentBatchInfo = data['Value'];
          this.loadRecentRecords();
          this.isProcessing = false;
          this.isBatchRunning = false;
          this.currentRetryCounter = 0;
        }
      });
  }
  RunMassUpdate() {
    if (this.selectedFromProvider != this.selectedToProvider) {
      if (!this.isBatchRunning) {
        this.isProcessing = true;
        this.primaryLocDisable = true;
        this.currentBatchInfo = null;
        this.scroll();
        this.maxretry = 120;

        this.getFormInfo();

        this.massUpdateService
          .runMassUpdate(this.massUpdate)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            data => {
              this.massUpdateId = data['Value'].MassUpdateId;
              this.isBatchRunning = true;
              this.reset();
              this.toastrFactory.success(
                this.localize.getLocalizedString(
                  'Mass Patient Transfer Started'
                ),
                this.localize.getLocalizedString('Success')
              );
            },
            exception => {
              this.reset();
              this.isBatchRunning = false;
              this.isProcessing = false;
              this.toastrFactory.error(
                this.localize.getLocalizedString(
                  exception.error.Value.FailedMessage
                ),
                this.localize.getLocalizedString('Validation Failed')
              );
            }
          );
      }
    } else {
      this.toastrFactory.error(
        this.localize.getLocalizedString(
          'From and To Provider cannot be same.'
        ),
        this.localize.getLocalizedString('Validation Failed')
      );
    }
  }
  reset() {
    this.providerTypes = [];
    this.providerTypes = [1, 5];
    this.locationId = 0;
    this.selectedFromProvider = '';
    this.selectedToProvider = '';
    this.donotIncudeInactivePatients = true;
    const checkbox = document.getElementById(
      'chkDonotIncudeInactivePatients'
    ) as HTMLInputElement;
    checkbox.checked = true;
    this.massUpdateFormGroup.controls['radioOptions'].patchValue('1');
    this.massUpdateFormGroup.controls['chkInactivePatient'].patchValue(true);
  }

  initiateFormBuilder() {
    this.massUpdateFormGroup = this.fb.group({
      primaryLocation: [],
      secondaryLocation: [],
      fromProvider: [null, Validators.required],
      toProvider: [null, Validators.required],
      radioOptions: ['1'],
      chkInactivePatient: [true],
    });
  }
  ngOnDestroy() {
      this.alive = false;
      this.sub.unsubscribe();
  }

  onLocationChange = (event: any) => {
    this.selectedFromProvider = null;
    this.selectedToProvider = null;
    this.locationId = 0;
    this.primaryLocDisable = true;
    if (event.target.value) {
      this.primaryLocDisable = false;
      this.locationId = event.target.value;
    }
  };
  onFromProviderChange = (event: any) => {
    this.selectedFromProvider = event;
  };
  onToProviderChange = (event: any) => {
    this.selectedToProvider = event;
  };
  changePatientType(event) {
    this.massUpdateFormGroup.controls['chkInactivePatient'].patchValue(
      event.target.checked
    );
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
                patient.PatientCode +
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
              'First Name,Last Name,Patient Code,Update On' +
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
  scroll() {
    //scrollIntoView is skipping the header
    window.scrollTo(0, this.resultsDiv.nativeElement.offsetTop);
  }
}
