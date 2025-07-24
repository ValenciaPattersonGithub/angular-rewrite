import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs/internal/Observable';
import { EnterpriseSettings, Practice, PracticeDataResponseWrapper, PracticeSettings, MFASettings } from '../models/practice.model';
import { take } from 'rxjs/operators';
import { FuseFlag } from '../../../@core/feature-flags';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { MfaSettingsService, MFASettingsResponse } from '../service/mfa-settings.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'practice-information',
    templateUrl: './practice-information.component.html',
    styleUrls: ['./practice-information.component.scss']
})

export class PracticeInformationComponent implements OnInit {

    breadCrumbs: { name: string, path: string, title: string }[] = [];
    showUltToggle: boolean = false;
    hasUltSetting: boolean = false;
    ultToggleLoaded: boolean = false;
    savingUlt: boolean = false;
    enterpriseId: number;
    practiceSettings: PracticeSettings;
    ultSetting: EnterpriseSettings;
    practiceDto: Practice = new Practice();
    canEdit: boolean = false;
    ultEditTooltip: string;

    // Updated MFA settings properties
    mfaSettings$: BehaviorSubject<MFASettings> = new BehaviorSubject<MFASettings>({ mfaEnabled: false, preferredMFAMethod: 'none' });
    savingMFASetting: boolean = false;
    mfaSettingTooltip: string;
    showMFASettings: boolean = false;
    
    constructor(
        @Inject('localize') private localize,
        private featureFlagService: FeatureFlagService,
        @Inject('practiceService') private practiceService,
        @Inject('uriService') private uriService,
        @Inject('EnterpriseSettingService') private enterpriseSettingService,
        private http: HttpClient,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('SoarConfig') private soarConfig,
        private mfaSettingsService: MfaSettingsService) { }

    ngOnInit(): void {
        this.init();
    }

    init = () => {
        this.canEdit = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-biz-edit');
        this.ultEditTooltip = this.canEdit ? '' : 'You do not have permission to edit restricted logins';
        this.mfaSettingTooltip = 'You do not have permission to edit MFA settings';
        this.getPageNavigation();
        this.getCurPractice();    

        if (this.soarConfig.enableUlt === 'true') {
            this.getUltSetting();
        }
        else {
            this.showUltToggle = false;
        }
        
        this.featureFlagService.getOnce$(FuseFlag.EnableMFAPracticeSettings).subscribe((value) => {
            this.showMFASettings = value;
        });
    }

    getCurPractice = () => {
        if (sessionStorage.getItem('userContext')) {
            const userContext = JSON.parse(sessionStorage.getItem('userContext'));
            const user = userContext?.Result?.User;
            if (user?.AccessLevelId) {
                const practiceUrl = this.uriService.getWebApiUri() + '/api/practices' + '/' + user?.AccessLevelId;
                this.getPracticeData(practiceUrl)
                    .pipe(take(1))
                    .subscribe((res: PracticeDataResponseWrapper) => {
                        const data = res?.Result
                        if (data) {
                            this.practiceDto = new Practice(data.PracticeId, data.Name, data.SAPCustomerId, data.PrimaryContactName, data.PrimaryContactAddress1, data.PrimaryContactAddress2, data.PrimaryContactCity, data.PrimaryContactStateProvince, data.PrimaryContactPostalCode, data.PrimaryContactPhone1, data.PrimaryContactPhone2, data.SecondaryContactPhone1, data.MerchantId, data.Timezone);
                            this.getMFASettingsById(data.PracticeId.toString());
                        }
                    });
                
            }
        }
    }

    getPracticeData(practiceUrl): Observable<PracticeDataResponseWrapper> {
        //HTTP call here is required to be moved to the service once the service is created
        //Leaving this call here for now
        const response = this.http.get<PracticeDataResponseWrapper>(practiceUrl);
        return response;
    }

    //#region breadcrumbs
    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Practice Information'),
                path: '/BusinessCenter/Settings/PracticeInformation/',
                title: 'Practice Information'
            }
        ];

    }
    //#end region

    getUltSetting = () => {
        const practice = this.practiceService.getCurrentPractice();

        this.enterpriseSettingService.Enterprise.get({ practiceId: practice.id }).$promise.then((enterprise) => {
            this.enterpriseId = enterprise.id;
            if (enterprise) {
                this.enterpriseSettingService.EnterpriseSettings(this.enterpriseId).getAll({ enterpriseId: this.enterpriseId });
                this.enterpriseSettingService.EnterpriseSettings(this.enterpriseId).getById({ enterpriseId: this.enterpriseId, enterpriseSettingName: 'PracticeLevelRestrictedUserTimes' }).$promise.then((res) => {
                    this.hasUltSetting = true;
                    this.ultSetting = this.convertUltResponseToObject(res);
                    this.showUltToggle = true;
                }, () => {
                    this.hasUltSetting = false;
                    this.ultSetting = {
                        settingName: 'PracticeLevelRestrictedUserTimes',
                        settingType: 6,
                        settingValue: "false",
                        applicationID: 2,
                        enterpriseID: this.enterpriseId
                    };
                    this.showUltToggle = true;
                });

            }

        }, () => {
            this.showUltToggle = false;
        });
    }

    convertUltResponseToObject = (ult): EnterpriseSettings => {
        const ultResponse: EnterpriseSettings = {
            applicationID: ult.applicationID,
            createDate: ult.createDate,
            createUser: ult.createUser,
            dataTag: ult.dataTag,
            enterpriseID: ult.enterpriseID,
            modifiedDate: ult.modifiedDate,
            modifiedUser: ult.modifiedUser,
            settingName: ult.settingName,
            settingType: ult.settingType,
            settingValue: ult.settingValue
        };
        return ultResponse;
    }

    toggleRestrictedUserLogin = (event) => {
        if (this.canEdit) {
            if (this.ultToggleLoaded) {
                this.savingUlt = true;
                this.ultSetting.settingValue = event;
                this.ultSetting.settingValue = this.ultSetting.settingValue.toString();

                if (this.hasUltSetting) {
                    this.enterpriseSettingService.EnterpriseSettings(this.enterpriseId).update(this.ultSetting).$promise.then((res) => {
                        this.hasUltSetting = true;
                        this.ultSetting = this.convertUltResponseToObject(res);
                        this.savingUlt = false;
                    }, () => {
                        this.savingUlt = false;
                    });
                }
                else {
                    this.enterpriseSettingService.EnterpriseSettings(this.enterpriseId).post(this.ultSetting).$promise.then((res) => {
                        this.hasUltSetting = true;
                        this.ultSetting = this.convertUltResponseToObject(res);
                        this.savingUlt = false;
                    }, () => {
                        this.savingUlt = false;
                    });
                }
            }
            else {
                this.ultToggleLoaded = true;
            }
        }
    }
    
    getMFASettingsById = (practiceId: string) => {
        if (!this.showMFASettings) {
            return;
        }
        
        this.mfaSettingsService.getMFASettingsByPracticeId(practiceId).subscribe(
            (response: MFASettingsResponse) => this.mfaSettings$.next(response),
            (error) => console.error('Failed to fetch MFA settings', error)
        );
    }
    
    toggleMFASetting = (enabled: boolean) => {    
        if (this.savingMFASetting || !this.practiceDto?.PracticeId) {
            return;
        }

        const updatedSettings = {
            ...this.mfaSettings$.value,
            mfaEnabled: enabled,
        };
        this.saveMFASettingsById(this.practiceDto.PracticeId.toString(), updatedSettings);
    }
      onMFAPreferredChange = (event: any) => {
        if (this.savingMFASetting || !this.practiceDto?.PracticeId) {
            return;
        }
    
        const newMethod = event.target.value;
        const updatedSettings: MFASettings = {
            ...this.mfaSettings$.value,
            preferredMFAMethod: newMethod,
        };   
        this.saveMFASettingsById(this.practiceDto.PracticeId.toString(), updatedSettings);
    }

    saveMFASettingsById = (practiceId: string, updatedSettings: MFASettings ) => {
        this.savingMFASetting = true;
        this.mfaSettingsService.saveMFASettingsById(practiceId, updatedSettings)
            .subscribe(
                () => {
                    this.savingMFASetting = false;
                    this.mfaSettings$.next(updatedSettings);
                },
                (error) => {
                    console.error('Failed to update MFA preferred method', error);
                    this.savingMFASetting = false;
                }
            )
    }
}
