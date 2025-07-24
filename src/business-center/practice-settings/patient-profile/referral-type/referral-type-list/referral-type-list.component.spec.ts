import { ReferralTypeListComponent } from './referral-type-list.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockRepository } from '../referral-type-mock-repo';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { SearchPipe, HighlightTextIfContainsPipe, OrderByPipe } from 'src/@shared/pipes';
import { CUSTOM_ELEMENTS_SCHEMA, ViewContainerRef } from '@angular/core';
import { of } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ReferralType } from '../referral-type.model';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationModalService } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.service';


let localize;
let referralTypeService;
let patSecurityService;
let toastrFactory;
let dialogservice: DialogService;
let containerRef: ViewContainerRef;
let referralType = {
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

const mockTostarfactory = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message')

};

const mockConfirmationModalService = {
    open: jasmine.createSpy().and.returnValue({
        events: {
            pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
        },
        subscribe: jasmine.createSpy(),
        closed: jasmine.createSpy(),
    }),
};


describe('ReferralTypeListComponent', () => {
    let component: ReferralTypeListComponent;
    let fixture: ComponentFixture<ReferralTypeListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [ReferralTypeListComponent, OrderByPipe],
            providers: [
                DialogService,
                DialogContainerService,
                { provide: 'ReferralTypeService', useValue: MockRepository.mockreferralTypeService },
                { provide: 'localize', useValue: MockRepository.mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'patSecurityService', useValue: MockRepository.mockpatSecurityService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: 'SoarConfig', useValue: {} }

            ],

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferralTypeListComponent);
        component = fixture.componentInstance;
        component.referralType = [];
        component.referralType.push(referralType);
        referralTypeService = TestBed.get('ReferralTypeService'),
            patSecurityService = TestBed.get('patSecurityService');
        dialogservice = TestBed.get(DialogService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('editReferralType', () => {
        it('should edit Referral Type', () => {
            component.hasEditAccess = true;
            component.defaultOrderKey = 'Description';
            MockRepository.mockEditReferralType.status = false;
            MockRepository.mockEditReferralType.referralSourceType = 1;
            spyOn(dialogservice, 'open').and.returnValue({ content: { instance: {} }, result: of(MockRepository.mockEditReferralType) });
            component.editReferralType(MockRepository.mockEditReferralType);
        });
    });

    describe('filterReferralTypes', () => {
        it('should return all referral types when select target value all', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { value: 'all' } };
            component.filter(event, 'referralFilter');
        });
        it('should return referral types when select target value refIn', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { value: 'refIn' } };
            component.filter(event, 'referralFilter');
        });

        it('should return referral types when select target value refOut', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { value: 'refOut' } };
            component.filter(event, 'referralFilter');
        });

        it('should return referral types when select target value both', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { value: 'both' } };
            component.filter(event, 'referralFilter');
        });


        it('should return referral types when select Status Show Inactive', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { checked: true } };
            component.filter(event, 'optActive');
        });

        it('should return referral types when select Status Show Active', () => {
            component.referralType = MockRepository.mockReferralTypesList.Value;
            component.referralTypeGrid = MockRepository.mockReferralTypesList.Value;
            component.filteredReferralTypes = MockRepository.mockReferralTypesList.Value;
            const event = { target: { checked: false } };
            component.filter(event, 'optActive');
        });

    });
});
