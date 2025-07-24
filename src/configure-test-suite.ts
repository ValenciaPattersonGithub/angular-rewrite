import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import {} from 'jasmine';
/**
 * Reconfigures current test suit to prevent angular components re-compilation after every test run.
 * Forces angular test bed to re-create zone and all injectable services by directly
 * setting _instantiated variable to false after every test run.
 * Cleanups all the changes and reverts test bed configuration after suite has finished.
 *
 * @param configureAction an optional delegate which can be used to configure test bed for the current test suite
 * directly in the configureTestSuite call (you don't need extra BeforeAll in this case)
 */
export const configureTestSuite = (configureAction?: () => void) => {
    const testBedApi: any = getTestBed();
    const originReset = TestBed.resetTestingModule;

    beforeAll(() => {
        TestBed.resetTestingModule();
        TestBed.resetTestingModule = () => TestBed;
    });

    if (configureAction) {
        beforeAll((done: DoneFn) => (async () => {
            configureAction();
            await TestBed.compileComponents();
        })().then(done).catch(done.fail));
    }

    afterEach(() => {
        testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
        // reset ViewEngine TestBed
        testBedApi._instantiated = false;
        // reset Ivy TestBed
        testBedApi._testModuleRef = null;
    });

    afterAll(() => {
        TestBed.resetTestingModule = originReset;
        TestBed.resetTestingModule();
    });
};
