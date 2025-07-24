import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { PracticeInformationComponent } from './practice-information.component';
import { of } from 'rxjs';
import { AppToggleComponent } from 'src/@shared/components/form-controls/toggle/toggle.component';
import { MfaSettingsService, MFASettingsResponse } from '../service/mfa-settings.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('PracticeInformationComponent', () => {
    let component: PracticeInformationComponent;
    let fixture: ComponentFixture<PracticeInformationComponent>;
    const httpClientMock = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    let de: DebugElement;

    //#Region mock
    let mockData;
    let mockUltRes;
    let mockLocalizeService;
    let mockservice;
    let mockPracticeService;
    let mockUriService;
    let mockEnterpriseSettingService;
    let mockPatSecurityService;
    let mockSoarConfig;
    let mockFuseFlag;
    let mockMfaSettingsService;

    const userContext = '{"Result": {"User": "101"}}';

    //End region

    beforeEach(async () => {
        mockData = {
            Result: {
                DataTag: "AAAAAACRZ+8=",
                DateModified: "2017-04-01T04:05:26.982503",
                Description: "Default Practice - MB",
                LegacyId: "",
                MerchantId: "",
                Name: "Default Practice - MB",
                PracticeId: 322,
                PrimaryContactAddress1: "",
                PrimaryContactAddress2: "",
                PrimaryContactCity: "",
                PrimaryContactCountry: "",
                PrimaryContactEmail: "",
                PrimaryContactName: "",
                PrimaryContactPhone1: "",
                PrimaryContactPhone1Description: "",
                PrimaryContactPhone1SupportsTextMsg: false,
                PrimaryContactPhone2: "",
                PrimaryContactPhone2Description: "",
                PrimaryContactPhone2SupportsTextMsg: false,
                PrimaryContactPostalCode: "",
                PrimaryContactStateProvince: "",
                SAPCustomerId: "0000000000",
                SecondaryContactAddress1: "",
                SecondaryContactAddress2: "",
                SecondaryContactCity: "",
                SecondaryContactCountry: "",
                SecondaryContactEmail: "",
                SecondaryContactName: "",
                SecondaryContactPhone1: "",
                SecondaryContactPhone1Description: "",
                SecondaryContactPhone1SupportsTextMsg: false,
                SecondaryContactPhone2: "",
                SecondaryContactPhone2Description: "",
                SecondaryContactPhone2SupportsTextMsg: false,
                SecondaryContactPostalCode: "",
                SecondaryContactStateProvince: "",
                Status: 0,
                Timezone: "Central Standard Time",
                UserModified: "00000000-0000-0000-0000-000000000000"
            }
        }

        mockUltRes = {
            applicationID: 1,
            createDate: '',
            createUser: '',
            dataTag: '',
            enterpriseID: '',
            modifiedDate: '',
            modifiedUser: '',
            settingName: '',
            settingType: '',
            settingValue: 'true'
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        mockservice = {
            isEnabled: jasmine.createSpy().and.callFake((object) => {
                return {
                    then(callback) {
                        callback();
                    }
                };
            }),
            getOnce$: jasmine.createSpy().and.returnValue(of(false))
        };

        mockPracticeService = {
            getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'testId' })
        };

        mockUriService = {
            getWebApiUri: jasmine.createSpy("mockUriService.getWebApiUri")
                .and.returnValue('localhost:3000')
        }

        mockEnterpriseSettingService = {
            Enterprise: {
                get: jasmine.createSpy().and.callFake((object) => {
                    return {
                        then(callback) {
                            callback(object);
                        }
                    };
                }),
            },
            EnterpriseSettings: function () {
                return ({
                    getAll: jasmine.createSpy().and.callFake((object) => {
                        return {
                            then(callback) {
                                callback(object);
                            }
                        };
                    }),
                    getById: jasmine.createSpy().and.callFake((object) => {
                        return {
                            then(callback) {
                                callback(object);
                            }
                        };
                    }),
                    post: () => ({ $promise: Promise.resolve(mockUltRes) }),
                    update: () => ({ $promise: Promise.resolve(mockUltRes) }),
                })
            }
        }

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
        }

        mockSoarConfig = {
            enableUlt: true
        }

        mockFuseFlag = {
            EnableMFAPracticeSettings: { key: "release-enable-mfa-practice-settings", defaultValue: false }
        };

        const mockMFASettingsResponse: MFASettingsResponse = {
            mfaEnabled: false,
            preferredMFAMethod: 'none',
        };

        mockMfaSettingsService = {
            getMFASettingsByPracticeId: jasmine.createSpy().and.returnValue(of(mockMFASettingsResponse)),
            saveMFASettingsById: jasmine.createSpy().and.returnValue(of(mockMFASettingsResponse))
        };

        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
            ],
            declarations: [PracticeInformationComponent, AppToggleComponent],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: FeatureFlagService, useValue: mockservice },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'uriService', useValue: mockUriService },
                { provide: 'EnterpriseSettingService', useValue: mockEnterpriseSettingService },
                { provide: HttpClient, useValue: httpClientMock },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'FuseFlag', useValue: mockFuseFlag },
                { provide: MfaSettingsService, useValue: mockMfaSettingsService },

            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PracticeInformationComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        sessionStorage.setItem('userContext', userContext);
        spyOn(component, 'getPracticeData').and.returnValue(of(mockData));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        it('should call getPageNavigation, getCurPractice and getPracticeSettings methods', () => {
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'getCurPractice');
            component.canEdit = false;
            component.ultEditTooltip = 'beforeUpdate';

            component.ngOnInit();

            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.getCurPractice).toHaveBeenCalled();
            expect(component.canEdit).toBe(true);
            expect(component.ultEditTooltip).toBe('');
        });

    });

    describe('getUltSetting function -> ', () => {
        let practice;

        beforeEach(() => {
            practice = mockPracticeService.getCurrentPractice();
        });

        it('should call Enterprise.get', () => {

            mockEnterpriseSettingService.Enterprise = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => { failure({}), success({ id: 1 }) } }
                }),
            };

            mockEnterpriseSettingService.EnterpriseSettings = function () {
                return ({
                    getAll: jasmine.createSpy().and.callFake((object) => {
                        return {
                            then(callback) {
                                callback(object);
                            }
                        };
                    }),
                    getById: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => { failure({}), success(mockUltRes) } }
                    }),
                    update: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => { failure({}), success(mockUltRes) } }
                    }),
                    post: jasmine.createSpy().and.returnValue({
                        $promise: { then: (success, failure) => { failure({}), success(mockUltRes) } }
                    }),
                });
            }

            spyOn(component, 'convertUltResponseToObject');

            component.getUltSetting();
            expect(practice).not.toBeNull();
            expect(component.hasUltSetting).toBe(true);
        });

    });

    describe('toggleRestrictedUserLogin -> ', () => {
        it('should set ultToggleLoaded to true if ultToggleLoaded is false', () => {
            component.showUltToggle = true;
            component.ultSetting = {
                settingValue: "true"
            };

            fixture.detectChanges();

            spyOn(component, 'toggleRestrictedUserLogin');

            const toggleComponent = de.query(By.directive(AppToggleComponent));
            const cmp = toggleComponent.componentInstance;
            const event = false;

            cmp.toggled.emit(event);
            expect(component.ultToggleLoaded).toBe(true);

        });
    });
    describe('toggleRestrictedUserLogin -> ', () => {
        it('should set ultToggleLoaded to false if hasUltSetting is false', fakeAsync(() => {
            component.ultSetting = {
                settingValue: "true"
            };
            component.ultToggleLoaded = true
            component.canEdit = true
            component.hasUltSetting = false
            component.toggleRestrictedUserLogin("")
            tick();
            expect(component.savingUlt).toBe(false);
        }));
    });

    describe('toggleRestrictedUserLogin -> ', () => {
        it('should set ultToggleLoaded to false if hasUltSetting is true', fakeAsync(() => {
            component.ultSetting = {
                settingValue: "true"
            };
            component.ultToggleLoaded = true
            component.canEdit = true
            component.hasUltSetting = true
            component.toggleRestrictedUserLogin("")
            tick();
            expect(component.savingUlt).toBe(false);
        }));
    });

    describe('MFA Settings Feature Flag ->', () => {
        it('should display MFA settings section when EnableMFAPracticeSettings feature flag is true', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(true));
            component.ngOnInit();
            tick();

            fixture.detectChanges();
            expect(component.showMFASettings).toBe(true);
            expect(mockservice.getOnce$).toHaveBeenCalledWith(mockFuseFlag.EnableMFAPracticeSettings);
            
            const mfaSettingsElement = fixture.debugElement.query(By.css('[data-test="pracMFASettings"]'));
            expect(mfaSettingsElement).toBeTruthy();
        }));

        it('should hide MFA settings section when EnableMFAPracticeSettings feature flag is false', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(false));
            component.ngOnInit();
            tick();

            fixture.detectChanges();
            expect(component.showMFASettings).toBe(false);
            expect(mockservice.getOnce$).toHaveBeenCalledWith(mockFuseFlag.EnableMFAPracticeSettings);
            
            const mfaSettingsElement = fixture.debugElement.query(By.css('[data-test="pracMFASettings"]'));
            expect(mfaSettingsElement).toBeFalsy();
        }));

        it('should hide MFA preferred method section when EnableMFAPracticeSettings feature flag is false && mfaEnabled is true', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(false));
            component.ngOnInit();
            tick();

            component.mfaSettings$.next({ mfaEnabled: true, preferredMFAMethod: 'phone' });
            fixture.detectChanges();
            tick();
            
            const mfaPreferredMethodElement = fixture.debugElement.query(By.css('[data-test="pracMFAPreferredMethod"]'));
            expect(mfaPreferredMethodElement).toBeFalsy();
        }));
    });

    describe('toggleMFASetting ->', () => {
        it('should have MFA toggle checked when mfaSettings$.value.mfaEnabled is true', fakeAsync(() => {            // Setup: Enable MFA feature flag
            mockservice.getOnce$.and.returnValue(of(true));
            component.ngOnInit();
            tick();
        
            component.mfaSettings$.next({ mfaEnabled: true, preferredMFAMethod: 'phone' });
            fixture.detectChanges();
            tick();
            
            const mfaSettingsElement = fixture.debugElement.query(By.css('[data-test="pracMFASettings"]'));
            expect(mfaSettingsElement).toBeTruthy();
            
            const toggleComponent = mfaSettingsElement.query(By.directive(AppToggleComponent));
            expect(toggleComponent).toBeTruthy();
            expect(toggleComponent.componentInstance.isChecked).toBe(true);
        }));       
        
        it('should have MFA toggle unchecked when mfaSettings$.value.mfaEnabled is false', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(true));
            component.ngOnInit();
            tick();
            
            component.mfaSettings$.next({ mfaEnabled: false, preferredMFAMethod: 'phone' });
            fixture.detectChanges();
            tick();
            
            const mfaSettingsElement = fixture.debugElement.query(By.css('[data-test="pracMFASettings"]'));
            expect(mfaSettingsElement).toBeTruthy();
            
            const toggleComponent = mfaSettingsElement.query(By.directive(AppToggleComponent));
            expect(toggleComponent).toBeTruthy();
            expect(toggleComponent.componentInstance.isChecked).toBe(false);
        }));        
        
        it('should show MFA preferred method section when MFA is enabled', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(true));
            component.ngOnInit();
            tick();
        
            component.mfaSettings$.next({ mfaEnabled: true, preferredMFAMethod: 'phone' });
            fixture.detectChanges();
            tick();
            
            const mfaPreferredMethodElement = fixture.debugElement.query(By.css('[data-test="pracMFAPreferredMethod"]'));
            expect(mfaPreferredMethodElement).toBeTruthy();
        }));
        
        it('should hide MFA preferred method section when MFA is disabled', fakeAsync(() => {
            mockservice.getOnce$.and.returnValue(of(true));
            component.ngOnInit();
            tick();
            
            component.mfaSettings$.next({ mfaEnabled: false, preferredMFAMethod: 'phone' });
            fixture.detectChanges();
            tick();
            
            const mfaPreferredMethodElement = fixture.debugElement.query(By.css('[data-test="pracMFAPreferredMethod"]'));
            expect(mfaPreferredMethodElement).toBeFalsy();
        }));
    });

});
