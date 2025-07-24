import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { PatientCommunication } from '../models/patient-communication.model';
import { throwError, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { CommunicationCategory, CommunicationReason, CommunicationTab, CommunicationType, FormMode } from '../../common/models/enums';
import { CommunicationCustomEvent } from '../models/communication-custom-event.model';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { CommunicationEvent } from '../../common/models/enums';
import { PatientCommunicationTemplate } from '../models/patient-communication-templates.model';
import { PatientOverview } from '../models/patient-overview.model';
import { FormGroup } from '@angular/forms';
import { AccountMemberOverview } from '../models/account-member-overview.model';
import { MicroServiceApiService } from 'src/security/providers';

@Injectable()
export class PatientCommunicationCenterService {
    private communicationEventTracker = new BehaviorSubject<CommunicationCustomEvent>(null);
    dataAccountNoteCommunications$: BehaviorSubject<{}> = new BehaviorSubject(null);
    drawerMode: any = FormMode.default;
    updatePatientCommunications$: BehaviorSubject<PatientCommunication> = new BehaviorSubject(null);
    isDrawerOpened = false;
    patientDetail1: PatientOverview;
    userName: any;
    activeTab: any = CommunicationTab.Communication;
    inCompleteToDoCounts: number;
    communicationTemplates: PatientCommunicationTemplate[];
    formValuesChanged: boolean;
    isModalOpen: boolean;
    oldCommunication: any;
    cachedCommunicationTab: {
        activeTab?: CommunicationTab,
        cachedFormData?: any,
        cachedFormMode: FormMode
    };
    patientInfo: any;
    patientDetail: { Profile?: any };
    NextAppointment: any;
    constructor(
        @Inject('SoarConfig') private soarConfig,
        private httpClient: HttpClient,
        private enumAsString: EnumAsStringPipe,
        @Inject('referenceDataService') private referenceDataService,
        private microServiceApis: MicroServiceApiService) { }


    getCommunicationEvent(): BehaviorSubject<CommunicationCustomEvent> {
        return this.communicationEventTracker;
    }
    setCommunicationEvent(param: CommunicationCustomEvent): void {
        this.communicationEventTracker.next(param);
    }
    createPatientCommunication(patientId: any, patientCommunication: PatientCommunication, personDetails: any) {
        if (personDetails) {
            patientCommunication.AccountId = personDetails.AccountId;
        }

        if(!patientCommunication.CommunicationDate)
            delete patientCommunication.CommunicationDate;

        return this.httpClient.post(this.soarConfig.domainUrl + '/patients/' + patientId + '/communicationcenter', patientCommunication)
            .pipe(
                map((result: any) => {
                    const communication = result.Value as PatientCommunication;
                    if (communication) {
                        this.setCommunicationEvent({ eventtype: CommunicationEvent.NewCommunication, data: communication });
                    }
                    return communication;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientCommunicationByPatientId(patientId: any) {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientcommunications')
            .pipe(
                map((result: any) => {
                    return result.Value as PatientCommunication[];
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    dataForAccountNote(accountNoteCommunication: any) {
        this.dataAccountNoteCommunications$.next(accountNoteCommunication);
    }
    deletePatientCommunicationById(patientCommunicationId: any, personAccountNoteId: any) {
        let url = '';
        if (patientCommunicationId) {
            url = `${this.soarConfig.domainUrl}/patients/patientcommunications/${patientCommunicationId}`;
        } else {
            url = `${this.soarConfig.insuranceSapiUrl}/person/accountNote/${personAccountNoteId}`;
        }
        return this.httpClient.delete(url).pipe(
            map((result: any) => {
                return result.Value as PatientCommunication[];
            }), catchError(error => {
                return throwError(error);
            })
        );

    }
    updatePatientCommunication(patientCommunicationId: any, patientCommunication: PatientCommunication) {
        return this.httpClient.put(this.soarConfig.domainUrl + '/patients/patientcommunications/' +
            patientCommunicationId, patientCommunication)
            .pipe(
                map((result: any) => {
                    const communication = result.Value as PatientCommunication;
                    if (communication) {
                        this.updatePatientCommunications$.next(communication);
                    }
                    return communication;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    exportCSV(communications: Array<PatientCommunication>, patientInfo: any) {
        const csvData = this.ConvertToCSV(communications,
            ['Patient Name', 'Date', 'Type', 'Category', 'Reason',
                'Communication Designation', 'Notes', 'Added By', 'Edited By', 'Template'],
            patientInfo);
        const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        const dwldLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
        if (isSafariBrowser) {
            dwldLink.setAttribute('target', '_blank');
        }
        dwldLink.setAttribute('href', url);
        dwldLink.setAttribute('download', `PatientCommunication-${patientInfo.PatientCode}.csv`);
        dwldLink.style.visibility = 'hidden';
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);

    }
    ConvertToCSV(communications: Array<PatientCommunication>, headers: Array<string>, patientInfo: any) {
        const array = typeof communications !== 'object' ? JSON.parse(communications) : communications;
        let str = '';
        let row = '';

        for (const index in headers) {
            if (index) {
                row += headers[index] + ',';
            }
        }
        row = row.slice(0, -1);
        str += row + '\r\n';
        array.forEach((communication: PatientCommunication) => {
            let line = `${patientInfo.LastName} ${patientInfo.FirstName},${moment(communication.CommunicationDate).format('MM/DD/YYYY')},`;
            line += `${this.enumAsString.transform(communication.CommunicationType, CommunicationType)},`;
            line += `${this.enumAsString.transform(communication.CommunicationCategory, CommunicationCategory)},`;
            line += `${this.enumAsString.transform(communication.Reason, CommunicationReason)},`;
            line += `${(communication.Status === 0) ? 'Other' : ((communication.Status === 1) ? 'Sent' : 'Received')},`;
            line += `${communication.Notes.replace(/(\r\n|\n|\r|,)/gm, '')},` + `${communication.AddedBy.replace(',', '')},`;
            line += `${communication.EditedBy ? communication.EditedBy.split('on')[0] : 'N/A'}, ${communication.LetterTemplateName ? communication.LetterTemplateName : 'N/A'} `;
            str += line + '\r\n';
        });
        return str;
    }
    getPatientCommunicationToDoByPatientId(patientId: any) {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patienttodos')
            .pipe(
                map((result: any) => {
                    return result.Value as PatientCommunication[];
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    createToDoCommunication(patientId: any, patientCommunication: PatientCommunication, personDetails: any) {
        if (personDetails) {
            patientCommunication.AccountId = personDetails.AccountId;
        }
        return this.httpClient.post(this.soarConfig.domainUrl + '/patients/' + patientId + '/communicationcenter', patientCommunication)
            .pipe(
                map((result: any) => {
                    const communication = result.Value as PatientCommunication;
                    if (communication) {
                        this.setCommunicationEvent({ eventtype: CommunicationEvent.NewToDoCommunication, data: communication });
                    }
                    return communication;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getUserdetail = (userId: any, isAddedBy: any) => {
        const userslist = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        const userInfo = userslist?.filter((x: any) => x.UserId === userId)[0];
        if (userInfo && isAddedBy) {
            this.userName = `${userInfo.FirstName ? userInfo.FirstName : ''} ${userInfo.LastName ? userInfo.LastName : ''}${userInfo.ProfessionalDesignation ? `, ${userInfo.ProfessionalDesignation}` : ''}`;
            return this.userName;
        }
        if (userInfo && !(isAddedBy)) {
            this.userName = `${userInfo.FirstName ? userInfo.FirstName : ''} ${userInfo.LastName ? userInfo.LastName : ''}`;
            return this.userName;
        }
    }
    updateToDoPatientCommunication(patientCommunicationId: any, patientCommunication: PatientCommunication) {
        return this.httpClient.put(this.soarConfig.domainUrl + '/patients/patientcommunications/' +
            patientCommunicationId, patientCommunication)
            .pipe(
                map((result: any) => {
                    const communication = result.Value as PatientCommunication;
                    if (communication) {
                        this.setCommunicationEvent({ eventtype: CommunicationEvent.UpdateToDoCommunication, data: communication });
                    }
                    return communication;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    GetPatientCommunicationTemplates() {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/patientcommunications/communicationTemplates')
            .pipe(
                map((result: any) => {
                    return result.Value as PatientCommunicationTemplate[];
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    GetPatientCommunicationTemplateById(patientId: any, templateId: any, appointmentId: any) {
        return this.httpClient.get(
            `${this.soarConfig.domainUrl}/patients/${patientId}/patientcommunications/${templateId}/${appointmentId}`
        )
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    PrintTemplate = (template: any) => {
        const myWindow = window.open('', '', 'width=800,height=500');
        myWindow.document.write(template);
        myWindow.document.close();
        myWindow.focus();
        myWindow.print();
        myWindow.onafterprint = () => {
            myWindow.close();
        };
    }
    getPatientDiscountByPatientId = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/discountType')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    resetPatientCommunicationService = () => {
        this.activeTab = CommunicationTab.Communication;
        this.drawerMode = FormMode.default;
        this.isDrawerOpened = false;
        this.isModalOpen = false;
        this.formValuesChanged = false;
        this.oldCommunication = null;
    }
    setCachedTabWithData = (candidateTab: CommunicationTab, formData: FormGroup, formMode: FormMode) => {
        const cachedTab = this.cachedCommunicationTab;
        if (!cachedTab || (cachedTab && cachedTab.activeTab === candidateTab)) {
            if (this.formValuesChanged) {
                this.cachedCommunicationTab = { activeTab: candidateTab, cachedFormData: formData, cachedFormMode: formMode };
            }
        }
    }
    getPatientFlagsAndAlertsByPatientId = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientcommunications/patientflagandalerts')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getAdditionalInfoByPatientId = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientcommunications/additionalinfo')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientAccountOverviewByAccountId = (accountId: string) => {
        return this.httpClient.get(this.soarConfig.insuranceSapiUrl + '/accounts/' + accountId + '/overview')
            .pipe(
                map((result: any) => {
                    return result.Value as AccountMemberOverview;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientInfoByPatientId = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientcommunications/patientinfo')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientNextAppointment = (patientId: any) => {
        return this.httpClient.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointments/get-next-preview/' + patientId)
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPrimaryPatientBenefitPlanByPatientId = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientcommunications/patientbenefitplan')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
}
