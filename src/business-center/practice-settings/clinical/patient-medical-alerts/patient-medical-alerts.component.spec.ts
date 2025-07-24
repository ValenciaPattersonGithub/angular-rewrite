import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { groupBy, GroupDescriptor, GroupResult } from '@progress/kendo-data-query';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientMedicalAlertsComponent } from './patient-medical-alerts.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

let mockLocalizeService;
let medicalHistoryAlerts;
let mockToastrFactory;
let gridData;
let groups: GroupDescriptor[];
let changes: SimpleChanges;
let mockBreadCrumbs;
let mockLocation;
let mockMedicalHistoryFactory;
let mockMedicalHistoryService;
let mockListHelper;
let mockPatSecurityService;
let mockFeatureFlagService;

describe('PatientMedicalAlertsComponent', () => {
  let component: PatientMedicalAlertsComponent;
  let fixture: ComponentFixture<PatientMedicalAlertsComponent>;

  beforeEach(async () => {
    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    };

    medicalHistoryAlerts = [{
      DataTag: "AAAAAAAAKJ4=",
      DateModified: "2016-09-20T14:15:53.485539",
      Description: "Other congenital heart defects",
      GenerateAlert: true,
      ItemSequenceNumber: 10,
      MedicalHistoryAlertId: 1,
      SectionSequenceNumber: 8,
      UserModified: "00000000-0000-0000-0000-000000000000"
    }, {
      DataTag: "AAAAAAAAKJ5=",
      DateModified: "2016-09-20T14:15:53.485539",
      Description: "Autoimmune disease",
      GenerateAlert: true,
      ItemSequenceNumber: 22,
      MedicalHistoryAlertId: 2,
      SectionSequenceNumber: 8,
      UserModified: "00000000-0000-0000-0000-000000000000"
    }];

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    groups = [{ field: "MedicalHistoryAlertTypeId", dir: "asc" }];

    changes = {
      alerts: {
        currentValue: medicalHistoryAlerts,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => { return false }
      }
    }

    mockBreadCrumbs = [
      {
        name: 'Practice Settings',
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      }
    ];

    mockLocation = {
      path: jasmine.createSpy().and.returnValue('/'),
      url: jasmine.createSpy().and.returnValue('/')
    };

    mockMedicalHistoryFactory = {
      access: jasmine.createSpy().and.returnValue({ View: true, Create: true }),
      SetActiveMedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
      observeMedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
      MedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
      ChangeGenerateAlert: jasmine.createSpy().and.returnValue({}),
      ProcessQueue: jasmine.createSpy().and.returnValue({}),
      save: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy()
      })
    }

    mockMedicalHistoryService = {
      update: jasmine.createSpy().and.callFake(() => {
        return {
          $promise: {
            then(res) {
              return res({ Value: {} });
            }
          }
        };
      })
    }

    mockListHelper = {
      findIndexByFieldValue: jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0)
    };

    mockPatSecurityService = {
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
      IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true)
    };

    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('getOnce$').and.returnValue(of(false))
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'ListHelper', useValue: mockListHelper },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'MedicalHistoryAlertsFactory', useValue: mockMedicalHistoryFactory },
        { provide: '$location', useValue: mockLocation },
        { provide: 'MedicalHistoryAlertsService', useValue: mockMedicalHistoryService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ],
      declarations: [PatientMedicalAlertsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMedicalAlertsComponent);
    component = fixture.componentInstance;
    gridData = groupBy(medicalHistoryAlerts, groups);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges -->', () => {
    it('should perform operation if any data change found', () => {
      spyOn(component, 'orderByGroup');
      component.ngOnChanges(changes);
      expect(component.orderByGroup).toHaveBeenCalled();
    });

    it('should not perform operation if any data change found', () => {
      spyOn(component, 'orderByGroup');
      let tempChanges: SimpleChanges = { ...changes, alerts: null };
      component.ngOnChanges(tempChanges);
      expect(component.orderByGroup).not.toHaveBeenCalled();
    });
  });

  describe('orderByGroup -->', () => {
    it('Should call orderByGroup', () => {
      const spy = spyOn(component, 'orderByGroup').and.callThrough();
      component.orderByGroup(gridData);
      expect(spy).toHaveBeenCalledWith(gridData);
    });
  });

  describe('ngOnInit -->', () => {
    it('Should call createBreadCrumb', () => {
      component.createBreadCrumb = jasmine.createSpy();
      component.ngOnInit();
      expect(component.createBreadCrumb).toHaveBeenCalled();
    });
    
    it('Should call getAccess', () => {
      component.getAccess = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getAccess).toHaveBeenCalled();
    });
    
    it('Should set properties', () => {
      component.ngOnInit();
      expect(component.pageTitle).not.toBe(null);
      expect(component.allergies).not.toBe(null);
      expect(component.medical).not.toBe(null);
      expect(component.other).not.toBe(null);
    });
    
    it('Should set isRemiderEnabled based on feature flag', () => {
      component.ngOnInit();
      expect(mockFeatureFlagService.getOnce$).toHaveBeenCalled();
      expect(component.isRemiderEnabled).toBeFalsy();      
    });
  });
  describe('createBreadCrumb -->', () => {
    it('Should call createBreadCrumb', () => {
      const spy = component.createBreadCrumb = jasmine.createSpy();
      component.createBreadCrumb();
      expect(spy).toHaveBeenCalled();
      expect(component.breadCrumbs[0].name).toEqual('translated text');
      expect(component.breadCrumbs[0].path).toEqual('#/BusinessCenter/PracticeSettings/');
      expect(component.breadCrumbs[1].name).toEqual(component.pageTitle);
      expect(component.breadCrumbs[1].path).toEqual('/BusinessCenter/PatientAlerts/');
    });
  });

  describe('getAccess -->', () => {
    it('Should call getAccess', () => {
      const spy = component.getAccess = jasmine.createSpy();
      component.getAccess();
      expect(spy).toHaveBeenCalled();
      expect(mockMedicalHistoryFactory.access).toHaveBeenCalled();
    });

    it('Should not show toastr when view is true', () => {
      component.getAccess();
      expect(mockMedicalHistoryFactory.access).toHaveBeenCalled();
      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('Should show toastr when view is false', () => {
      const spy = mockToastrFactory.error = jasmine.createSpy();
      component.access.View = false;
      component.getAccess();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('closeForm -->', () => {
    it('Should call closeForm', () => {
      component.closeForm();
      expect(document.title).toBe('Practice Settings');
    })
  });

  describe('changePath -->', () => {
    it('Should call changePath', () => {
      component.changePath(mockBreadCrumbs[0]);
      expect(document.title).toBe('Practice Settings');
    })
  });

  describe('filterByMedicalHistoryAlertTypeId function -> ', () => {
    it('should call filterByMedicalHistoryAlertTypeId', () => {
      component.filterByMedicalHistoryAlertTypeId = jasmine.createSpy();
      const alert = { MedicalHistoryAlertTypeId: 1 };
      component.filterByMedicalHistoryAlertTypeId(alert);
      expect(component.filterByMedicalHistoryAlertTypeId).toHaveBeenCalled();
    });

    it('should return MedicalHistoryAlertTypeId', () => {
      const alert = { MedicalHistoryAlertTypeId: 1 };
      const res = component.filterByMedicalHistoryAlertTypeId(alert);
      expect(res).toBe(1);
    });
  });

  describe('setGenerateAlert function -> ', () => {
    it('should call medicalHistoryAlertsFactory.ChangeGenerateAlert', () => {
      component.medicalHistoryAlerts = medicalHistoryAlerts;
      var item = component.medicalHistoryAlerts[0];
      component.setGenerateAlert(item);
      expect(mockMedicalHistoryService.update).toHaveBeenCalled();
    });
  });

});
