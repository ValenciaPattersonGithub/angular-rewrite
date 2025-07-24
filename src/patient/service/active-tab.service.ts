import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IGridHelper, IGridNumericHelper, IPrintMailingHelper } from './grid-helper.service';
import { BadgeAccessType, BadgeFilterType, PatientLocation, PatientLocationType } from 'src/patient/common/models/patient-location.model';
import { LocationTimeService } from 'src/practices/common/providers';
import { AppointmentsColumnsFields, CommonColumnsFields, LocationHash, MailingLabel, OtherToDoColumnsFields } from 'src/patient/common/models/enums/patient.enum';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { CurrencyPipe } from '@angular/common';
import { PatientContactInfo } from '../common/models/patient-contact-info.model';
import moment from 'moment';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { PatientMailingInfo } from 'src/@shared/models/send-mailing.model';
import { AllPatient, OtherToDo, PreventiveCare, TreatmentPlans } from '../common/models/patient-grid-response.model';
import { AppointmentRequest } from '../common/models/patient-grid-request.model';
import { AllPatientGridSort, AppointmentGridSort, OtherToDoGridSort, PreventiveGridSort, TreatmentGridSort } from '../common/models/patient-grid-sort.model';

@Injectable({
  providedIn: 'root'
})
export class ActiveTabService <T extends IGridHelper & IGridNumericHelper & IPrintMailingHelper>{
  
  commonColumnWidth = 100;
  lastApptColumnWidth = 90;
  nameColumnWidth = 150;
  scheduleColumnWidth = 80;
  dobColumnWidth = 85;
  activeGrid: T;
  
  constructor( private translate: TranslateService,
    private locationTimeService: LocationTimeService,
    @Inject('patSecurityService') private patSecurityService,
    private currencyPipe: CurrencyPipe) { 
  }
  
  allPatientColumns = [
    { field: 'name', title: this.translate.instant('Name'), type: 'text', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'dob', title: this.translate.instant('Date of Birth'), type: 'date', sortable: true, filterable: true, width: this.dobColumnWidth },
    { field: 'responsibleParty', title: this.translate.instant('Responsible Party'), type: 'text', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastAppt', title: this.translate.instant('Last Appt'), type: 'date', sortable: true, filterable: true, width: this.lastApptColumnWidth },
    { field: 'nextAppt', title: this.translate.instant('Next Appt'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'preventiveCare', title: this.translate.instant('Preventive Care Due Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'treatmentPlans', title: this.translate.instant('Treatment Plans'), type: 'numeric', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastCommunication', title: this.translate.instant('Last Communication'), type: 'date', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'schedule', title: this.translate.instant('Schedule'), sortable: false, filterable: false, width: this.scheduleColumnWidth }
  ];

  preventiveColumns = [
    { field: 'name', title: this.translate.instant('Name'), type: 'text', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'dob', title: this.translate.instant('Date of Birth'), type: 'date', sortable: true, filterable: true, width: this.dobColumnWidth },
    { field: 'responsibleParty', title: this.translate.instant('Responsible Party'), type: 'text', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastAppt', title: this.translate.instant('Last Appt'), type: 'date', sortable: true, filterable: true, width: this.lastApptColumnWidth },
    { field: 'nextAppt', title: this.translate.instant('Next Appt'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'preventiveCare', title: this.translate.instant('Preventive Care Due Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'treatmentPlans', title: this.translate.instant('Treatment Plans'), type: 'numeric', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastCommunication', title: this.translate.instant('Last Communication'), type: 'date', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'schedule', title: this.translate.instant('Schedule'), sortable: false, filterable: false, width: this.scheduleColumnWidth }
  ];

  treatmentPlansColumns = [
    { field: 'name', title: this.translate.instant('Name'), type: 'text', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'dob', title: this.translate.instant('Date of Birth'), type: 'date', sortable: true, filterable: true, width: this.dobColumnWidth },
    { field: 'responsibleParty', title: this.translate.instant('Responsible Party'), type: 'text', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastAppt', title: this.translate.instant('Last Appt'), type: 'date', sortable: true, filterable: true, width: this.lastApptColumnWidth },
    { field: 'nextAppt', title: this.translate.instant('Next Appt'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'preventiveCare', title: this.translate.instant('Preventive Care Due Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'treatmentPlans', title: this.translate.instant('Treatment Plans'), type: 'numeric', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastCommunication', title: this.translate.instant('Last Communication'), type: 'date', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'schedule', title: this.translate.instant('Schedule'), sortable: false, filterable: false, width: this.scheduleColumnWidth }
  ];

  // Columns specific to Appointments
  appointmentColumns = [
    { field: 'name', title: this.translate.instant('Name'), type: 'text', sortable: true, filterable: true, width: this.nameColumnWidth },
    { field: 'dob', title: this.translate.instant('Date of Birth'), type: 'date', sortable: true, filterable: true, width: 85 },
    { field: 'responsibleParty', title: this.translate.instant('Responsible Party'), type: 'text', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'lastAppt', title: this.translate.instant('Last Appt'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'appointmentDate', title: this.translate.instant('Appt Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'preventiveCare', title: this.translate.instant('Preventive Care Due Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'status', title: this.translate.instant('Status'), type: 'boolean', sortable: true, filterable: true, width: 120 },
    { field: 'lastCommunication', title: this.translate.instant('Last Communication'), type: 'date', sortable: true, filterable: true, width: 180 },
    { field: 'schedule', title: this.translate.instant('Schedule'), sortable: false, filterable: false, width: 80 }
  ];

  // Columns specific to Other To Do
  otherToDoColumns = [
    { field: 'name', title: this.translate.instant('Name'), type: 'text', sortable: true, filterable: true, width: 130 },
    { field: 'responsibleParty', title: this.translate.instant('Responsible Party'), type: 'text', sortable: true, filterable: true, width: 160 },
    { field: 'dueDate', title: this.translate.instant('Due Date'), type: 'date', sortable: true, filterable: true, width: this.commonColumnWidth },
    { field: 'otherStatus', title: this.translate.instant('Status'), type: 'text', sortable: true, filterable: true, width: 130 },
    { field: 'otherLastAppt', title: this.translate.instant('Last Appt'), type: 'date', sortable: true, filterable: true, width: this.lastApptColumnWidth },
    { field: 'nextAppt', title: this.translate.instant('Next Appt'), type: 'date', sortable: true, filterable: true, width: this.lastApptColumnWidth },
    { field: 'lastCommunication', title: this.translate.instant('Last Communication'), type: 'date', sortable: true, filterable: true, width: 180 }
  ];

  setActiveTab = (activeTab : T) => {
    this.activeGrid = activeTab;
  }

  getActiveTabByUrl = (hash: string):number => {
    let activefilterTab = 0;
    switch (true) {
      case hash?.length > 0 && hash?.includes(LocationHash.PreventiveCare):
        activefilterTab = BadgeFilterType.PreventiveCare;
        break;
      case hash?.length > 0 && hash?.includes(LocationHash.TreatmentPlans):
        activefilterTab = BadgeFilterType.TreatmentPlans;
        break;
      case hash?.length > 0 && hash?.includes(LocationHash.OtherTodo):
        activefilterTab = BadgeFilterType.otherToDo;
        break;
      case hash?.length > 0 && hash?.includes(LocationHash.Appointments):
        activefilterTab = BadgeFilterType.Appointments;
        break;
      default:
        activefilterTab = BadgeFilterType.AllPatients;
    }

    return activefilterTab;
  }

  //#region "Reset"
  collapseAll = () => {
    // Remove all the chevron up and add chevron down
    const anchorElem = document?.getElementsByClassName('glyphicon-chevron-down') as HTMLCollection;
    for (let i = 0; i < anchorElem?.length; i++) {
      anchorElem[i]?.classList?.add('glyphicon-chevron-up');
      anchorElem[i]?.classList?.remove('glyphicon-chevron-down');
    }

    // Remove all the in class
    const divElem = document?.getElementsByClassName('filter-option') as HTMLCollection;
    for (let i = 0; i < divElem?.length; i++) {
      if (divElem[i]?.classList?.contains('in')) {
        divElem[i]?.classList?.remove('in');
      }
    }
  }

  getGridData = (activeRequest, activeTempRequest, url:string, LocationId: number) => {
    return this.activeGrid.fetch(activeRequest, activeTempRequest, url, LocationId);
  }

  dateRangeFilter = (request, data: { startDate: Date, endDate: Date }, field: string): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo => {
    return this.activeGrid.onDateRangeFilter(request, data, field);
  }

  numericRangeFilter = (request, data: { from: number, to: number }): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo => {
    return this.activeGrid.onNumericRangeFilter(request, data);
  }

  sortGridData = (sortData: ({ sortField: string, sortDirection: number })): AllPatientGridSort | PreventiveGridSort | TreatmentGridSort | AppointmentGridSort | OtherToDoGridSort => {
    return this.activeGrid.onSortGridData(sortData);
  }

  slideOutFilterChange = (request, filter): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo => {
    return this.activeGrid.onSlideOutFilterChange(request, filter);
  };

  setPrintMailingLabel = (response: PatientMailingInfo, activeGridData) =>{
    this.activeGrid.onPrintMailingLabel(response, activeGridData);
  }
  
  getTabSettings = (badgeIndex, countKey: string, headerId: string, buttonId: string, headerLabel: string, iconClass: string) => {
    return {
      isActiveFltrTab: badgeIndex,
      isDiabled: this.isPermissable(badgeIndex),
      countKey: countKey,
      header: {
        headerId: headerId,
      },
      body: {
        button: {
          buttonId: buttonId,
          h6: {
            label: headerLabel,
          },
          span: {
            iconClass: iconClass,
          },
        }
      }
    }
  }

  getTabList = (badgeIndex) => {
    const treatmentPlanGrayIcon = 'Images/PatientManagementIcons/txplans_gray.svg',
    treatmentPlanWhiteIcon = 'Images/PatientManagementIcons/txplans_white.svg';
    const tablist = [
      this.getTabSettings(BadgeFilterType.AllPatients,  'allPatients', 'idAllPatientsCount', 'btnAllPatients', MailingLabel.AllPatients, 'icon fa fa-2x fa-users'),
      this.getTabSettings(BadgeFilterType.PreventiveCare, 'preventiveCare', 'idPreventiveCareCount', 'btnPreventiveCareAccounts', MailingLabel.PreventiveCare, 'icon fa fa-2x fa-user-md'),
      {
        isActiveFltrTab: BadgeFilterType.TreatmentPlans,
        isDiabled: this.isPermissable(BadgeAccessType.TreatmentPlans),
        countKey: 'treatmentPlans',
        header: {
          headerId: 'idTreatmentPlansCount',
        },
        body: {
          button: {
            buttonId: 'btnTreatmentPlanAccounts',
            h6: {
              label: MailingLabel.TreatmentPlans,
            },
            img: {
              class: 'peopleMgmt__icon',
              src: badgeIndex == '6' ? treatmentPlanWhiteIcon : treatmentPlanGrayIcon
            },
          }
        }
      },
      this.getTabSettings(BadgeFilterType.Appointments, 'appointments', 'idAppointmentsCount', 'btnAppointmentsAccounts', MailingLabel.Appointments, 'icon far fa-2x fa-calendar-alt'),
      this.getTabSettings(BadgeFilterType.otherToDo, 'otherToDo', 'idOtherToDoCount', 'btnOtherToDoAccounts', MailingLabel.OtherToDo, 'icon far fa-2x fa-calendar-check'),
    ]

    return tablist;
  }

  isPermissable = (tab: string): boolean => {
    switch (tab) {
      case BadgeAccessType.Appointments: // Appointments
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-pman-atab') as boolean;
      case BadgeAccessType.AllPatients: // All Patients
        return true;
      case BadgeAccessType.PreventiveCare: // Preventive Care
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-pman-pctab') as boolean;
      case BadgeAccessType.TreatmentPlans: // Treatment Plans
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-pman-tptab') as boolean;
      case BadgeAccessType.otherToDo: // otherTODO
        return true;
      default:
        return false;
    }
  };

  transformPatientData = (patient, isPrintData = false) => {
    const toShortDisplayDateUtcPipe = new ToShortDisplayDateUtcPipe();
    const agePipe = new AgePipe();
    const dateOfBirth = toShortDisplayDateUtcPipe.transform(patient?.PatientDateOfBirth);
    const lastApptDate = toShortDisplayDateUtcPipe.transform(patient?.PreviousAppointmentDate);
    const preventiveCareDate = toShortDisplayDateUtcPipe.transform(patient?.PreventiveCareDueDate);
    const lastCommunicationDate = toShortDisplayDateUtcPipe.transform(patient?.LastCommunicationDate);
    const nextApptDate = toShortDisplayDateUtcPipe.transform(patient?.NextAppointmentDate);
    const treatmentPlanTotalBalance = this.currencyPipe.transform(patient?.TreatmentPlanTotalBalance, 'USD', 'symbol', '1.2-2');
    const treatmentPlanCount = patient?.TreatmentPlanCount;
    const appointmentDate = toShortDisplayDateUtcPipe.transform(patient?.AppointmentDate);
    const dueDate = toShortDisplayDateUtcPipe.transform(patient?.DueDate);

    const displayNAText = this.translate.instant("N/A");
    const displayIncompleteText = this.translate.instant("Incomplete");
    const patientAge = dateOfBirth ? agePipe.transform(dateOfBirth) : 0;
    const ageLabel = this.translate.instant('Age');
    const lastCommunicationText = this.translate.instant("Create Communication");

    const commonProperties = {
      name: patient?.PatientName || displayNAText,
      dob: dateOfBirth ? `${String(dateOfBirth)} (${String(ageLabel)}: ${patientAge})` : displayNAText,
      responsibleParty: patient?.ResponsiblePartyName || displayNAText,
      lastAppt: `${String(String(patient?.PreviousAppointmentType || displayNAText) + (lastApptDate ? ` ${String(lastApptDate)}` : ''))}`,
      nextAppt: `${String(String(patient?.NextAppointmentType || displayNAText) + (nextApptDate ? ` ${String(nextApptDate)}` : ''))}`,
      preventiveCare: preventiveCareDate || displayNAText,
      treatmentPlans: treatmentPlanTotalBalance ? `(${Number(treatmentPlanCount)})${treatmentPlanTotalBalance}` : this.translate.instant('(0)$0.00'),
      lastCommunication: lastCommunicationDate,
      patientId: patient?.PatientId,
      responsiblePartyId: patient?.ResponsiblePartyId,
      patientAccountId: patient?.PatientAccountId,
      nextAppointmentId: patient?.NextAppointmentId,
      previousAppointmentId: patient?.PreviousAppointmentId,
      appointmentStartTime: patient?.AppointmentStartTime,
      appointmentEndTime: patient?.AppointmentEndTime,
      nextAppointmentStartTime: patient?.NextAppointmentStartTime,
      nextAppointmentEndTime: patient?.NextAppointmentEndTime,
      previousAppointmentTimezone: patient?.PreviousAppointmentTimezone,
      nextAppointmentTimezone: patient?.NextAppointmentTimezone,
      status: patient?.AppointmentStatus,
      appointmentDate: `${String(String(patient?.AppointmentType || displayNAText) + (appointmentDate ? ` ${String(appointmentDate)}` : ` ${String(displayNAText)}`))}`,
      appointmentTimezone: patient?.AppointmentTimezone,
      classification: patient?.Classification,
      appointmentId: patient?.AppointmentId,
      previousAppointmentStartTime: patient?.PreviousAppointmentStartTime,
      previousAppointmentEndTime: patient?.PreviousAppointmentEndTime,
      dueDate: dueDate || displayNAText,
      otherStatus: patient?.IsComplete || displayIncompleteText,
      otherLastAppt: `${String(String(patient?.PreviousAppointmentType || displayNAText) + (lastApptDate ? ` ${String(lastApptDate)}` : ''))}`,
      appointmentDuration: patient?.AppointmentDuration,
      nextAppointmentDuration: patient?.NextAppointmentDuration,
      previousAppointmentDuration: patient?.PreviousAppointmentDuration,
      isActivePatient: patient?.IsActive
    };

    if (isPrintData) {
      return {
        ...commonProperties,
        PatientName: patient?.PatientName || displayNAText,
        ResponsiblePartyName: patient?.ResponsiblePartyName || displayNAText,
        PatientDateOfBirth: dateOfBirth ? `${String(dateOfBirth)}   (${String(ageLabel)}: ${patientAge})` : displayNAText,
        PreviousAppointmentType: `${String(String(patient?.PreviousAppointmentType || displayNAText) + (lastApptDate ? ` ${String(lastApptDate)}` : ''))}`,
        PreviousAppointmentDate: `${String(String(patient?.PreviousAppointmentType || displayNAText) + (lastApptDate ? ` ${String(lastApptDate)}` : ''))}`,
        NextAppointmentType: `${String(String(patient?.NextAppointmentType || displayNAText) + (nextApptDate ? ` ${String(nextApptDate)}` : ''))}`,
        NextAppointmentDate: `${String(String(patient?.NextAppointmentType || displayNAText) + (nextApptDate ? ` ${String(nextApptDate)}` : ''))}`,
        PreventiveCareDueDate: preventiveCareDate || displayNAText,
        TreatmentPlanTotalBalance: treatmentPlanTotalBalance ? `(${Number(treatmentPlanCount)})${treatmentPlanTotalBalance}` : this.translate.instant('(0)$0.00'),
        LastCommunicationDate: lastCommunicationDate || lastCommunicationText,
        AppointmentStatus: patient?.AppointmentStatus,
        AppointmentDate: `${String(String(patient?.AppointmentType || displayNAText) + (appointmentDate ? ` ${String(appointmentDate)}` : ` ${String(displayNAText)}`))}`,
        DueDate: dueDate || displayNAText,
        IsComplete: patient?.IsComplete || displayIncompleteText,
      };
    }
    // Return commonProperties if isPrintData is false
    return commonProperties;
  };

  hasContactInfo = (response: PatientContactInfo): boolean => {
    return response?.PatientMailing ||
      response?.PatientEmail ||
      response?.PatientPrimaryPhone ||
      response?.PatientHomePhone ||
      response?.PatientMobilePhone ||
      response?.PatientWorkPhone ||
      response?.ResponsibleMailing ||
      response?.ResponsibleEmail ||
      response?.ResponsiblePrimaryPhone ||
      response?.ResponsibleHomePhone ||
      response?.ResponsibleMobilePhone ||
      response?.ResponsibleWorkPhone;
  }

  isScrolledToBottom = (target): boolean => {
    let result = false;
    if (target?.documentElement && target?.body) {
      const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
      const body = document.body;
      const html = document.documentElement;
      const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      result = Math.round(documentHeight - windowHeight - scrollY) <= 1;
    }
    return result;
  }

  groupLocations = (groupData: PatientLocation[]) => {
    const resLocs: PatientLocationType[] = [];
    const activeLocs: PatientLocationType[] = [];
    const pendingInactiveLocs: PatientLocationType[] = [];
    const inactiveLocs: PatientLocationType[] = [];

    const dateNow = moment().format('MM/DD/YYYY');
    if (!groupData?.length) {
      return [];
    }
    groupData?.forEach((obj) => {
      if (obj?.DeactivationTimeUtc) {
        const toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
        obj.NameLine1 = obj.NameLine1 + ' (' + String(this.locationTimeService?.getTimeZoneAbbr(obj?.Timezone)) + ')' + ' - ' + toCheck;
        if (moment(toCheck).isSameOrBefore(dateNow)) {
          obj.LocationStatus = 'Inactive';
          obj.GroupOrder = 3;
          inactiveLocs.push(obj);
        } else {
          obj.LocationStatus = 'Pending Inactive';
          obj.GroupOrder = 2;
          pendingInactiveLocs.push(obj);
        }
      } else {
        obj.NameLine1 = obj.NameLine1 + ' (' + String(this.locationTimeService?.getTimeZoneAbbr(obj?.Timezone)) + ')';
        obj.LocationStatus = 'Active';
        obj.GroupOrder = 1;
        activeLocs.push(obj);
      }
    });

    // Sorting logic
    activeLocs.sort((a, b) => a.NameLine1.localeCompare(b.NameLine1));
    inactiveLocs.sort((a, b) => moment(b.DeactivationTimeUtc).diff(a.DeactivationTimeUtc));
    pendingInactiveLocs.sort((a, b) => moment(a.DeactivationTimeUtc).diff(b.DeactivationTimeUtc));

    let ctrIndex = 1;
    activeLocs.forEach((obj) => {
      obj.SortingIndex = ctrIndex;
      resLocs.push(obj);
      ctrIndex++;
    });

    pendingInactiveLocs.forEach((obj) => {
      obj.SortingIndex = ctrIndex;
      resLocs.push(obj);
      ctrIndex++;
    });

    inactiveLocs.forEach((obj) => {
      obj.SortingIndex = ctrIndex;
      resLocs.push(obj);
      ctrIndex++;
    });

    return resLocs;
  }

  showTooltip = (data, field, activeFltrTab): string => {
    let result = '';
    if (field == CommonColumnsFields?.LastAppt && activeFltrTab != BadgeFilterType.Appointments) {
      if (data?.appointmentStartTime && data?.appointmentEndTime) {
        const startTime = this.tooltipContent(data?.appointmentStartTime, data?.previousAppointmentTimezone);
        const endTime = this.tooltipContent(data?.appointmentEndTime, data?.previousAppointmentTimezone);
        const timezoneAbbreviation = this.locationTimeService?.getTimeZoneAbbr(data?.previousAppointmentTimezone, data?.appointmentStartTime);
        const timeDifference = data?.appointmentDuration;

        result = `${String(startTime)} - ${String(endTime)} ${String(timezoneAbbreviation)} (${String(timeDifference)}m)`;
      }
    }
    else if (field == AppointmentsColumnsFields?.LastAppt && activeFltrTab == BadgeFilterType.Appointments) {
      if (data?.previousAppointmentEndTime && data?.previousAppointmentStartTime) {
        const startTime = this.tooltipContent(data?.previousAppointmentStartTime, data?.previousAppointmentTimezone);
        const endTime = this.tooltipContent(data?.previousAppointmentEndTime, data?.previousAppointmentTimezone);
        const timezoneAbbreviation = this.locationTimeService?.getTimeZoneAbbr(data?.previousAppointmentTimezone, data?.previousAppointmentStartTime);
        const timeDifference = data?.previousAppointmentDuration;

        result = `${String(startTime)} - ${String(endTime)} ${String(timezoneAbbreviation)} (${String(timeDifference)}m)`;
      }
    }
    else if (field == OtherToDoColumnsFields?.OtherLastAppt) {
      if (data?.previousAppointmentEndTime && data?.previousAppointmentStartTime) {
        const otherStartTime = this.tooltipContent(data?.previousAppointmentStartTime, data?.previousAppointmentTimezone);
        const otherEndTime = this.tooltipContent(data?.previousAppointmentEndTime, data?.previousAppointmentTimezone);
        const timezoneAbbreviation = this.locationTimeService?.getTimeZoneAbbr(data?.previousAppointmentTimezone, data?.previousAppointmentStartTime);
        const otherTimeDifference = data?.previousAppointmentDuration;

        result = `${String(otherStartTime)} - ${String(otherEndTime)} ${String(timezoneAbbreviation)} (${String(otherTimeDifference)}m)`;
      }
    }
    else if (field == CommonColumnsFields?.NextAppt || field == OtherToDoColumnsFields?.NextAppt) {
      if (data?.nextAppointmentStartTime && data?.nextAppointmentEndTime) {
        const startTime = this.tooltipContent(data?.nextAppointmentStartTime, data?.nextAppointmentTimezone);
        const endTime = this.tooltipContent(data?.nextAppointmentEndTime, data?.nextAppointmentTimezone);
        const timezoneAbbreviation = this.locationTimeService?.getTimeZoneAbbr(data?.nextAppointmentTimezone, data?.nextAppointmentStartTime);
        const timeDifference = data?.nextAppointmentDuration;

        result = `${String(startTime)} - ${String(endTime)} ${String(timezoneAbbreviation)} (${String(timeDifference)}m)`;
      }
    }
    else if (field == AppointmentsColumnsFields?.ApptDate) {
      if (data?.appointmentStartTime && data?.appointmentEndTime) {
        const startTime = this.tooltipContent(data?.appointmentStartTime, data?.appointmentTimezone);
        const endTime = this.tooltipContent(data?.appointmentEndTime, data?.appointmentTimezone);
        const timezoneAbbreviation = this.locationTimeService?.getTimeZoneAbbr(data?.appointmentTimezone, data?.appointmentStartTime);
        const timeDifference = data?.appointmentDuration;

        result = `${String(startTime)} - ${String(endTime)} ${String(timezoneAbbreviation)} (${String(timeDifference)}m)`;
      }
    }

    return result;
  }

  tooltipContent = (time, timezone): string => {
    const toDisplayTimePipe = new ToDisplayTimePipe();
    const convertedTime = toDisplayTimePipe.transform(this.locationTimeService.convertDateTZ(time, timezone));
    return convertedTime as string;
  }

  getTxClass = (status: string): string => {
    let cssClass = '';
    switch (status) {
      case 'Proposed':
        cssClass = 'fa-question-circle';
        break;
      case 'Presented':
        cssClass = 'fa-play-circle';
        break;
      case 'Accepted':
        cssClass = 'far fa-thumbs-up';
        break;
      case 'Rejected':
        cssClass = 'far fa-thumbs-down';
        break;
      case 'Completed':
        cssClass = 'fa-check';
        break;
    }
    return cssClass;
  }

  updateFilter = (field: string, value) => {
    const additionalFilters = [
      {
        field: this.translate.instant('LocationId'),
        filter: null,
      },
      {
        field: this.translate.instant('IsActive'),
        filter: [true],
      },
      {
        field: this.translate.instant('IsPatient'),
        filter: [true],
      },
    ];

    for (let i = 0; i < additionalFilters?.length; i++) {
      const item = additionalFilters[i];
      if (item?.field == field) {
        item.filter = value;
        return;
      }
    }

    additionalFilters?.push({
      field: field,
      filter: value,
    });

    return additionalFilters;
  }
}



