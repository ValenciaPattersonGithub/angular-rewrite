import { Component, OnInit, Inject, Input, Sanitizer, SecurityContext } from '@angular/core';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { TranslateService } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { CommunicationEvent } from 'src/patient/common/models/enums';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';
import { DatePipe } from '@angular/common';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
@Component({
  selector: 'drawer-appointment-cards',
  templateUrl: './drawer-appointment-cards.component.html',
  styleUrls: ['./drawer-appointment-cards.component.scss'],
})
export class DrawerAppointmentCardsComponent implements OnInit {
  appointments: any[];
  accountValidation: any;
  isAuthorize: any = true;
  temporaryAppointment: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  useNewEncounterCheckout = false;
  appointmentToDelete: any;
  isLoading: any = true;
  @Input() featureName: any;
  @Input() patientProfile: any;

  constructor(
    @Inject('$routeParams') private route,
    private patientService: PatientHttpService,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    @Inject('TimeZoneFactory') private timeZoneFactory,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    @Inject('ModalDataFactory') private modalDataFactory,
    @Inject('ModalFactory') private modalFactory,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('ListHelper') private listHelper,
    private appointmentStatusService: AppointmentStatusHandlingService,
    @Inject('tabLauncher') private tabLauncher,
    @Inject('locationService') private locationService,
    @Inject('ScheduleServices') private scheduleServices,
    @Inject('AppointmentViewVisibleService')
    private appointmentViewVisibleService,
    @Inject('AppointmentViewDataLoadingService')
    private appointmentViewDataLoadingService,
    public datepipe: DatePipe,
    private featureFlagService: FeatureFlagService,
    private sanitizer: Sanitizer
  ) {}

    showScheduleV2 = false;

  ngOnInit() {
    this.patientCommunicationCenterService
      .getCommunicationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: CommunicationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case CommunicationEvent.AddAppointment:
              this.addAppointment();
              break;
            case CommunicationEvent.GetAppointments:
              this.getAppointments();
              break;
          }
        }
      });
    this.appointments = [];
      this.getAppointments();

      this.featureFlagService.getOnce$(FuseFlag.ShowScheduleV2).subscribe((value) => {
          this.showScheduleV2 = value;
      });
    }

  getAppointmentsByPatientIdSuccess = (res: any) => {
    if (res.length) {
      if (this.featureName === 'PatientProfile') {
        const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        const nextAppointments = res.filter(
          (x: any) => this.datepipe.transform(x.StartTime, 'yyyy-MM-dd') >= date
        );
        nextAppointments.forEach((appointment: any) => {
          this.timeZoneFactory.ConvertAppointmentDatesTZ(
            appointment,
            appointment.Location.Timezone
          );
        });
        if (nextAppointments.length && nextAppointments[0].StartTime) {
          this.appointments = new Array(nextAppointments[0]);
        }
      } else {
        res.forEach((appointment: any) => {
          this.timeZoneFactory.ConvertAppointmentDatesTZ(
            appointment,
            appointment.Location.Timezone
          );
        });
        this.appointments = res;
      }
    }
    this.isLoading = false;
  };
  getAppointmentsByPatientIdFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to retrieve the appointments.'),
      this.translate.instant('Server Error')
    );
  };
  getAppointmentModalDataSuccess = (appointmentEditData: any) => {
    this.appointmentViewVisibleService.changeAppointmentViewVisible(
      true,
      false
    );
  };
  getAppointmentModalDataFailed = () => {
    this.toastrFactory.error(
      this.translate.instant('Ran into a problem loading the appointment'),
      this.translate.instant('Error')
    );
  };
  onAppCardSelection = (appointment: any) => {
    if (appointment) {
      this.accountValidation =
        this.patientValidationFactory.GetAllAccountValidation();
      this.checkAuthorizedForPatientLocation(appointment);
        if (this.isAuthorize) {
            if (this.showScheduleV2) {
                // The definition of the object can be seen here: 
                // https://dev.azure.com/pdco-fuse/Fuse/_git/WRK.PDCO.Fuse.Angular?path=/fuse/libs/schedule/domain-types/src/lib/appointment/appointment-edit-model.ts
                const appointmentData = {
                    publicRecordId: appointment.AppointmentId
                }
                const params = new URLSearchParams(appointmentData).toString()
                const path = `#/schedule/v2/appointment?${params}`
                window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
                return;
            }
        this.appointmentViewDataLoadingService
          .getViewData(appointment, false, 'communication-center')
          .then(
            this.getAppointmentModalDataSuccess,
            this.getAppointmentModalDataFailed
          );
      } else {
        appointment.profile = appointment.Patient;
        appointment.authorization = appointment.$$account;
        this.patientValidationFactory.LaunchPatientLocationErrorModal(
          appointment
        );
        return;
      }
    }
  };
  checkAuthorizedForPatientLocation = (appointment: any) => {
    appointment.$$authorized = true;
    const account = this.listHelper.findItemByFieldValue(
      this.accountValidation,
      'PatientId',
      appointment.PersonId
    );
    appointment.$$account = account;
    if (account && !account.UserIsAuthorizedToAtLeastOnePatientLocation) {
      this.isAuthorize = false;
    }
  };
  appointmentSaved = () => {
    this.getAppointments();
  };
  getAppointments = () => {
    this.patientService
      .getAppointmentsByPatientId(
        this.patientProfile
          ? this.patientProfile.PatientId
          : this.route.patientId,
        false
      )
      .subscribe(
        (data: any) => this.getAppointmentsByPatientIdSuccess(data),
        error => this.getAppointmentsByPatientIdFailure()
      );
  };
  addAppointment = () => {
    this.appointmentInitialize();
      if (this.showScheduleV2) {
          // The definition of the object can be seen here: 
          // https://dev.azure.com/pdco-fuse/Fuse/_git/WRK.PDCO.Fuse.Angular?path=/fuse/libs/schedule/domain-types/src/lib/appointment/appointment-edit-model.ts
          const appointmentData = {
              patientId: this.patientProfile
                  ? this.patientProfile.PatientId
                  : this.route.patientId,
              locationId: this.patientCommunicationCenterService.patientDetail.Profile
                  .PreferredLocation
          }
          const params = new URLSearchParams(appointmentData).toString()
          const path = `#/schedule/v2/appointment?${params}`
          window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
          return;
      }
    this.appointmentViewDataLoadingService
      .getViewData(this.temporaryAppointment, false, 'communication-center')
      .then(
        this.getAppointmentModalDataSuccess,
        this.getAppointmentModalDataFailed
      );
  };
  appointmentInitialize = () => {
    this.temporaryAppointment = {
      AppointmentId: null,
      AppointmentTypeId: null,
      Classification: 2,
      EndTime: null,
      PersonId: this.patientProfile
        ? this.patientProfile.PatientId
        : this.route.patientId,
      PlannedServices: [],
      ProposedDuration: 15,
      ProviderAppointments: [],
      ServiceCodes: [],
      StartTime: null,
      TreatmentRoomId: null,
      UserId: null,
      WasDragged: false,
      Location: {
        LocationId:
          this.patientCommunicationCenterService.patientDetail.Profile
            .PreferredLocation,
      },
      LocationId:
        this.patientCommunicationCenterService.patientDetail.Profile
          .PreferredLocation,
      ObjectState: 'Add',
      Person: {},
    };
  };
  onUpdateAppointmentStatus = (appointment: any) => {
    const appointmentStatus =
      this.appointmentStatusService.appointmentStatusEnum;
    const appointmentToUpdate = {
      appointmentId: appointment.AppointmentId,
      DataTag: appointment.DataTag,
      NewAppointmentStatusId: appointment.Status,
      StartAppointment: false,
      LocationId: appointment.LocationId,
      PersonId: appointment.PersonId,
    };

    if (appointment.Status === appointmentStatus.StartAppointment) {
      appointmentToUpdate.NewAppointmentStatusId =
        appointmentStatus.InTreatment;
      appointmentToUpdate.StartAppointment = true;
      this.handleStartAppointmentStatus(appointmentToUpdate);
      return;
    } else if (appointment.Status === appointmentStatus.Unschedule) {
      this.handleUnscheduleStatus(appointment);
      return;
    } else if (appointment.Status === appointmentStatus.CheckOut) {
      const loggedInLocation = this.locationService.getCurrentLocation();
      if (loggedInLocation.id !== appointment.LocationId) {
        this.showChangeLocationPromptModal(appointment);
        return;
      } else {
        this.handleCheckoutStatus(appointment);
      }
    } else if (
      appointment.Status === appointmentStatus.Unconfirmed &&
      !appointment.StartTime
    ) {
      this.handleScheduleStatus(appointment);
      return;
    }
    this.updateAppointmentStatus(appointmentToUpdate, false);
  };
  updateAppointmentStatus = (
    appointmentToUpdate: any,
    supressToasterMessage: boolean
  ) => {
    this.patientService.updateAppointmentStatus(appointmentToUpdate).subscribe(
      (response: any) =>
        this.updateAppointmentStatusSuccess(supressToasterMessage),
      error => this.updateAppointmentStatusFailure()
    );
  };
  updateAppointmentStatusSuccess = (supressToasterMessage: boolean) => {
    if (!supressToasterMessage) {
      this.toastrFactory.success(
        this.translate.instant('Appointment status updated successfully.'),
        this.translate.get('Success')
      );
    }
    this.getAppointments();
  };
  updateAppointmentStatusFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to update the appointment status.'),
      this.translate.instant('Server Error')
    );
  };
  handleStartAppointmentStatus = (appointment: any) => {
    const loggedInLocation = this.locationService.getCurrentLocation();
    if (loggedInLocation.id === appointment.LocationId) {
      this.launchClinicalTab(true, appointment);
    } else {
      this.modalFactory
        .LocationChangeForStartAppointmentModal()
        .then(
          () => this.launchClinicalTab(true, appointment),
          this.startAppointmentModalFailure()
        );
    }
  };
  launchClinicalTab = (overrideLocation: boolean, appointment: any) => {
    const queryString = `activeSubTab=0${
      overrideLocation === true ? `&setLocation=${appointment.LocationId}` : ''
    } `;
    const patientPath = '#/Patient/';
    const PreviousLocationRoute = `${patientPath}${appointment.PersonId}/Clinical/?${queryString}`;
    this.tabLauncher.launchNewTab(PreviousLocationRoute);
    this.updateAppointmentStatus(appointment, true);
  };
  startAppointmentModalFailure = () => {
    this.toastrFactory.error(
      this.translate.instant(
        'Failed to begin appointment. Please try again.',
        'Error'
      )
    );
    this.getAppointments();
  };
  handleUnscheduleStatus = (appointmentToUnschedule: any) => {
    this.modalFactory
      .AppointmentStatusModal({
        id: 'Reschedule',
        title: 'Reschedule this Appointment',
        appointment: appointmentToUnschedule,
        reason: {
          id: 'RescheduleReason',
          labels: ['Cancellation', 'Missed', 'Other'],
          options: [0, 1, 2],
        },
        onChange: this.onChange,
        beforeDelete: this.beforeDelete,
        hasStatusNote: true,
        showDeleteCheckbox: false,
        ShowAppointmentInfo: true,
        ShowReason: true,
      })
      .then(this.appointmentRescheduled, this.cancelAction);
  };
  onChange = () => {};
  beforeDelete = () => {};
  appointmentRescheduled = () => {
    this.getAppointments();
  };

  cancelAction = () => {
    this.getAppointments();
  };
  showChangeLocationPromptModal = (appointment: any) => {
    const locations: any[] = JSON.parse(
      sessionStorage.getItem('activeLocations')
    );
    let appointmentLocation: any;
    if (locations.length) {
      appointmentLocation = locations.filter(
        x => x.id === appointment.LocationId
      )[0];
    }
    const title = this.translate.instant('Checkout Location');
    let message = `Your current location must be set to ${appointmentLocation.name} to checkout this appointment.`;
    message +=
      'If you want to continue to checkout and associate the encounter with your current location,';
    message += 'you must first update the appointment location.';
    const okText = this.translate.instant('OK');

    this.modalFactory.ConfirmModal(title, message, okText).then(() => {
      this.getAppointments();
    });
  };
  handleCheckoutStatus = (appointment: any) => {
    if (
      appointment.PlannedServices &&
      appointment.PlannedServices.length <= 0
    ) {
      this.scheduleServices.Lists.Appointments.GetEncounterIdForAppointment(
        { AppointmentId: appointment.AppointmentId },
        (res: any) => {
          if (res && res.Value) {
            if (res.Value.IsCompleted === true) {
              this.showAppointmentCheckedOutMessage(appointment);
            } else {
              this.launchCheckOutTab(res.Value.EncounterId, appointment);
            }
          }
        },
        () => {
          this.toastrFactory.error(
            this.translate.instant(
              'Failed to retrieve encounter for appointment. Please try again.'
            ),
            'Error'
          );
        }
      );
    } else {
      let encounterId = null;
      if (
        appointment.PlannedServices &&
        typeof appointment.PlannedServices[0].EncounterId === 'string'
      ) {
        encounterId = appointment.PlannedServices[0].EncounterId;
      }
      this.launchCheckOutTab(encounterId, appointment);
    }
  };
  launchCheckOutTab = (encounterId: any, appointment: any) => {
    let path = '';
    const patientProfile =
      this.patientCommunicationCenterService.patientDetail.Profile;
    const patientPath = '#/Patient/';

    if (encounterId && appointment.PlannedServices) {
      if (
        appointment.Patient != null &&
        patientProfile &&
        patientProfile.PersonAccountId
      ) {
        path =
          patientPath +
          appointment.Patient.PatientId +
          '/Account/' +
          patientProfile.PersonAccountId +
          '/Encounter/' +
          encounterId +
          '/Checkout/EncountersCartAccountSummary';
      }
    } else {
      path =
        patientPath +
        appointment.Patient.PatientId +
        '/Account/' +
        patientProfile.PersonAccountId +
        '/EncountersCart/Schedule?';
      path += 'appt=' + appointment.AppointmentId;
    }
    if (path) {
      this.tabLauncher.launchNewTab(path);
    }
  };
  showAppointmentCheckedOutMessage = (appointment: any) => {
    const title = this.translate.instant('Appointment Checked Out');
    const message = this.translate.instant(
      'This appointment has already been checked out.'
    );
    const okText = this.translate.instant('OK');
    const appointmentStatus =
      this.appointmentStatusService.appointmentStatusEnum;
    this.modalFactory.ConfirmModal(title, message, okText).then(() => {
      const appointmentToUpdate = {
        appointmentId: appointment.AppointmentId,
        DataTag: appointment.DataTag,
        NewAppointmentStatusId: appointmentStatus.Completed,
      };
      this.updateAppointmentStatus(appointmentToUpdate, true);
    });
  };
  handleScheduleStatus = (appointment: any) => {
    this.patientService.flagForScheduling(appointment).subscribe(
      () => this.updateScheduleStatusSuccess(),
      error => this.updateScheduleStatusFailure()
    );
  };
  updateScheduleStatusSuccess = () => {
    this.toastrFactory.success(
      this.translate.instant('Appointment updated successfully.'),
      'Success'
    );
    const path = '#/Schedule/?showClipboard=true';
    this.tabLauncher.launchNewTab(path);
  };
  updateScheduleStatusFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to update status of Appointment.'),
      'Error'
    );
  };
  onDeleteAppointment = (event: any, appointment: any) => {
    this.appointmentToDelete = appointment;
    this.modalFactory
      .AppointmentDeleteModal(
        appointment.Classification,
        true,
        'Are you sure you want to remove this unscheduled appointment?'
      )
      .then(this.confirmDelete, this.cancelDelete);
    event.stopPropagation();
  };
  confirmDelete = () => {
    if (this.appointmentToDelete) {
      this.scheduleServices.Dtos.Appointment.Operations.Delete(
        { AppointmentId: this.appointmentToDelete.AppointmentId },
        this.appointmentDeleteOnSuccess,
        this.appointmentDeleteOnError
      );
    }
  };
  cancelDelete = () => {};
  appointmentDeleteOnSuccess = () => {
    this.appointments = this.appointments.filter(
      x => x.AppointmentId !== this.appointmentToDelete.AppointmentId
    );
    this.toastrFactory.success(
      this.translate.instant('Successfully deleted the appointment'),
      'Success'
    );
    this.getAppointments();
    this.appointmentToDelete = null;
  };
  appointmentDeleteOnError = () => {
    this.toastrFactory.error(
      this.translate.instant(
        'Failed to delete the appointment. Please try again.'
      ),
      'Error'
    );
    this.appointmentToDelete = null;
  };
}
