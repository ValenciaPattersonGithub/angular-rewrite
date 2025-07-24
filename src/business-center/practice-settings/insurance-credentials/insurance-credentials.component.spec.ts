import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceCredentialsComponent } from './insurance-credentials.component';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { Component, Input } from '@angular/core';
import { InsuranceCredentialsHttpService } from 'src/@core/http-services/insurance-credentials-http.service';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { InsuranceCredentialsDto, IntegrationControlDto, IntegrationControlPutDto } from 'src/@core/models/integration-control.model';
import { IntegrationControlHttpService } from 'src/@core/http-services/integration-control-http.service';
import { RequestIntegrationControlsArgs } from '../../../@core/http-services/integration-control-http.service';

@Component({
  selector: 'app-button',
  template: ''
})
export class MockAppButtonComponent {
  @Input() buttonLabel: string;
  @Input() isDisabled: boolean;
}
describe('InsuranceCredentialsComponent', () => {
  let component: InsuranceCredentialsComponent;
  let fixture: ComponentFixture<InsuranceCredentialsComponent>;
  let mockInsuranceCredentialsHttpService;
  let mockIntegrationControlHttpService;
  let mockToastrFactory;
  let mockDatePipe;
  let mockConfirmationModalService;
  let mockConfirmationRef;
  let mockPatSecurityService;

  beforeEach(() => {
    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: (AccessCode) => {
        if (AccessCode == "soar-biz-bizloc-edit") {
          return true;
        } else {
          return false;
        }
      },
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
    };

    mockConfirmationRef = {
      events: {
        pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
      },
      subscribe: jasmine.createSpy(),
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      _parentOrParents: jasmine.createSpy(),
      closed: jasmine.createSpy(),
    };
    mockConfirmationModalService = jasmine.createSpyObj<ConfirmationModalService>('mockConfirmationModalService', ['open']);

    mockToastrFactory = {
      error: jasmine.createSpy(),
      success: jasmine.createSpy(),
    };

    let mockDatePipe = {
      transform: (res) => { }
    };

    mockInsuranceCredentialsHttpService = {
      requestInsuranceCredentials: jasmine.createSpy('InsuranceCredentialsHttpService.requestInsuranceCredentials').and.returnValue(
        of({
          Value: []
        })),
      processInsuranceCredentialsDto: jasmine.createSpy('InsuranceCredentialsHttpService.processInsuranceCredentialsDto').and.returnValue(
        of({
          Value: []
        })),
    }

    mockIntegrationControlHttpService = {
      requestIntegrationControls: jasmine.createSpy('IntegrationControlHttpService.requestIntegrationControls').and.returnValue(
        of({
          Value: []
        })),
      processIntegrationControls: jasmine.createSpy('IntegrationControlHttpService.processIntegrationControls').and.returnValue(
        of({
          Value: []
        })),
      deleteIntegrationControls: jasmine.createSpy('IntegrationControlHttpService.deleteIntegrationControls').and.returnValue(
        of({
          Value: []
        })),
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        AppButtonComponent,
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: InsuranceCredentialsHttpService, useValue: mockInsuranceCredentialsHttpService },
        { provide: IntegrationControlHttpService, useValue: mockIntegrationControlHttpService },
      ],
      declarations: [InsuranceCredentialsComponent, MockAppButtonComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.vendor = 'DentalXchange';
    component.locationId = 11;
    component.feature = 'ClaimAttachments';
 
  });

    afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleInsuranceCredentials', () => {
    beforeEach(() => {
      spyOn(component, 'saveIntegrationControls');
      spyOn(component, 'confirmActivateInsuranceCredentials');
      spyOn(component, 'setActiveForm');
      spyOn(component, 'confirmDeactivateInsuranceCredentials');
    }); 

    it('should not call confirmActivateInsuranceCredentials if event.currentTarget.checked is true and editCredentials is true', () => {
      component.editCredentials = true;
      let event = {
        currentTarget: {
          checked: true
        }
      }
      component.toggleInsuranceCredentials(event);
      expect(component.confirmActivateInsuranceCredentials).not.toHaveBeenCalled();
      expect(component.saveIntegrationControls).toHaveBeenCalled();
    });

    it('should call confirmActivateInsuranceCredentials if event.currentTarget.checked is true and editCredentials is false', () => {
      component.editCredentials = false;
      let event = {
        currentTarget: {
          checked: true
        }
      }
      component.toggleInsuranceCredentials(event);
      expect(component.confirmActivateInsuranceCredentials).toHaveBeenCalled();
    });

    it('should call confirmDeactivateInsuranceCredentials if event.currentTarget.checked is false', () => {      
      let event = {
        currentTarget: {
          checked: false
        }
      }
      component.toggleInsuranceCredentials(event);
      expect(component.confirmDeactivateInsuranceCredentials).toHaveBeenCalled();
    });
  })

  describe('getInsuranceCredentials', () => {

    beforeEach(() => {
      spyOn(component, 'loadCredentials');
      spyOn(component, 'setActiveForm');
      component.integrationIsActive = true;
    });
    
    it('should call InsuranceCredentialsHttpService.requestInsuranceCredentials with requestargs', () => {
      component.getInsuranceCredentials();
      expect(mockInsuranceCredentialsHttpService.requestInsuranceCredentials).toHaveBeenCalledWith({ locationId: 11, vendor: 'DentalXchange' });
    });

    it('should call setActiveForm form if InsuranceCredentialsHttpService.requestInsuranceCredentials returns credentials', () => {
      mockInsuranceCredentialsHttpService.requestInsuranceCredentials.and.returnValue(of({ Result: [{ UserName: 'zorro', Password: 'dfadfmmmmm' }] }));
      component.getInsuranceCredentials();
      expect(component.loadCredentials).toHaveBeenCalledWith({ Result: [{ UserName: 'zorro', Password: 'dfadfmmmmm' }] });
      expect(component.setActiveForm).toHaveBeenCalled();
      expect(component.showUpdateButton).toBe(true);
      expect(component.editCredentials).toBe(true);
    });
  })

  describe('saveInsuranceCredentials', () => {
    beforeEach(() => {
      component.frmInsuranceCredentials = new FormGroup({
        UserName: new FormControl('zorro'),
        Password: new FormControl('xyzlmnpo'),
      });
      component.integrationIsActive = true;
      component.insuranceCredentials = new InsuranceCredentialsDto();
      spyOn(component, 'saveIntegrationControls');
      spyOn(component, 'getInsuranceCredentials');
      
    });

    it('should not call InsuranceCredentialsHttpService.processInsuranceCredentialsDto if validateForm returns false ', () => {
      spyOn(component, 'validateForm').and.returnValue(false);
      expect(mockInsuranceCredentialsHttpService.processInsuranceCredentialsDto).not.toHaveBeenCalled();
    });

    it('should call InsuranceCredentialsHttpService.processInsuranceCredentialsDto with attachementCredentials if validateForm returns true', () => {
      spyOn(component, 'validateForm').and.returnValue(true);
      component.saveInsuranceCredentials();
      expect(mockInsuranceCredentialsHttpService.processInsuranceCredentialsDto).toHaveBeenCalled();
    });    

    it('should call getInsuranceCredentials if InsuranceCredentialsHttpService.processInsuranceCredentialsDto is successful', () => {
      const creds = {UserName:'Bob'}
      mockInsuranceCredentialsHttpService.processInsuranceCredentialsDto.and.returnValue(of({ Value: creds }));
      component.saveInsuranceCredentials();    
      expect(component.getInsuranceCredentials).toHaveBeenCalled();
    });

    it('should call toastr error if InsuranceCredentialsHttpService.processInsuranceCredentialsDto fails', () => {
      mockInsuranceCredentialsHttpService.processInsuranceCredentialsDto.and.returnValue(throwError('err'));
      component.saveInsuranceCredentials();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  })

  describe('cancel', () => {

    beforeEach(() => {
      component.insuranceCredentials = {
        UserName: '',
        Password: '',
        DateLastModified: null
      }
      component.frmInsuranceCredentials = new FormGroup({
        UserName: new FormControl('zorro'),
        Password: new FormControl('xyzlmnpo'),
      });
      component.insuranceCredentials = new InsuranceCredentialsDto();
    });
    it('should set showUpdateButton to true if editCredentials is true', () => {
      component.editCredentials = true;
      component.cancel();
      expect(component.showUpdateButton).toEqual(true);
    });
    it('should set showUpdateButton to false if editCredentials is false', () => {
      component.editCredentials = false;
      component.cancel();
      expect(component.showUpdateButton).toEqual(false);
    });
    it('should set frmInsuranceCredentials to original values', () => {
      component.editCredentials = false;
      component.cancel();
      expect(component.frmInsuranceCredentials.controls.UserName.value).toEqual('');
      expect(component.frmInsuranceCredentials.controls.Password.value).toEqual('');
    });
  });

  describe('validateForm', () => {

    beforeEach(() => {
      component.frmInsuranceCredentials = new FormGroup({
        UserName: new FormControl('zorro'),
        Password: new FormControl('xyzlmnpo'),
      });
      component.insuranceCredentials = new InsuranceCredentialsDto();
    });
    it('should call set component.attachementCredentials to form values if component.integrationIsActive is true;', () => {
      component.integrationIsActive = true;
      component.validateForm();
      expect(component.insuranceCredentials.UserName).toEqual('zorro')
      expect(component.insuranceCredentials.Password).toEqual('xyzlmnpo')
    });

    it('should return true if credentials are valid regardless', () => {
      expect(component.validateForm()).toEqual(true);
    });

    it('should return false if credentials are not valid and integrationIsActive is true', () => {
      component.integrationIsActive = true;
      component.frmInsuranceCredentials = new FormGroup({
        UserName: new FormControl(''),
        Password: new FormControl('xyzlmnpo'),
      });
      expect(component.validateForm()).toEqual(false);
    });

    it('should return true if integrationIsActive is false', () => {
      component.integrationIsActive = false;
      component.frmInsuranceCredentials = new FormGroup({
        UserName: new FormControl(''),
        Password: new FormControl('xyzlmnpo'),
      });
      expect(component.validateForm()).toEqual(true);
    });

  })

  describe('confirmActivateInsuranceCredentials', () => {

    it('should call modal to ask user to confirm cancel', () => {
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockConfirmationRef);
      component.confirmActivateInsuranceCredentials();
      expect(mockConfirmationModalService.open).toHaveBeenCalled();
    });
  });

  describe('confirmDeactivateInsuranceCredentials', () => {

    it('should call modal to ask user to confirm cancel', () => {
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockConfirmationRef);
      component.confirmDeactivateInsuranceCredentials();
      expect(mockConfirmationModalService.open).toHaveBeenCalled();
    });
  });

  describe('getIntegrationControl', () => {
    let integrationControls : IntegrationControlDto[] = [];
    beforeEach(() => {     
      spyOn(component, 'getInsuranceCredentials');
      const integrationControl = new IntegrationControlDto();
      integrationControl.ApplicationID = 2;
        integrationControl.Vendor = 'DentalXchange'
      integrationControl.EndDateTimeUTC = new Date();
      integrationControl.StartDateTimeUTC = new Date();
      integrationControl.Feature = 'InsuranceServices';
      integrationControl.LocationId = 11;
      integrationControls.push(integrationControl);
    });
    it('should call integrationControlHttpService.requestIntegrationControls with locationId', () => {
      component.getIntegrationControl();
      expect(mockIntegrationControlHttpService.requestIntegrationControls).toHaveBeenCalledWith({ locationId: 11});
    });

      it(`should set integrationIsActive to true
       if integrationControlHttpService.requestIntegrationControls returns list of IntegrationControlDto containing InsuranceServices`, () => {
      mockIntegrationControlHttpService.requestIntegrationControls.and.returnValue(of({ Value: integrationControls }));
      component.getIntegrationControl();
      expect(component.integrationIsActive).toBe(true); 
    });

      it(`should set integrationIsActive to false
       if integrationControlHttpService.requestIntegrationControls returns empty list`, () => {
      mockIntegrationControlHttpService.requestIntegrationControls.and.returnValue(of({ Value: [] }));
      component.getIntegrationControl();
      expect(component.integrationIsActive).toBe(false); 
    });

    it('should call toastr.error if IntegrationControlHttpService.requestIntegrationControls returns error ', () => {
      mockIntegrationControlHttpService.requestIntegrationControls.and.returnValue(throwError('err'));
      component.getIntegrationControl();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  })

  describe('deleteIntegrationControls', () => { 
    it('should call integrationControlHttpService.deleteIntegrationControls', () => {
      component.deleteIntegrationControls();
      expect(mockIntegrationControlHttpService.deleteIntegrationControls).toHaveBeenCalledWith({ locationId: component.locationId, vendor: component.vendor, feature: component.feature });
    });

    it('should call toastr.error if IntegrationControlHttpService.deleteIntegrationControls returns error ', () => {
      mockIntegrationControlHttpService.deleteIntegrationControls.and.returnValue(throwError('err'));
      component.deleteIntegrationControls();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should call set integrationIsActive to true if IntegrationControlHttpService.deleteIntegrationControls returns error ', () => {
      component.integrationIsActive = false;
      mockIntegrationControlHttpService.deleteIntegrationControls.and.returnValue(throwError('err'));
      component.deleteIntegrationControls();
      expect(component.integrationIsActive).toBe(true);
    });
  });

  describe('saveIntegrationControls', () => {     
    beforeEach(() => {  
      spyOn(component, 'getInsuranceCredentials');
      //spyOn(component, 'getIntegrationControl');      
    });

    it('should call integrationControlHttpService.processIntegrationControls', () => {
      component.feature = 'Insurance';
      const mockArgs: RequestIntegrationControlsArgs = {
        locationId: component.locationId,
        vendor: component.vendor, 
        feature: component.feature
      };      
      const mockIntegrationControlPutDto = new IntegrationControlPutDto();
      mockIntegrationControlPutDto.ApplicationID = 2;
      mockIntegrationControlPutDto.Vendor = 'DentalXchange';
      mockIntegrationControlPutDto.Feature = component.feature;
      mockIntegrationControlPutDto.Config = '';
      component.saveIntegrationControls();
      expect(mockIntegrationControlHttpService.processIntegrationControls).toHaveBeenCalledWith(mockArgs, mockIntegrationControlPutDto);
    });

    it('should call toastr.error if IntegrationControlHttpService.processIntegrationControls returns error ', () => {
      mockIntegrationControlHttpService.processIntegrationControls.and.returnValue(throwError('err'));
      component.saveIntegrationControls();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should call set integrationIsActive to true if IntegrationControlHttpService.processIntegrationControls returns error ', () => {
      component.integrationIsActive = false;
      mockIntegrationControlHttpService.processIntegrationControls.and.returnValue(throwError('err'));
      component.saveIntegrationControls();
      expect(component.integrationIsActive).toBe(true);
    });
  });

});
