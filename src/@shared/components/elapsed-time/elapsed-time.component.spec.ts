import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { ElapsedTimeComponent } from './elapsed-time.component';

describe('ElapsedTimeComponent', () => {
    let component: ElapsedTimeComponent;
    let fixture: ComponentFixture<ElapsedTimeComponent>;
    let localize: any;

    const mockLocalizeService: any = {
        getLocalizedString: () => 'Minutes Elapsed'
    };


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ElapsedTimeComponent],
            providers: [{ provide: 'localize', useValue: mockLocalizeService }]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ElapsedTimeComponent);
        // Get an instance of the mocked service from the TestBed for individual tests to use if needed
        localize = TestBed.get('localize');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setElapsedTime function -> ', () => {

        it('setElapsedTime : should set value to component.elapsedTimeString', () => {
            component.startTime = new Date().toDateString();
            component.endTime = undefined;
            component.setElapsedTime();
            expect(component.elapsedTimeString).not.toBeNull();
            expect(component.elapsedTimeString).not.toBeUndefined();
        });

        it('setElapsedTime : should not set value to component.elapsedTimeString', () => {
            component.startTime = null;
            component.setElapsedTime();
            expect(component.elapsedTimeString).not.toBeNull();
            expect(component.elapsedTimeString).not.toBeUndefined();
        });


        it('should set value 1 Minute Elapsed', () => {
            const dateNow = new Date();
            dateNow.setMinutes(dateNow.getMinutes() - 1);
            component.startTime = dateNow.toISOString();
            // A single minute uses the singular form, so spyOn and change whats returned in the mock
            spyOn(localize, 'getLocalizedString').and.returnValue('Minute Elapsed');
            component.setElapsedTime();
            expect(component.elapsedTimeString).toBe('(1 Minute Elapsed)');
        });

        it('should set value to 20 Minutes Elapsed', () => {
            const dateNow = new Date();
            dateNow.setMinutes(dateNow.getMinutes() - 20);
            component.startTime = dateNow.toISOString();
            component.setElapsedTime();
            expect(component.elapsedTimeString).toBe('(20 Minutes Elapsed)');
        });

        it('should add Z to end of startTime if not there', () => {
            const startTime = '2017-08-07T19:19:29.6579187';
            component.startTime = startTime;
            component.endTime = null;
            component.setElapsedTime();
            expect(component.startTime).toBe(startTime + 'Z');

        });

        it('should not add Z to end of startTime if there', () => {
            const startTime = '2017-08-07T19:19:29.6579187Z';
            component.startTime = startTime;
            component.endTime = null;
            component.setElapsedTime();
            expect(component.startTime).toBe(startTime);
        });

    });

});
