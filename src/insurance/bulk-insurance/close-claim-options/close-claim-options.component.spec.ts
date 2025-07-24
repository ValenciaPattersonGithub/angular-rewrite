import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';

import { CloseClaimOptionsComponent } from './close-claim-options.component';
import { CONFIRMATION_MODAL_DATA } from '../../../@shared/components/confirmation-modal/confirmation-modal.data';
import { TranslateModule } from '@ngx-translate/core';

describe('CloseClaimOptionsComponent', () => {
    let component: CloseClaimOptionsComponent;
    let fixture: ComponentFixture<CloseClaimOptionsComponent>;
    const mockService = {};
    let confirmationModalData ={}
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot()
              ],
            providers: [
                { provide: ConfirmationModalOverlayRef, useValue: mockService },
                { provide: CONFIRMATION_MODAL_DATA, useValue: confirmationModalData },
            ],
            declarations: [CloseClaimOptionsComponent]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CloseClaimOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
