import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";

import { PatientEncounterClaimsComponent } from "./patient-encounter-claims.component";
import { AdjustmentTypesService } from "src/@shared/providers/adjustment-types.service";
import { ViewClaimService } from "src/@shared/providers/view-claim.service";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { of } from "rxjs";

describe("PatientEncounterClaimsComponent", () => {
  let component: PatientEncounterClaimsComponent;
  let fixture: ComponentFixture<PatientEncounterClaimsComponent>;
  const mockservice = {
    getDepositIdByCreditTransactionId: jasmine.createSpy(),
    viewStatement: (a: any) => {},
    launchNewTab: (a: any) => {},
    getLocalizedString: (a: any) => {},
  };
  const mockToastrFactory: any = {
    error: jasmine.createSpy(),
    success: jasmine.createSpy(),
  };
  const mockLocalizeService: any = {
    getLocalizedString: () => "translated text",
  };
  const mockreferenceDataService: any = {
    get: jasmine.createSpy(),
    entityNames: {
      serviceTypes: [],
    },
  };
  let mockListHelper: any = {
    findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
    get: jasmine.createSpy().and.returnValue({}),
  };
  const mockLocationServices = {
    get: jasmine.createSpy().and.callFake(() => retValue),
  };

  const retValue = { $promise: { then: jasmine.createSpy() } };
  let mockViewClaimServiceMock = {
      viewOrPreviewPdf: jasmine.createSpy().and.returnValue(of({}))
    };
    
  let mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(of(true)),
    };
  const mockAdjustmentTypesService = {
    get: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        },
      };
    }),
  };

  const mockCommonServices = {
    Insurance: {
      ClaimPdf: jasmine
        .createSpy("commonServices.Insurance.ClaimPdf")
        .and.returnValue({ then: jasmine.createSpy() }),
    },
  };
  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine
      .createSpy("patSecurityService.IsAuthorizedByAbbreviation")
      .and.returnValue(true),
  };
  const mockModalFactory: any = {
    Modal: jasmine
      .createSpy()
      .and.returnValue([{ isEncounterServices: false }]),
  };
  const res = {};

  const mock$q = {
    defer: jasmine.createSpy("q").and.callFake(() => {
      return {
        then(callback) {
          callback(res);
        },
      };
    }),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientEncounterClaimsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: "referenceDataService", useValue: mockreferenceDataService },
        { provide: "ListHelper", useValue: mockListHelper },
        { provide: "ModalFactory", useValue: mockModalFactory },
        { provide: "toastrFactory", useValue: mockToastrFactory },
        { provide: "$location", useValue: {} },
        { provide: "$q", useValue: mock$q },
        { provide: "patSecurityService", useValue: mockPatSecurityService },
        { provide: "localize", useValue: mockLocalizeService },
        { provide: "AccountNoteFactory", useValue: mockservice },
        { provide: "LocationServices", useValue: mockLocationServices },
        {provide: AdjustmentTypesService,useValue: mockAdjustmentTypesService},
        { provide: "CommonServices", useValue: mockCommonServices },
        { provide: ViewClaimService, useValue: mockViewClaimServiceMock },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService}  
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientEncounterClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("getLocations function ->", function () {
    it("should call locationServices.get", function () {
      component.getLocations();
      expect(mockLocationServices.get).toHaveBeenCalled();
    });
  });

  describe("previewPdf function ->", function () {    
    it ("should call viewClaimService.viewOrPreviewPdf", function () {
      component.enableEliminateStaleClaims = true;
      const claim = { Status: 1, Type: 1, ClaimId: 1, PatientName: "Patient" };
      component.previewPdf(claim);
      expect(mockViewClaimServiceMock.viewOrPreviewPdf).toHaveBeenCalledWith(claim, "Patient", component.enableEliminateStaleClaims);
    });
  });

  describe("getUserLocation function ->", function () {
    it("should call listHelper.findItemByFieldValue", function () {
      sessionStorage.setItem(
        "userLocation",
        JSON.stringify({ userLocationId: { id: 1 } })
      );
      component.getUserLocation();
      expect(mockListHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe("getLocationNameLine1 function ->", function () {
    it("should call listHelper.findItemByFieldValue", function () {
      component.getLocationNameLine1(1);
      expect(mockListHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe("getNameForTheEnteredByUserId function ->", function () {
    it("should call listHelper.findItemByFieldValue", function () {
      component.getNameForTheEnteredByUserId(1);
      expect(mockListHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe("close popover ->", function () {
    it("should close the popover", function () {
      component.closePopOver();
      expect(component.showTemplate).toBe(false);
    });
  });
});
