import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { WaitOverlayComponent } from './wait-overlay.component';

describe('WaitOverlayComponent', () => {
    let component: WaitOverlayComponent;
    let fixture: ComponentFixture<WaitOverlayComponent>;
    const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    const mockWaitOverlayData = {header:'', message:'', message2:''};
    
    beforeEach(() => {
        component = new WaitOverlayComponent(
            mockTranslateService,mockWaitOverlayData

        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
