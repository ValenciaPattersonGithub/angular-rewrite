import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { groupBy, GroupDescriptor, GroupResult } from "@progress/kendo-data-query";
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

@Component({
  selector: 'patient-medical-alerts',
  templateUrl: './patient-medical-alerts.component.html',
  styleUrls: ['./patient-medical-alerts.component.scss']
})
export class PatientMedicalAlertsComponent implements OnInit, OnChanges {
  @Input() alerts;
  pageTitle: string;
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  access = { View: true };
  medicalHistoryAlerts = [];
  public gridData: GroupResult[];
  public groups: GroupDescriptor[] = [{ field: "MedicalHistoryAlertTypeId", dir: "asc" }];
  allergies: string;
  medical: string;
  other: string;
  fadeIn = false;
  fadeOut = false;
  saving = false;
  isRemiderEnabled = false; 

  constructor(
    @Inject('localize') private localize,
    @Inject('$location') private $location,
    @Inject('MedicalHistoryAlertsFactory') private medicalHistoryAlertsFactory,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('ListHelper') private listHelper,
    @Inject('MedicalHistoryAlertsService') private medicalHistoryAlertsService,
    private featureFlagService: FeatureFlagService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.alerts) {
      const nv = changes?.alerts.currentValue;
      if (nv) {
        this.medicalHistoryAlerts = nv;
        let orderPipe = new OrderByPipe();
        this.medicalHistoryAlerts = orderPipe.transform(this.medicalHistoryAlerts, { sortColumnName: 'Description', sortDirection: 1 });
        this.medicalHistoryAlertsFactory.SetActiveMedicalHistoryAlerts(this.medicalHistoryAlerts);
        this.gridData = groupBy(this.medicalHistoryAlerts, this.groups);
        this.orderByGroup(this.gridData);
      }
    }
  }

  orderByGroup = (grid: GroupResult[]) => {
    grid.sort((a, b) => {
      if (a.value > b.value) {
        return 1;
      } else if (a.value < b.value) {
        return -1;
      }
    });
    this.gridData = grid;
  }

  ngOnInit(): void {
    this.pageTitle = this.localize.getLocalizedString('Medical History Alerts');
    this.createBreadCrumb();
    this.getAccess();
    this.allergies = this.localize.getLocalizedString('Allergies');
    this.medical = this.localize.getLocalizedString('Medical');
    this.other = this.localize.getLocalizedString('Other');
    this.featureFlagService.getOnce$(FuseFlag.EnableClinicalMedHxV2Navigation).subscribe((value) => {
                this.isRemiderEnabled = value;
            });
  }

  createBreadCrumb = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.pageTitle,
        path: '/BusinessCenter/PatientAlerts/',
        title: 'Patient Alerts'
      }
    ];

  }

  getAccess = () => {
    this.access = this.medicalHistoryAlertsFactory.access();
    if (!this.access.View) {
      this.toastrFactory.error(this.patSecurityService.generateMessage('soar-biz-medalt-view'), 'Not Authorized');
      this.$location.path('/');
    }
  }

  // final closing function
  closeForm = () => {
    document.title = this.breadCrumbs[0].title;
  }

  // change url
  changePath = (breadcrumb) => {
    this.$location.url(breadcrumb.path);
    document.title = breadcrumb.title;
  };

  // filter out premedication alert
  filterByMedicalHistoryAlertTypeId = (alert) => {
    return alert.MedicalHistoryAlertTypeId;
  }

  setGenerateAlert = (medicalHistoryAlert) => {
    if (this.authEditAccess()) {
      if (this.saving == false) {
        this.saving = true;
        medicalHistoryAlert.GenerateAlert = !medicalHistoryAlert?.GenerateAlert;
        this.medicalHistoryAlertsService.update(medicalHistoryAlert)
          .$promise.then((res) => {
            let updatedMedicalHistoryAlert = res?.Value;
            // find in medicalHistoryAlerts and replace
            let index = this.listHelper.findIndexByFieldValue(this.medicalHistoryAlerts, 'MedicalHistoryAlertId', medicalHistoryAlert?.MedicalHistoryAlertId);
            // replace alertToUpdate in list
            if (index > -1) {
              this.medicalHistoryAlerts.splice(index, 1, updatedMedicalHistoryAlert);
              this.gridData = groupBy(this.medicalHistoryAlerts, this.groups);
              this.orderByGroup(this.gridData);
            }
            this.saving = false;
          });
      }
    }
  }

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-medalt-update');
  }

}
