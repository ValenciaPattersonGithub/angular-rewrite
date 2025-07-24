import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileSectionComponent } from './profile-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

describe('ProfileSectionComponent', () => {
    let component: ProfileSectionComponent;
    let fixture: ComponentFixture<ProfileSectionComponent>;

    const mockservice = {
        isEnabled: () => new Promise((resolve, reject) => {
        }),
    };

    const mockFeatureFlagService = {
        getOnce$: jasmine.createSpy('getOnce$').and.returnValue(of(true))
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ProfileSectionComponent],
            imports: [TranslateModule.forRoot()], // Required import for components that use ngx-translate in the view or component code
            providers: [
                { provide: 'FeatureService', useValue: mockservice },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileSectionComponent);
        component = fixture.componentInstance;
        component.sectionTitle = 'Pending Encounters  ';
        component.count = '(1)';
        fixture.detectChanges();

     
           
    });

    it('should create', () => {
        expect(component).toBeTruthy();       
        const board = fixture.debugElement.query(By.css('h4')).nativeElement;
        expect(board.textContent).toBe('Pending Encounters   (1)');
       

    });
});
