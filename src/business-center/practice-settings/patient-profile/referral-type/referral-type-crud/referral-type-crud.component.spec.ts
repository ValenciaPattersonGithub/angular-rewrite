import { ReferralTypeCrudComponent } from './referral-type-crud.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';
import { ReferralResponse, SoarResponse } from 'src/@core/models/core/soar-response';
import { ReferralType } from '../referral-type.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { HttpClient } from '@microsoft/signalr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

let referralTypesService : any;
describe('ReferralTypeCrudComponent', () => {

    let component: ReferralTypeCrudComponent;
    let fixture: ComponentFixture<ReferralTypeCrudComponent>;
    let httpClient: HttpClient;
    let toastrFactory: any;
    let referralTypeService: any;
    let practiceService: any;
    let dialogservice: DialogService;

    let mockPracticeService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 1 })
    };

    const mockreferralTypeService = {
        GetAllReferralTypesAsync: () => { },
        create: () => { },
        update: () => { },
        delete: () => { },
        GetReferralTypeById: () => { },
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')

    };
    const mockDialogRef = {
        close: () => of({}),
        open: (dialogResult: any) => { },
        content: {
            instance: {
                title: ''
            }
        }
    }
    const mockReferralTypeValue: ReferralType = {
        referralTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de026',
        address1: "Address1",
        address2: 'Address2',
        city: 'City',
        dataTag: 'AAAAAAAAiRA=',
        dateModified: '2019-10-30T09:16:33.7132509',
        emailAddress: 'test@yml.co',
        firstName: 'FirstName',
        isDeleted: false,
        lastName: 'LastName',
        phone: '1234567890',
        practiceName: 'PracticeName',
        referralSourceType: 1,
        state: 'AL',
        zipCode: '123456',
        status: true,
        userModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
    };
    const mockEditReferralType = {
        ReferralTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de026',
        address1: "Address1",
        address2: 'Address2',
        city: 'City',
        dataTag: 'AAAAAAAAiRA=',
        dateModified: '2019-10-30T09:16:33.7132509',
        email: 'test@yml.co',
        firstName: 'FirstName',
        isDeleted: false,
        lastName: 'LastName',
        phone: '1234567890',
        practiceName: 'PracticeName',
        referralSourceType: 1,
        state: 'AL',
        zipCode: '123456',
        status: true,
        userModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
    };
    const mockReferralTypesList = {
        ExtendedStatusCode: null,
        Value: [{
            ReferralTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de030',
            address1: "Address11",
            address2: 'Address12',
            city: 'City1',
            dataTag: 'AAAAAAAAiRA=',
            dateModified: '2019-10-30T09:16:33.7132509',
            email: 'test@yml.co',
            firstName: 'FirstName',
            isDeleted: false,
            lastName: 'LastName',
            phone: '1234567890',
            practiceName: 'PracticeName',
            referralSourceType: 1,
            state: 'AL',
            zipCode: '123456',
            status: true,
            userModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
        },
        {
            ReferralTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de025',
            address1: "Address21",
            address2: 'Address22',
            city: 'City2',
            dataTag: 'AAAAAAAAiRA=',
            dateModified: '2019-10-30T09:16:33.7132509',
            email: 'test@yml.co',
            firstName: 'FirstName2',
            isDeleted: false,
            lastName: 'LastName2',
            phone: '1234567890',
            practiceName: 'PracticeName2',
            referralSourceType: 1,
            state: 'AL',
            zipCode: '123456',
            status: true,
            userModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
        },
        {
            ReferralTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de028',
            address1: "Address31",
            address2: 'Address32',
            city: 'City',
            dataTag: 'AAAAAAAAiRA=',
            dateModified: '2019-10-30T09:16:33.7132509',
            email: 'test@yml.co',
            firstName: 'FirstName3',
            isDeleted: false,
            lastName: 'LastName3',
            phone: '1234567890',
            practiceName: 'PracticeName',
            referralSourceType: 1,
            state: 'AL',
            zipCode: '123456',
            status: true,
            userModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
        }]
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DropDownsModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule,TranslateModule.forRoot()],
            declarations: [ReferralTypeCrudComponent],
            providers: [
                ReferralManagementHttpService,
                HttpClient,
                DialogService,
                DialogContainerService,
                { provide: 'ReferralTypeService', useValue: mockreferralTypeService },
                { provide: 'ReferralSourcesService', useValue: {} },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: 'SoarConfig', useValue: {} },
                FormBuilder
            ],

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferralTypeCrudComponent);
        referralTypesService = TestBed.get('ReferralTypeService'),
        component = fixture.componentInstance;
        httpClient = TestBed.inject(HttpClient);
        dialogservice = TestBed.get(DialogService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('createFormControls', () => {
        it('should create FormControls when ReferralType passed', () => {
            component.createFormControls(mockEditReferralType);
            const firstName = component.addReferralType.controls.firstName;
            expect(firstName).toBeDefined();
            const lastName = component.addReferralType.controls.lastName;
            expect(lastName).toBeDefined();
            const city = component.addReferralType.controls.city;
            expect(city).toBeDefined();
            const state = component.addReferralType.controls.state;
            expect(state).toBeDefined();
        });
    });

    describe('CancelAddReferralType', () => {
        it('should reset addReferralType when CancelAddReferralType called', () => {
            component.CancelAddReferralType();
        });
    });

    describe('updateReferralType', () => {
        it('should call ReferralTypesService.update when saveReferralType called', () => {
            component.createFormControls(mockEditReferralType);
            component.dialog.content.instance.ReferralType = mockEditReferralType;
            spyOn(referralTypesService, 'update').and.returnValue(Promise.resolve({ Value: mockEditReferralType }));
            component.saveReferralType();
            referralTypesService.update(mockEditReferralType)
                .then((result: ReferralResponse<ReferralType>) => {
                    component.onSuccessEdit(result);
                }, () => {
                });
            expect(referralTypesService.update);
        });
        it('should reset addReferralType when updateReferralTypeSuccess called', () => {
            component.createFormControls(mockEditReferralType);
            component.dialog.content.instance.ReferralType = mockEditReferralType;
            spyOn(referralTypesService, 'update').and.returnValue(Promise.resolve({
                data: {
                    InvalidProperties: [{
                        ValidationMessage:
                            'There was an error and your Referral source was not updated.'
                    }]
                }
            }));
            component.saveReferralType();
            referralTypesService.update(mockEditReferralType)
                .then((result: ReferralResponse<ReferralType>) => {
                    component.onFailureEdit();
                }, () => {
                });
            expect(referralTypesService.update);
        });
    });

    describe('saveReferralType', () => {
        it('should call ReferralTypesService.save when saveReferralType called', () => {
            spyOn(referralTypesService, 'create').and.returnValue(Promise.resolve({ Value: mockReferralTypeValue }));

            component.saveReferralType();
            referralTypesService.create(mockReferralTypeValue)
                .then((result: ReferralResponse<ReferralType>) => {
                    component.onSuccess(result);
                }, () => {
                });
            expect(referralTypesService.create);
        });

        it('should call saveReferralTypeFailure when ReferralTypesService.save return Promise.reject', () => {
            spyOn(referralTypesService, 'create').and.returnValue(Promise.reject());
            component.saveReferralType();
            referralTypesService.create(mockReferralTypeValue)
                .then((result: ReferralResponse<ReferralType>) => {
                    if (result) {
                        expect(mockTostarfactory.success).toHaveBeenCalled();
                    }
                }, () => {
                    component.onFailure();
                });
            expect(referralTypesService.create);
        });

        it('should call ReferralTypesService.save when editReferralType called', () => {
            component.dialog.content.instance.ReferralType = mockEditReferralType;
            spyOn(referralTypesService, 'update').and.returnValue(Promise.resolve({ Value: mockReferralTypeValue }));
            component.saveReferralType();
            referralTypesService.update(mockReferralTypeValue)
                .then((result: ReferralResponse<ReferralType>) => {
                    component.onSuccessEdit(result);
                }, () => {
                });
            expect(referralTypesService.update);
        });
    });
});

