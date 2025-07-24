import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { SolutionReachComponent } from './solution-reach.component';
const mockpatAuthenticationService = {
    getCachedToken: () => { }
};

describe('SolutionReachComponent', () => {
    let component: SolutionReachComponent;
    let fixture: ComponentFixture<SolutionReachComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: 'patAuthenticationService', useValue: mockpatAuthenticationService }
            ],
            declarations: [SolutionReachComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SolutionReachComponent);
        component = fixture.componentInstance;
        component.solutionReachUrl = '';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
