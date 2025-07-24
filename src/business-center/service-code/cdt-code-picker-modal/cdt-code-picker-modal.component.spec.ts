import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';
import { CDTCodeModel } from '../cdtcodepickermodel';
import { CdtCodePickerModalComponent } from './cdt-code-picker-modal.component';
import { Search1Pipe } from 'src/@shared/pipes';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CdtCodeService } from '../../../@shared/providers/cdt-code.service';


let dialogservice: DialogService;
let dialogRef: DialogRef;

let CDTCodeData: CDTCodeModel[] = [{
    AffectedAreaId: 1,
    CdtCodeId: "3a19780a-cea2-41f0-9d02-946422a4f5f5",
    Code: "D0140",
    DataTag: "AAAAAACFqHU=",
    DateModified: "2016-11-11T18:17:08.1363535",
    Description: "limited oral evaluation - problem focused",
    DisplayAs: "LimEx",
    IconName: "D0140_limited_ora_evaluation_problem_focused",
    ServiceTypeId: "174a72df-c300-40ac-a6b8-96e8f7410e98",
    SubmitOnInsurance: true,
    TaxableServiceTypeId: 1,
    UserModified: "00000000-0000-0000-0000-000000000000"
}];

let CDTServiceResponse = {
    Value: [{
        AffectedAreaId: 1,
        CdtCodeId: "3a19780a-cea2-41f0-9d02-946422a4f5f5",
        Code: "D0140",
        DataTag: "AAAAAACFqHU=",
        DateModified: "2016-11-11T18:17:08.1363535",
        Description: "limited oral evaluation - problem focused",
        DisplayAs: "LimEx",
        IconName: "D0140_limited_ora_evaluation_problem_focused",
        ServiceTypeId: "174a72df-c300-40ac-a6b8-96e8f7410e98",
        SubmitOnInsurance: true,
        TaxableServiceTypeId: 1,
        UserModified: "00000000-0000-0000-0000-000000000000"
    }]
}

const mockCdtCodeService = {
    getList: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
            resolve({ Value: CDTServiceResponse }),
                reject({}) ;
        });
    }),
};

const mockDialogRef = {
    close: () => of({}),
    open: (dialogResult) => { },
    content: {
        instance: {
            title: ''
        }
    },
    result:  of({})
}

const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};

const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};


describe('CdtCodePickerModalComponent', () => {
    let component: CdtCodePickerModalComponent;
    let fixture: ComponentFixture<CdtCodePickerModalComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [DialogService, DialogContainerService,Search1Pipe,
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: CdtCodeService, useValue: mockCdtCodeService },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: 'SoarConfig', useValue: {} }            ],
            declarations: [CdtCodePickerModalComponent, Search1Pipe]
        })
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CdtCodePickerModalComponent);
        component = fixture.componentInstance;
        dialogservice = TestBed.get(DialogService);
        dialogRef = TestBed.get(DialogRef);
        spyOn(dialogservice, 'open').and.returnValue({ content: component.templateElement, result: of({}) });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        it('should call getList method', () => {
            component.getList = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getList).toHaveBeenCalled();
        });
    });



    describe('getFilterCDTLength', () => {
        beforeEach(() => {
            component.cdtCodes = CDTCodeData;
        })
        it('should filter data length as per input', () => {
            component.getFilterCDTLength("140");
            expect(component.filterCDTCodes.length).toEqual(1);

            component.getFilterCDTLength("141");
            expect(component.filterCDTCodes.length).toEqual(0);
        });

        it('should filter data length and original data length must be equal in case of blank input', () => {
            component.getFilterCDTLength("");
            expect(component.filterCDTCodes.length).toEqual(component.cdtCodes.length);
        });
    });

    describe('cdtCodeGetAllSuccess ->', () => {
        it('should set data from response', () => {
            component.getList();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.cdtCodeGetAllSuccess(CDTServiceResponse)).toHaveBeenCalled();
                expect(component.cdtCodes).toEqual(CDTServiceResponse.Value);
            })
        });
    });

    describe('cdtCodeGetAllFailure', () => {
        it('should display toast error', function () {
            component.cdtCodeGetAllFailure();            
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('close -> ', () => {
        it('should close the dialog', () => {
            component.dialog = TestBed.get(DialogRef);
            component.close();
        });
    });

    describe('getList', () => {
        it('should call cdtCodeGetAllSuccess => ()', function () {
            spyOn(component, 'cdtCodeGetAllSuccess').and.callFake(() => { });
            const promise = mockCdtCodeService.getList();
            component.getList();
            promise.then((res) => {
                expect(mockCdtCodeService.getList).toHaveBeenCalled();
                component.cdtCodeGetAllSuccess(res);
                expect(component.cdtCodeGetAllSuccess).toHaveBeenCalled();
            }, (error) => {
                spyOn(component, 'cdtCodeGetAllFailure').and.callFake(() => { });
                expect(component.cdtCodeGetAllFailure).toHaveBeenCalled();
            });
        });
    });

    describe('changeSortingForGrid -> ', () => {
        it('should set asc to false if field is same', () => {
            component.orderBy.field = 'Description';
            component.changeSortingForGrid('Description');
        });

        it('should set asc to true if field is different', () => {
            component.orderBy.field = 'Description';
            component.changeSortingForGrid('Name');
        });
    });

    describe('onSelectCode -> ', () => {
        it('should close the dialog', () => {
            component.dialog = TestBed.get(DialogRef);
            component.close();
            component.onSelectCode('D0123');
        });
    });

    describe('openPreviewDialog ->', () => {
        it('should open a dialog', () => {            
            dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            fixture.detectChanges();
            component.openPreviewDialog();           
            expect(dialogservice.open).toHaveBeenCalled();
        });
    });

});
