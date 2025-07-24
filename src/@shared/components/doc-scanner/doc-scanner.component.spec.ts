import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocScannerComponent } from './doc-scanner.component';
import { DocScanControlService } from './doc-scan-control.service';
import { configureTestSuite } from 'src/configure-test-suite';

describe('DocScannerComponent ->', () => {
    let component: DocScannerComponent;
    let fixture: ComponentFixture<DocScannerComponent>;
    let controlService: DocScanControlService;
    let controlServiceStub = {
        scanSuccess$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
        scanFailure$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [DocScannerComponent],
            providers: [
                { provide: DocScanControlService, useValue: controlServiceStub }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DocScannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        controlService = TestBed.get(DocScanControlService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call subscribe on service observers', () => {
        expect(controlService.scanSuccess$.subscribe).toHaveBeenCalled();
        expect(controlService.scanFailure$.subscribe).toHaveBeenCalled();
    });

    describe('scanAddPage function ->', () => {

        beforeEach(() => {
            controlService.addPage = jasmine.createSpy();
        });

        it('should call controlService.addPage', () => {
            component.scanAddPage();

            expect(controlService.addPage).toHaveBeenCalled();
        });

    });

    describe('ngOnDestroy function ->', () => {

        beforeEach(() => {
            component.scanSuccessSubscription.unsubscribe = jasmine.createSpy();
            component.scanFailureSubscription.unsubscribe = jasmine.createSpy();
        });

        it('should call controlService.addPage', () => {
            component.ngOnDestroy();

            expect(component.scanSuccessSubscription.unsubscribe).toHaveBeenCalled();
            expect(component.scanFailureSubscription.unsubscribe).toHaveBeenCalled();
        });

    });

});
