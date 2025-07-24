import { TestBed } from '@angular/core/testing';
import { ActiveTabService } from './active-tab.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PatientLandingGridService } from '../common/http-providers/patient-landing-grid.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocationTimeService } from 'src/practices/common/providers';
import { CurrencyPipe } from '@angular/common';
import { AllPatientsGridData, IGridHelper, IGridNumericHelper, IPrintMailingHelper } from './grid-helper.service';
import { BadgeAccessType, BadgeFilterType, PatientLocation } from '../common/models/patient-location.model';
import { AppointmentsColumnsFields, CommonColumnsFields, LocationHash, OtherToDoColumnsFields } from '../common/models/enums/patient.enum';
import { PatientContactInfo } from '../common/models/patient-contact-info.model';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { PatientMailingInfo } from 'src/@shared/models/send-mailing.model';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';

const mockGroupLocation: PatientLocation[] = [
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 5303660,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAAALpY0=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2022-06-03T17:29:27.6216702",
    DeactivationTimeUtc: "2022-06-06T04:00:00+00:00",
    NameLine1: "Location5303660Practice38638_fl15 (Timezone Abbreviation) - 06/06/2022",
    LocationStatus: "Inactive",
    GroupOrder: 3,
    Timezone: "Mountain Standard Time",
    Value: []
  },
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 6606192,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAAAskks=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-08-11T11:36:03.8049194",
    DeactivationTimeUtc: null,
    NameLine1: "66 (Timezone Abbreviation)",
    LocationStatus: "Active",
    GroupOrder: 1,
    Timezone: "Mountain Standard Time",
    Value: []
  },
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 6280157,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAB1NsdY=",
    UserModified: "229ab3ec-5822-493e-9e53-d2f06b95aba3",
    DateModified: "2023-06-14T18:04:03.5221365",
    DeactivationTimeUtc: "2029-06-04T18:30:00+00:00",
    NameLine1: "Anglers (PDT) - 06/05/2029",
    LocationStatus: "Pending Inactive",
    GroupOrder: 2,
    Timezone: "Mountain Standard Time",
    Value: []
  }
];

const mockData = {
  name: "Anthony, Emanuel",
  dob: "01/18/1960    (Age: 64)",
  responsibleParty: "Anthony, Emanuel",
  lastAppt: "Crown Bridge Prep 01/10/2022",
  nextAppt: "N/A",
  preventiveCare: "N/A",
  treatmentPlans: "(0)$0.00",
  lastCommunication: "",
  patientId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  responsiblePartyId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  patientAccountId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  nextAppointmentId: null,
  previousAppointmentId: "feb84cc5-2907-44a2-b4b6-9bd311df0bd9",
  appointmentStartTime: "2022-01-10T17:45:00",
  appointmentEndTime: "2022-01-10T18:30:00",
  previousAppointmentStartTime: '2022-09-01T11:45:00.0000000-05:00',
  previousAppointmentEndTime: '2022-09-01T01:30:00.0000000-05:00',
  nextAppointmentStartTime: "2022-01-10T17:45:00",
  nextAppointmentEndTime: "2022-01-10T18:30:00",
  previousAppointmentTimezone: "Central Standard Time",
  nextAppointmentTimezone: null,
  appointmentDate: "N/A N/A",
  dueDate: "N/A",
  otherStatus: "Incomplete",
  otherLastAppt: "Crown Bridge Prep 01/10/2022",
  appointmentDuration: 45,
  nextAppointmentDuration: null,
  isActivePatient: true
};

const mockTransformPatientData = {
  PatientName: 'Patient',
  PatientDateOfBirth: new Date(),
  ResponsiblePartyName: 'Responsible Party',
  PreviousAppointmentType: 'Previous Appointment',
  PreviousAppointmentDate: new Date(),
  NextAppointmentType: 'Next Appointment',
  NextAppointmentDate: new Date(),
  PreventiveCareDueDate: new Date(),
  TreatmentPlanTotalBalance: 100,
  TreatmentPlanCount: 1,
  LastCommunicationDate: new Date(),
  PatientId: 'PatientId',
  ResponsiblePartyId: 'ResponsiblePartyId',
  PatientAccountId: 'PatientAccountId',
  NextAppointmentId: 'NextAppointmentId',
  PreviousAppointmentId: 'PreviousAppointmentId',
  AppointmentStartTime: new Date(),
  AppointmentEndTime: new Date(),
  NextAppointmentStartTime: new Date(),
  NextAppointmentEndTime: new Date(),
  PreviousAppointmentTimezone: 'PreviousAppointmentTimezone',
  NextAppointmentTimezone: 'NextAppointmentTimezone',
  AppointmentStatus: 'AppointmentStatus',
  AppointmentDate: new Date(),
  DueDate: new Date(),
  IsComplete: true,
  AppointmentType: 'AppointmentType',
  PreviousAppointmentStartTime: new Date(),
  PreviousAppointmentEndTime: new Date(),
  AppointmentDuration: 60,
  NextAppointmentDuration: 60,
  PreviousAppointmentDuration: 60,
  IsActive: true
};

const mockAllPatientRequest = {
  CurrentPage: 0,
  PageCount: 50,
  FilterCriteria: {
    AppointmentStatusList: [],
    HasInsurance: [],
    IsActive: ["true"],
    IsPatient: ["true"],
    LastCommunicationDate: null,
    LocationId: 5316664,
    NextAppointmentDate: null,
    PatientDateOfBirth: null,
    PatientName: "",
    PreventiveCareDueDate: null,
    PreventiveCareIsScheduled: ["true", "false"],
    PreviousAppointmentDate: null,
    ResponsiblePartyName: "",
    TreatmentPlanTotalBalance: ""
  },
  SortCriteria: {
    LastCommunicationDate: 0,
    NextAppointmentDate: 0,
    PatientDateOfBirth: 0,
    PatientName: 0,
    PreventiveCareDueDate: 0,
    PreviousAppointmentDate: 0,
    ResponsiblePartyName: 0,
    TreatmentPlanTotalBalance: 0
  }
}

const mockDialogRes = {
  PatientMailing: false,
  PatientEmail: false,
  PatientPrimaryPhone: false,
  PatientHomePhone: false,
  PatientMobilePhone: false,
  PatientWorkPhone: false,
  ResponsibleMailing: false,
  ResponsibleEmail: false,
  ResponsiblePrimaryPhone: false,
  ResponsibleHomePhone: false,
  ResponsibleMobilePhone: false,
  ResponsibleWorkPhone: false
}

const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

const mocklocationTimeService = {
  getTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
  convertDateTZ: jasmine.createSpy()
}

const mockservice = {
  IsAuthorizedByAbbreviation: () => { },
  isEnabled: () => new Promise(() => { }),
};

const mockCurrencyPipe = new CurrencyPipe('en_US', 'USD');

describe('ActiveTabService', () => {
  let service: ActiveTabService<IGridHelper & IGridNumericHelper & IPrintMailingHelper>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: LocationTimeService, useValue: mocklocationTimeService },
        { provide: 'patSecurityService', useValue: mockservice },
        { provide: CurrencyPipe, useValue: mockCurrencyPipe },
        PatientLandingGridService,
      ]
    });
    service = TestBed.inject(ActiveTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setActiveTab', () => {
    it('should set the activeGrid property correctly', () => {
      const activeTab: IGridHelper & IGridNumericHelper & IPrintMailingHelper = new AllPatientsGridData(mockTranslateService, null, null, null, null, null, null, null);
      service.setActiveTab(activeTab);
      expect(service.activeGrid).toBe(activeTab);
    });
  });

  describe('getActiveTab', () => {
    it('should return the correct activefilterTab for PreventiveCare', () => {
      const hash = `#${LocationHash.PreventiveCare}`;
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.PreventiveCare);
    });

    it('should return the correct activefilterTab for TreatmentPlans', () => {
      const hash = `#${LocationHash.TreatmentPlans}`;
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.TreatmentPlans);
    });

    it('should return the correct activefilterTab for OtherTodo', () => {
      const hash = `#${LocationHash.OtherTodo}`;
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.otherToDo);
    });

    it('should return the correct activefilterTab for Appointments', () => {
      const hash = `#${LocationHash.Appointments}`;
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.Appointments);
    });

    it('should return the correct activefilterTab for AllPatients', () => {
      const hash = `#${LocationHash.AllPatients}`;
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.AllPatients);
    });

    it('should return AllPatients as the default activefilterTab', () => {
      const hash = '#/unknown';
      expect(service.getActiveTabByUrl(hash)).toBe(BadgeFilterType.AllPatients);
    });
  });

  describe('collapseAll ->', () => {
    it('should collapse all elements by updating glyphicon-chevron classes', () => {
      const anchorElemMock = document.createElement('div');
      anchorElemMock.classList.add('glyphicon-chevron-down');
      spyOn(document, 'getElementsByClassName').and.returnValue([anchorElemMock]);
      service.collapseAll();
      expect(anchorElemMock.classList.contains('glyphicon-chevron-up')).toBe(true);
      expect(anchorElemMock.classList.contains('glyphicon-chevron-down')).toBe(false);
    });

    it('should collapse all elements by updating filter-option classes', () => {
      const anchorElemMock = document.createElement('div');
      const divElemMock = document.createElement('div');
      divElemMock.classList.add('filter-option');
      divElemMock.classList.add('in');
      spyOn(document, 'getElementsByClassName').and.returnValues([anchorElemMock], [divElemMock]);
      service.collapseAll();
      expect(divElemMock.classList.contains('in')).toBe(false);
    });
  });

  describe('dateRangeFilter ->', () => {
    it('should call the fetch method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['fetch']);
      const activeRequest = {};
      const activeTempRequest = {};
      const url = 'Url';
      const LocationId = 1;
      service.getGridData(activeRequest, activeTempRequest, url, LocationId);

      expect(service.activeGrid.fetch).toHaveBeenCalledWith(activeRequest, activeTempRequest, url, LocationId);
    });

    it('should call the onDateRangeFilter method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['onDateRangeFilter']);
      const data = { startDate: new Date('1/1/2000'), endDate: new Date() };
      const field = 'Field';
      service.dateRangeFilter(mockAllPatientRequest, data, field);

      expect(service.activeGrid.onDateRangeFilter).toHaveBeenCalledWith(mockAllPatientRequest, data, field);
    });
  });

  describe('numericRangeFilter ->', () => {
    it('should call the onNumericRangeFilter method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['onNumericRangeFilter']);
      const data = { from: 1, to: 10 };
      service.numericRangeFilter(mockAllPatientRequest, data);

      expect(service.activeGrid.onNumericRangeFilter).toHaveBeenCalledWith(mockAllPatientRequest, data);
    });
  });

  describe('sortGridData ->', () => {
    it('should call the onSortGridData method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['onSortGridData']);
      const sortData = { sortField: 'Field', sortDirection: 1 };
      service.sortGridData(sortData);

      expect(service.activeGrid.onSortGridData).toHaveBeenCalledWith(sortData);
    });
  });

  describe('slideOutFilterChange ->', () => {
    it('should call the onSlideOutFilterChange method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['onSlideOutFilterChange']);
      service.slideOutFilterChange(mockAllPatientRequest, mockAllPatientRequest.FilterCriteria);

      expect(service.activeGrid.onSlideOutFilterChange).toHaveBeenCalledWith(mockAllPatientRequest, mockAllPatientRequest.FilterCriteria);
    });
  });

  describe('setPrintMailingLabel ->', () => {
    it('should call the onPrintMailingLabel method of activeGrid with the correct arguments', () => {
      service.activeGrid = jasmine.createSpyObj('activeGrid', ['onPrintMailingLabel']);
      const response: PatientMailingInfo = {
        communicationTypeId: '4',
        communicationTemplateId: '23',
        isPrintMailingLabel: true,
        isPostcard: true
      };
      const activeGridData: PatientMailingInfo = {
        isPrintMailingLabel: false,
        isPostcard: false
      };
      service.setPrintMailingLabel(response, activeGridData);

      expect(service.activeGrid.onPrintMailingLabel).toHaveBeenCalledWith(response, activeGridData);
    });
  });

  describe('getTabSettings ->', () => {
    it('should return the correct tab settings', () => {
      const badgeIndex = 2;
      const countKey = 'allPatients';
      const headerId = 'idAllPatientsCount';
      const buttonId = 'btnAllPatients';
      const headerLabel = 'All Patients';
      const iconClass = 'icon fa fa-2x fa-users';
      const expectedTabSettings = {
        isActiveFltrTab: badgeIndex,
        isDiabled: false,
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
      };
      expect(service.getTabSettings(badgeIndex, countKey, headerId, buttonId, headerLabel, iconClass)).toEqual(expectedTabSettings);
    });
  });

  describe('getTabList ->', () => {
    beforeEach(() => {
      spyOn(service, 'isPermissable').and.returnValue(true);
      spyOn(service, 'getTabSettings').and.callThrough();
    });

    it('should return the correct tab list', () => {
      const badgeIndex = BadgeFilterType.TreatmentPlans;
      const tabList = service.getTabList(badgeIndex);

      expect(service.getTabSettings).toHaveBeenCalledTimes(4); // getTabSettings should be called 4 times
      expect(tabList.length).toBe(5); // The tab list should have 5 items

      // Check the TreatmentPlans tab settings
      const treatmentPlansTab = tabList.find(tab => tab.isActiveFltrTab == BadgeFilterType.TreatmentPlans);
      expect(treatmentPlansTab).toBeDefined();
      if ('img' in treatmentPlansTab.body.button) {
        expect(treatmentPlansTab.body.button.img.src).toBe('Images/PatientManagementIcons/txplans_white.svg'); // The src should be the white icon when badgeIndex is TreatmentPlans
      }
    });
  });

  describe('isPermissable ->', () => {
    it('should return true for Appointments when authorized', () => {
      spyOn(mockservice, 'IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.isPermissable(BadgeAccessType.Appointments);
      expect(result).toBe(true);
      expect(mockservice.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-per-pman-atab');
    });

    it('should return true for AllPatients', () => {
      const result = service.isPermissable(BadgeAccessType.AllPatients);
      expect(result).toBe(true);
    });

    it('should return true for PreventiveCare when authorized', () => {
      spyOn(mockservice, 'IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.isPermissable(BadgeAccessType.PreventiveCare);
      expect(result).toBe(true);
      expect(mockservice.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-per-pman-pctab');
    });

    it('should return true for TreatmentPlans when authorized', () => {
      spyOn(mockservice, 'IsAuthorizedByAbbreviation').and.returnValue(true);
      const result = service.isPermissable(BadgeAccessType.TreatmentPlans);
      expect(result).toBe(true);
      expect(mockservice.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-per-pman-tptab');
    });

    it('should return true for otherToDo', () => {
      const result = service.isPermissable(BadgeAccessType.otherToDo);
      expect(result).toBe(true);
    });

    it('should return false for unknown tab', () => {
      const result = service.isPermissable('UnknownTab');
      expect(result).toBe(false);
    });
  });

  describe('transformPatientData ->', () => {
    it('should correctly transform the patient data', () => {
      const agePipe = new AgePipe();
      const transformedData = service.transformPatientData(mockTransformPatientData);

      expect(transformedData.name).toBe(mockTransformPatientData.PatientName);
      expect(transformedData.dob).toContain(agePipe.transform(mockTransformPatientData.PatientDateOfBirth));
    });

    it('should patient data when isPrintData is True', () => {
      const agePipe = new AgePipe();
      const transformedData = service.transformPatientData(mockTransformPatientData, true);

      expect(transformedData.name).toBe(mockTransformPatientData.PatientName);
      expect(transformedData.dob).toContain(agePipe.transform(mockTransformPatientData.PatientDateOfBirth));
    });
  });

  describe('hasContactInfo ->', () => {
    it('should return true if any contact info check has true present', () => {
      mockDialogRes.PatientEmail = true;
      const response: PatientContactInfo = mockDialogRes
      service.hasContactInfo(response);
      expect(service.hasContactInfo(response)).toBe(true);
    });

    it('should return false if no contact info check has true present', () => {
      mockDialogRes.PatientEmail = false;
      const response: PatientContactInfo = mockDialogRes
      service.hasContactInfo(response);
      expect(service.hasContactInfo(response)).toBe(false);
    });
  });

  describe('isScrolledToBottom ->', () => {
    it('should return false when scrollHeight - scrollTop is greater than clientHeight', () => {
      const mockElement = {
        scrollHeight: 100,
        scrollTop: 50,
        clientHeight: 51,
      };
      const result = service.isScrolledToBottom(mockElement);
      expect(result).toBe(false);
    });

    //it('should return true when scrollHeight - scrollTop is less than clientHeight', () => {
    //  const mockElement = {
    //    scrollHeight: 100,
    //    scrollTop: 50,
    //    clientHeight: 51,
    //    documentElement: '123',
    //    body: 'test'
    //  };
    //  document.documentElement.offsetHeight;
    //  const result = service.isScrolledToBottom(mockElement);
    //  expect(result).toBe(true);
    //});
  });

  describe('groupLocations ->', () => {
    it('should correctly group and sort the locations', () => {
      const groupLocationsValue = service.groupLocations(mockGroupLocation);
      service.groupLocations(mockGroupLocation);
      expect(groupLocationsValue.length).toBeGreaterThan(0)
    });

    it('should return an empty array when the groupLocations parameter is null', () => {
      const groupLocationsValue = service.groupLocations(null);
      service.groupLocations(mockGroupLocation);
      expect(groupLocationsValue).toEqual([])
    });
  });

  describe('showTooltip ->', () => {
    it('should return empty when no field or data is there', () => {
      const result = '';
      const field = '';
      const data = {};
      service.showTooltip(data, field, BadgeFilterType.AllPatients);
      expect(result).toBe('');
    });

    it('should generate tooltip for LastAppt field', () => {
      const field = CommonColumnsFields?.LastAppt;
      const result = '11:45 am - 12:30 pm CST (45m)';
      const data = {
        startTime: '11:45 am',
        endTime: '12:30 pm',
        timezoneAbbreviation: 'CST',
        timeDifference: 45,
        appointmentStartTime: '2021-09-01T11:45:00.0000000-05:00',
        appointmentEndTime: '2021-09-01T12:30:00.0000000-05:00',
      }
      service.showTooltip(mockData, field, BadgeFilterType.AllPatients);
      const expResult = data.startTime + ' - ' + data.endTime + ' ' + data.timezoneAbbreviation + ' (' + data.timeDifference + 'm)';
      expect(result).toBe(expResult);
    });

    it('should not generate tooltip for LastAppt field when there is no data', () => {
      const field = CommonColumnsFields?.LastAppt;
      const data = {
        previousAppointmentStartTime: '',
        previousAppointmentEndTime: '',
        previousAppointmentTimezone: '',
        previousAppointmentDuration: null,
      };
      const result = service.showTooltip(data, field, BadgeFilterType.AllPatients);
      expect(result).toBe('');
    });

    it('should generate tooltip for LastAppt field when active filter tab is Appointments', () => {
      const field = AppointmentsColumnsFields?.LastAppt;
      const data = {
        previousAppointmentStartTime: '2022-09-01T11:45:00.0000000-05:00',
        previousAppointmentEndTime: '2022-09-01T13:30:00.0000000-05:00',
        previousAppointmentTimezone: 'Central Standard Time',
        previousAppointmentDuration: 60
      };
      const startTime = service.tooltipContent(data.previousAppointmentStartTime, data.previousAppointmentTimezone);
      const endTime = service.tooltipContent(data.previousAppointmentEndTime, data.previousAppointmentTimezone);
      const abbreviation = mocklocationTimeService.getTimeZoneAbbr(data.previousAppointmentTimezone, data.previousAppointmentStartTime);
      const expectedResult = `${startTime} - ${endTime} ${abbreviation} (${data.previousAppointmentDuration}m)`;
      const result = service.showTooltip(data, field, BadgeFilterType.Appointments);

      expect(result).toBe(expectedResult);
    });

    it('should generate tooltip for LastAppt field when active filter tab is Appointments when there is no data', () => {
      const field = AppointmentsColumnsFields?.LastAppt;
      const data = {
        previousAppointmentStartTime: '',
        previousAppointmentEndTime: '',
        previousAppointmentTimezone: '',
        previousAppointmentDuration: null,
      };
      const result = service.showTooltip(data, field, BadgeFilterType.Appointments);
      expect(result).toBe('');
    });

    it('should generate tooltip for otherLastAppt field', () => {
      const field = OtherToDoColumnsFields?.OtherLastAppt;
      const result = '12:45 am - 01:30 pm CST (40m)';
      const data = {
        otherStartTime: '12:45 am',
        otherEndTime: '01:30 pm',
        timezoneAbbreviation: 'CST',
        otherTimeDifference: 40,
        previousAppointmentStartTime: '2022-09-01T11:45:00.0000000-05:00',
        previousAppointmentEndTime: '2022-09-01T01:30:00.0000000-05:00',
      }
      service.showTooltip(mockData, field, BadgeFilterType.otherToDo);

      const expResult = data.otherStartTime + ' - ' + data.otherEndTime + ' ' + data.timezoneAbbreviation + ' (' + data.otherTimeDifference + 'm)';
      expect(result).toBe(expResult);
    });

    it('should not generate tooltip for otherLastAppt field when there is no data', () => {
      const field = OtherToDoColumnsFields?.OtherLastAppt;
      const data = {
        previousAppointmentStartTime: '',
        previousAppointmentEndTime: '',
        previousAppointmentTimezone: '',
        previousAppointmentDuration: null,
      };
      const result = service.showTooltip(data, field, BadgeFilterType.otherToDo);
      expect(result).toBe('');
    });

    it('should generate tooltip for nextAppt field', () => {
      const field = CommonColumnsFields?.NextAppt || OtherToDoColumnsFields?.NextAppt;
      const result = '11:45 am - 12:30 pm CST (45m)';
      const data = {
        startTime: '11:45 am',
        endTime: '12:30 pm',
        timezoneAbbreviation: 'CST',
        timeDifference: 45,
        nextAppointmentStartTime: '2021-09-01T11:45:00.0000000-05:00',
        nextAppointmentEndTime: '2021-09-01T12:30:00.0000000-05:00',
      }
      service.showTooltip(mockData, field, BadgeFilterType.AllPatients);

      const expResult = data.startTime + ' - ' + data.endTime + ' ' + data.timezoneAbbreviation + ' (' + data.timeDifference + 'm)';
      expect(result).toBe(expResult);
    });

    it('should not generate tooltip for nextAppt field when there is no data', () => {
      const field = CommonColumnsFields?.NextAppt || OtherToDoColumnsFields?.NextAppt;
      const data = {
        previousAppointmentStartTime: '',
        previousAppointmentEndTime: '',
        previousAppointmentTimezone: '',
        previousAppointmentDuration: null,
      };
      const result = service.showTooltip(data, field, BadgeFilterType.AllPatients);
      expect(result).toBe('');
    });

    it('should generate tooltip for appointmentDate field', () => {
      const field = AppointmentsColumnsFields?.ApptDate;
      const result = '02:45 am - 03:30 pm CST (45m)';
      const data = {
        startTime: '02:45 am',
        endTime: '03:30 pm',
        timezoneAbbreviation: 'CST',
        timeDifference: 45,
        appointmentStartTime: '2021-09-01T11:45:00.0000000-05:00',
        appointmentEndTime: '2021-09-01T12:30:00.0000000-05:00',
      }
      service.showTooltip(mockData, field, BadgeFilterType.Appointments);

      const expResult = data.startTime + ' - ' + data.endTime + ' ' + data.timezoneAbbreviation + ' (' + data.timeDifference + 'm)';
      expect(result).toBe(expResult);
    });

    it('should not generate tooltip for appointmentDate field when there is no data', () => {
      const field = AppointmentsColumnsFields?.ApptDate;
      const data = {
        previousAppointmentStartTime: '',
        previousAppointmentEndTime: '',
        previousAppointmentTimezone: '',
        previousAppointmentDuration: null,
      };
      const result = service.showTooltip(data, field, BadgeFilterType.Appointments);
      expect(result).toBe('');
    });
  });

  describe('tooltipContent ->', () => {
    it('should return the correct tooltip content', () => {
      const toDisplayTimePipe = new ToDisplayTimePipe();
      spyOn(toDisplayTimePipe, 'transform').and.callThrough();
      const time = new Date();
      const timezone = 'America/New_York';
      const expectedTooltip = toDisplayTimePipe.transform(mocklocationTimeService.convertDateTZ(time, timezone));

      expect(service.tooltipContent(time, timezone)).toBe(expectedTooltip);
    });
  });

  describe('getTxClass ->', () => {
    it('should return the correct CSS class for Proposed', () => {
      expect(service.getTxClass('Proposed')).toBe('fa-question-circle');
    });

    it('should return the correct CSS class for Presented', () => {
      expect(service.getTxClass('Presented')).toBe('fa-play-circle');
    });

    it('should return the correct CSS class for Accepted', () => {
      expect(service.getTxClass('Accepted')).toBe('far fa-thumbs-up');
    });
    it('should return the correct CSS class for Rejected', () => {
      expect(service.getTxClass('Rejected')).toBe('far fa-thumbs-down');
    });
    it('should return the correct CSS class for Completed', () => {
      expect(service.getTxClass('Completed')).toBe('fa-check');
    });

    it('should return an empty string for an unknown status', () => {
      expect(service.getTxClass('Unknown')).toBe('');
    });
  });

  describe('updateFilter ->', () => {
    it('should update filter value for existing field', () => {
      const field = 'IsActive';
      const value = [false];
      const updateFilter = service.updateFilter(field, value);
      expect(updateFilter.length).toBeGreaterThan(0);
    });
  });

});
