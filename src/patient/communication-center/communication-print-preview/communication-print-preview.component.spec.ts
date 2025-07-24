import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { CommunicationCenterPreviewpaneComponent } from '../communication-center-previewpane/communication-center-previewpane.component';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { CommunicationPrintPreviewComponent } from './communication-print-preview.component';
import { configureTestSuite } from 'src/configure-test-suite';

describe('CommunicationPrintPreviewComponent', () => {
    let component: CommunicationPrintPreviewComponent;
    let fixture: ComponentFixture<CommunicationPrintPreviewComponent>;
    const mockRouteParams = {
        patientId: '4321'
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [CommunicationPrintPreviewComponent, CommunicationCenterPreviewpaneComponent,
                EnumAsStringPipe, AppButtonComponent],
            providers: [
                { provide: '$routeParams', useValue: mockRouteParams }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationPrintPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
