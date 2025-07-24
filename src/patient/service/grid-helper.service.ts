import { PatientLandingGridService } from "src/patient/common/http-providers/patient-landing-grid.service";
import { AllPatient, OtherToDo, PreventiveCare, TreatmentPlans } from "src/patient/common/models/patient-grid-response.model";
import { PatientFilterService } from "src/patient/service/patient-filter.service";
import cloneDeep from 'lodash/cloneDeep';
import { TranslateService } from "@ngx-translate/core";
import { AllPatientRequest, AppointmentRequest, OtherToDoRequest, PreventiveCareRequest, TreatmentPlansRequest } from "src/patient/common/models/patient-grid-request.model";
import { LocationTimeService } from "src/practices/common/providers";
import { Inject } from "@angular/core";
import { AllPatientGridFilter, AppointmentGridFilter, DateRangeFilterType, OtherToDoGridFilter, PreventiveCareGridFilter, TreatmentPlansGridFilter } from "src/patient/common/models/patient-grid-filter.model";
import { MailingLabelPrintService } from "src/@shared/providers/mailing-label-print.service";
import { TemplatePrintService } from "src/@shared/providers/template-print.service";
import { DocumentTitles } from "src/patient/common/models/patient-location.model";
import { PatientSortField, SlideoutFilter } from "../common/models/enums/patient.enum";
import { AllPatientGridSort, AppointmentGridSort, OtherToDoGridSort, PreventiveGridSort, TreatmentGridSort } from "../common/models/patient-grid-sort.model";
import { PatientMailingInfo, PatientPostcardInfo } from "src/@shared/models/send-mailing.model";

export interface IGridHelper {
    fetch(request, tempRequest, url: string, locationId: number):Promise<AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo>;
    onDateRangeFilter(request, data: { startDate: Date, endDate: Date }, field: string): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo;
    onSortGridData(sortData: ({ sortField: string, sortDirection: number })): AllPatientGridSort | PreventiveGridSort | TreatmentGridSort | AppointmentGridSort | OtherToDoGridSort;
    onSlideOutFilterChange(request, filter): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo;
}

export interface IGridNumericHelper extends IGridHelper{
    onNumericRangeFilter(request, data: { from: number, to: number }): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo;
}

export interface IPrintMailingHelper extends IGridHelper{
    onPrintMailingLabel(response: PatientMailingInfo, activeGridData)
}

export class AllPatientsGridData implements IGridHelper, IPrintMailingHelper, IGridNumericHelper {

    constructor(private translate: TranslateService,
        private patientLandingGridService: PatientLandingGridService,
        private patientFilterService: PatientFilterService,
        private locationTimeService: LocationTimeService,
        @Inject('PatientServices') private patientServices,
        private templatePrintService: TemplatePrintService,
        private mailingLabelService: MailingLabelPrintService,
        @Inject('ModalFactory') private modalFactory) { }

    fetch = (request, tempRequest, url: string, locationId: number): Promise<AllPatient> => {
        document.title = this.translate.instant(DocumentTitles.AllPatients);
        request.FilterCriteria.LocationId = locationId;
        request.CurrentPage = this.patientFilterService.CurrentPage;
        this.patientFilterService.currentFilterCriteria = request.FilterCriteria;
        tempRequest = cloneDeep(request);
        this.transformRequestData(tempRequest);

        return this.patientLandingGridService.getAllPatients(tempRequest, url)
    }

    transformRequestData = (tempRequest) => {
        const allPatientFields = this.patientFilterService.getDateTimeFields();
        Object.values(allPatientFields)?.forEach((key) => {
            if (tempRequest?.FilterCriteria[key]) {
                tempRequest.FilterCriteria[key] = this.locationTimeService.toUTCDateKeepLocalTime(tempRequest?.FilterCriteria[key]);
            }
        });
    }

    onDateRangeFilter = (allPatientRequest: AllPatientRequest, data: { startDate: Date, endDate: Date }, field: string): AllPatientRequest => {
        const fieldMapping = {
            [DateRangeFilterType.DateOfBirth]: ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo'],
            [DateRangeFilterType.LastAppointment]: ['PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo'],
            [DateRangeFilterType.NextAppointment]: ['NextAppointmentDateFrom', 'NextAppointmentDateTo'],
            [DateRangeFilterType.PreventiveCare]: ['PreventiveCareDueDateFrom', 'PreventiveCareDueDateTo'],
            [DateRangeFilterType.LastCommunication]: ['LastCommunicationFrom', 'LastCommunicationTo']
        };

        if (fieldMapping[field]) {
            const [fromField, toField] = fieldMapping[field];
            if (data.startDate) {
                allPatientRequest.FilterCriteria[fromField] = data.startDate;
            } else {
                delete allPatientRequest.FilterCriteria[fromField];
            }
            if (data.endDate) {
                allPatientRequest.FilterCriteria[toField] = data.endDate;
            } else {
                delete allPatientRequest.FilterCriteria[toField];
            }
        }

        return allPatientRequest;
    }

    onNumericRangeFilter = (allPatientRequest: AllPatientRequest, data: { from: number, to: number }): AllPatientRequest => {
        if (!allPatientRequest?.FilterCriteria) {
            allPatientRequest = new AllPatientRequest();
            allPatientRequest.FilterCriteria = new AllPatientGridFilter();
        }
        allPatientRequest.FilterCriteria.TreatmentPlanCountTotalFrom = data.from;
        allPatientRequest.FilterCriteria.TreatmentPlanCountTotalTo = data.to;
        return allPatientRequest;
    }

    onSortGridData = (sortData: ({ sortField: string, sortDirection: number })): AllPatientGridSort => {
        const currentSortField = PatientSortField[sortData.sortField];
        const allPatientGridSort = new AllPatientGridSort();
        allPatientGridSort[currentSortField] = sortData.sortDirection;
        return allPatientGridSort;
    }

    onSlideOutFilterChange = (allPatientRequest: AllPatientRequest, filter: AllPatientGridFilter): AllPatientRequest => {
        allPatientRequest.FilterCriteria = filter;
        return allPatientRequest;
    }

    onPrintMailingLabel = (response: PatientMailingInfo, activeGridData) => {
        const printTemplate = new PatientMailingInfo()
        if (response?.isPrintMailingLabel) {
            this.patientServices.MailingLabel.GetMailingLabelPatient(activeGridData).$promise.then(res => {
                this.mailingLabelService.getPrintHtml(res?.Value);
            });
        }
        // Generate Bulk Template
        if (response?.communicationTemplateId) {
            if (activeGridData?.TotalCount > 200) {
                this.showWarningModal();
            } else {
                printTemplate.dataGrid = activeGridData;
                printTemplate.communicationTemplateId = response?.communicationTemplateId;
                printTemplate.isPostcard = response?.isPostcard;
                // To open a print template in new window
                this.templatePrintService.getPrintHtml(printTemplate);
                if (!response?.isPostcard) {
                    this.templatePrintService.printBulkLetterPatient(printTemplate).then((results: string[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                } else {
                    this.templatePrintService.PrintBulkPostcardPatient(printTemplate).then((results: PatientPostcardInfo[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                }
            }
        }
    }

    showWarningModal = () => {
        const message = this.translate.instant('More than 200 records.');
        const title = this.translate.instant('Warning!');
        const button2Text = this.translate.instant('Ok');
        this.modalFactory.ConfirmModal(title, message, button2Text).then(() => { });
    }
}
export class PreventiveCareGridData implements IGridHelper, IPrintMailingHelper, IGridNumericHelper {

    constructor(private translate: TranslateService,
        private patientLandingGridService: PatientLandingGridService,
        private patientFilterService: PatientFilterService,
        private locationTimeService: LocationTimeService,
        @Inject('PatientServices') private patientServices,
        private templatePrintService: TemplatePrintService,
        private mailingLabelService: MailingLabelPrintService,
        @Inject('ModalFactory') private modalFactory) { }

    fetch = (request, tempRequest, url: string, locationId: number): Promise<PreventiveCare> => {

        document.title = this.translate.instant(DocumentTitles.PreventiveCare);
        request.FilterCriteria.LocationId = locationId;
        request.CurrentPage = this.patientFilterService.CurrentPage;
        this.patientFilterService.currentFilterCriteria = request.FilterCriteria;
        tempRequest = cloneDeep(request);
        this.transformRequestData(tempRequest);
        return this.patientLandingGridService.getAllPreventiveCare(tempRequest, url);
    }

    transformRequestData = (tempRequest) => {
        const preventiveFields = this.patientFilterService.getDateTimeFields();
        Object.values(preventiveFields)?.forEach((key) => {
            if (tempRequest?.FilterCriteria[key]) {
                tempRequest.FilterCriteria[key] = this.locationTimeService.toUTCDateKeepLocalTime(tempRequest?.FilterCriteria[key]);
            }
        });
    }

    onDateRangeFilter = (preventiveCareRequest: PreventiveCareRequest, data: { startDate: Date; endDate: Date; }, field: string): PreventiveCareRequest => {
        const fieldMapping = {
            [DateRangeFilterType.DateOfBirth]: ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo'],
            [DateRangeFilterType.LastAppointment]: ['PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo'],
            [DateRangeFilterType.NextAppointment]: ['NextAppointmentDateFrom', 'NextAppointmentDateTo'],
            [DateRangeFilterType.PreventiveCare]: ['PreventiveCareDueDateFrom', 'PreventiveCareDueDateTo'],
            [DateRangeFilterType.LastCommunication]: ['LastCommunicationFrom', 'LastCommunicationTo']
        };
        if (fieldMapping[field]) {
            const [fromField, toField] = fieldMapping[field];

            if (data.startDate) {
                preventiveCareRequest.FilterCriteria[fromField] = data.startDate;
            } else {
                delete preventiveCareRequest.FilterCriteria[fromField];
            }

            if (data.endDate) {
                preventiveCareRequest.FilterCriteria[toField] = data.endDate;
            } else {
                delete preventiveCareRequest.FilterCriteria[toField];
            }
        }

        return preventiveCareRequest;
    }

    onNumericRangeFilter = (preventiveCareRequest: PreventiveCareRequest, data: { from: number, to: number }): PreventiveCareRequest => {
        if (!preventiveCareRequest?.FilterCriteria) {
            preventiveCareRequest = new PreventiveCareRequest();
            preventiveCareRequest.FilterCriteria = new PreventiveCareGridFilter();
        }
        preventiveCareRequest.FilterCriteria.TreatmentPlanCountTotalFrom = data.from;
        preventiveCareRequest.FilterCriteria.TreatmentPlanCountTotalTo = data.to;
        return preventiveCareRequest;
    }

    onSortGridData = (sortData: ({ sortField: string, sortDirection: number })): PreventiveGridSort => {
        const currentSortField = PatientSortField[sortData.sortField];
        const preventiveCareGridSort = new PreventiveGridSort();
        preventiveCareGridSort[currentSortField] = sortData.sortDirection;
        return preventiveCareGridSort;
    }

    onSlideOutFilterChange = (preventiveCareRequest: PreventiveCareRequest, filter: PreventiveCareGridFilter): PreventiveCareRequest => {
        preventiveCareRequest.FilterCriteria = filter;
        return preventiveCareRequest;
    }

    onPrintMailingLabel = (response: PatientMailingInfo, activeGridData) => {
        const printTemplate = new PatientMailingInfo()
        if (response?.isPrintMailingLabel) {
            this.patientServices.MailingLabel.GetMailingLabelPreventive(activeGridData).$promise.then(res => {
                this.mailingLabelService.getPrintHtml(res?.Value);
            });
        }
        // Generate Bulk Template
        if (response?.communicationTemplateId) {
            if (activeGridData?.TotalCount > 1500) {
                this.showWarningPreventiveCareModal();
            } else {
                printTemplate.dataGrid = activeGridData;
                printTemplate.communicationTemplateId = response?.communicationTemplateId;
                printTemplate.isPostcard = response?.isPostcard;
                // To open a print template in new window
                this.templatePrintService.getPrintHtml(printTemplate);
                if (!response?.isPostcard) {
                    this.templatePrintService.PrintBulkLetterPreventive(printTemplate).then((results: string[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                } else {
                    this.templatePrintService.PrintBulkPostcardPreventive(printTemplate).then((results: PatientPostcardInfo[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                }
            }
        }


    }

    showWarningPreventiveCareModal = () => {
        const message = this.translate.instant('You have exceeded the limit of 1500 records.');
        const title = this.translate.instant('Warning!');
        const button2Text = this.translate.instant('Ok');
        this.modalFactory.ConfirmModal(title, message, button2Text).then(() => { });
    }
}
export class TreatmentPlansGridData implements IGridHelper, IPrintMailingHelper, IGridNumericHelper {
    constructor(private translate: TranslateService,
        private patientLandingGridService: PatientLandingGridService,
        private patientFilterService: PatientFilterService,
        private locationTimeService: LocationTimeService,
        @Inject('PatientServices') private patientServices,
        private templatePrintService: TemplatePrintService,
        private mailingLabelService: MailingLabelPrintService,
        @Inject('ModalFactory') private modalFactory) { }

    fetch = (request, tempRequest, url: string, locationId: number): Promise<TreatmentPlans> => {
        document.title = this.translate.instant(DocumentTitles.TreatmentPlans);
        request.FilterCriteria.LocationId = locationId;
        request.CurrentPage = this.patientFilterService.CurrentPage;
        this.patientFilterService.currentFilterCriteria = request.FilterCriteria;
        tempRequest = cloneDeep(request);
        this.transformRequestData(tempRequest);
        return this.patientLandingGridService.getAllTreatmentPlans(tempRequest, url);
    }

    transformRequestData = (tempRequest) => {
        const treatmentPlanFields = this.patientFilterService.getDateTimeFields();
        Object.values(treatmentPlanFields)?.forEach((key) => {
            if (tempRequest?.FilterCriteria[key]) {
                tempRequest.FilterCriteria[key] = this.locationTimeService.toUTCDateKeepLocalTime(tempRequest?.FilterCriteria[key]);
            }
        });
    }

    onDateRangeFilter = (treatmentPlansRequest: TreatmentPlansRequest, data: { startDate: Date; endDate: Date; }, field: string): TreatmentPlansRequest => {
        const fieldMapping = {
            [DateRangeFilterType.DateOfBirth]: ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo'],
            [DateRangeFilterType.LastAppointment]: ['PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo'],
            [DateRangeFilterType.NextAppointment]: ['NextAppointmentDateFrom', 'NextAppointmentDateTo'],
            [DateRangeFilterType.PreventiveCare]: ['PreventiveCareDueDateFrom', 'PreventiveCareDueDateTo'],
            [DateRangeFilterType.LastCommunication]: ['LastCommunicationFrom', 'LastCommunicationTo']
        };

        if (fieldMapping[field]) {
            const [fromField, toField] = fieldMapping[field];

            if (data.startDate) {
                treatmentPlansRequest.FilterCriteria[fromField] = data.startDate;
            } else {
                delete treatmentPlansRequest.FilterCriteria[fromField];
            }

            if (data.endDate) {
                treatmentPlansRequest.FilterCriteria[toField] = data.endDate;
            } else {
                delete treatmentPlansRequest.FilterCriteria[toField];
            }
        }

        return treatmentPlansRequest;
    }

    onNumericRangeFilter = (treatmentPlansRequest: TreatmentPlansRequest, data: { from: number, to: number }): TreatmentPlansRequest => {
        if (!treatmentPlansRequest?.FilterCriteria) {
            treatmentPlansRequest = new TreatmentPlansRequest();
            treatmentPlansRequest.FilterCriteria = new TreatmentPlansGridFilter();
        }
        treatmentPlansRequest.FilterCriteria.TreatmentPlanCountTotalFrom = data.from;
        treatmentPlansRequest.FilterCriteria.TreatmentPlanCountTotalTo = data.to;
        return treatmentPlansRequest;
    }

    onSortGridData = (sortData: ({ sortField: string, sortDirection: number })): TreatmentGridSort => {
        const currentSortField = PatientSortField[sortData.sortField];
        const treatmentPlansGridSort = new TreatmentGridSort();
        treatmentPlansGridSort[currentSortField] = sortData.sortDirection;
        return treatmentPlansGridSort;
    }

    onSlideOutFilterChange = (treatmentPlansRequest: TreatmentPlansRequest, filter: TreatmentPlansGridFilter): TreatmentPlansRequest => {
        treatmentPlansRequest.FilterCriteria = filter;
        treatmentPlansRequest = this.deleteEmptyFilterCriteria(treatmentPlansRequest, SlideoutFilter.PreferredDentists);
        treatmentPlansRequest = this.deleteEmptyFilterCriteria(treatmentPlansRequest, SlideoutFilter.PreferredHygienists);
        return treatmentPlansRequest;
    }

    deleteEmptyFilterCriteria = (treatmentPlansRequest: TreatmentPlansRequest, key: string): TreatmentPlansRequest => {
        if (treatmentPlansRequest?.FilterCriteria?.[key]?.length == 0) {
            delete treatmentPlansRequest?.FilterCriteria?.[key];
        }

        return treatmentPlansRequest;
    }

    onPrintMailingLabel = (response: PatientMailingInfo, activeGridData) => {
        const printTemplate = new PatientMailingInfo()
        if (response?.isPrintMailingLabel) {
            this.patientServices.MailingLabel.GetMailingLabelTreatment(activeGridData).$promise.then(res => {
                this.mailingLabelService.getPrintHtml(res?.Value);
            });
        }
        // Generate Bulk Template
        if (response?.communicationTemplateId) {
            if (activeGridData?.TotalCount > 200) {
                this.showWarningModal();
            } else {
                printTemplate.dataGrid = activeGridData;
                printTemplate.communicationTemplateId = response?.communicationTemplateId;
                printTemplate.isPostcard = response?.isPostcard;
                // To open a print template in new window
                this.templatePrintService.getPrintHtml(printTemplate);
                if (!response?.isPostcard) {
                    this.templatePrintService.PrintBulkLetterTreatment(printTemplate).then((results: string[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                } else {
                    this.templatePrintService.PrintBulkPostcardTreatment(printTemplate).then((results: PatientPostcardInfo[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                }
            }
        }
    }

    showWarningModal = () => {
        const message = this.translate.instant('More than 200 records.');
        const title = this.translate.instant('Warning!');
        const button2Text = this.translate.instant('Ok');
        this.modalFactory.ConfirmModal(title, message, button2Text).then(() => { });
    }
}
export class AppointmentGridData implements IGridHelper, IPrintMailingHelper {
    constructor(private translate: TranslateService,
        private patientLandingGridService: PatientLandingGridService,
        private patientFilterService: PatientFilterService,
        private locationTimeService: LocationTimeService,
        @Inject('PatientServices') private patientServices,
        private templatePrintService: TemplatePrintService,
        private mailingLabelService: MailingLabelPrintService,
        @Inject('ModalFactory') private modalFactory) { }

    fetch = (request, tempRequest, url: string, locationId: number): Promise<AppointmentRequest> => {
        document.title = this.translate.instant(DocumentTitles.Appointments);
        request.FilterCriteria.LocationId = locationId;
        request.CurrentPage = this.patientFilterService.CurrentPage;
        this.patientFilterService.currentFilterCriteria = request.FilterCriteria;
        tempRequest = cloneDeep(request);
        this.transformRequestData(tempRequest);
        return this.patientLandingGridService.getAllAppointments(tempRequest, url);
    }

    transformRequestData = (tempRequest) => {
        const appointmentFields = this.patientFilterService.getDateTimeFields();
        Object.values(appointmentFields)?.forEach((key) => {
            if (tempRequest?.FilterCriteria[key]) {
                tempRequest.FilterCriteria[key] = this.locationTimeService.toUTCDateKeepLocalTime(tempRequest?.FilterCriteria[key]);
            }
        });
    }

    onDateRangeFilter = (appointmentRequest: AppointmentRequest, data: { startDate: Date; endDate: Date; }, field: string): AppointmentRequest => {
        const fieldMapping = {
            [DateRangeFilterType.DateOfBirth]: ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo'],
            [DateRangeFilterType.LastAppointment]: ['PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo'],
            [DateRangeFilterType.Appointments]: ['AppointmentDateFrom', 'AppointmentDateTo'],
            [DateRangeFilterType.PreventiveCare]: ['PreventiveCareDueDateFrom', 'PreventiveCareDueDateTo'],
            [DateRangeFilterType.LastCommunication]: ['LastCommunicationFrom', 'LastCommunicationTo']
        };

        if (fieldMapping[field]) {
            const [fromField, toField] = fieldMapping[field];

            if (data.startDate) {
                appointmentRequest.FilterCriteria[fromField] = data.startDate;
            } else {
                delete appointmentRequest.FilterCriteria[fromField];
            }

            if (data.endDate) {
                appointmentRequest.FilterCriteria[toField] = data.endDate;
            } else {
                delete appointmentRequest.FilterCriteria[toField];
            }
        }

        return appointmentRequest;
    }

    onSortGridData = (sortData: ({ sortField: string, sortDirection: number })): AppointmentGridSort => {
        const currentSortField = PatientSortField[sortData.sortField];
        const appointmentGridSort = new AppointmentGridSort();
        appointmentGridSort[currentSortField] = sortData.sortDirection;
        return appointmentGridSort;
    }

    onSlideOutFilterChange = (appointmentRequest: AppointmentRequest, filter: AppointmentGridFilter): AppointmentRequest => {
        appointmentRequest.FilterCriteria = filter;
        return appointmentRequest;
    }

    onPrintMailingLabel = (response: PatientMailingInfo, activeGridData) => {
        const printTemplate = new PatientMailingInfo()
        if (response?.isPrintMailingLabel) {
            this.patientServices.MailingLabel.GetMailingLabelAppointment(activeGridData).$promise.then(res => {
                this.mailingLabelService.getPrintHtml(res?.Value);
            });
        }
        // Generate Bulk Template
        if (response?.communicationTemplateId) {
            if (activeGridData?.TotalCount > 200) {
                this.showWarningModal();
            } else {
                printTemplate.dataGrid = activeGridData;
                printTemplate.communicationTemplateId = response?.communicationTemplateId;
                printTemplate.isPostcard = response?.isPostcard;
                // To open a print template in new window
                this.templatePrintService.getPrintHtml(printTemplate);
                if (!response?.isPostcard) {
                    this.templatePrintService.PrintBulkLetterAppointment(printTemplate).then((results: string[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                } else {
                    this.templatePrintService.PrintBulkPostcardAppointment(printTemplate).then((results: PatientPostcardInfo[]) => {
                        this.templatePrintService.bindHtml(results, printTemplate?.isPostcard);
                    }, () => {
                        this.templatePrintService.failure(printTemplate?.isPostcard);
                    });
                }
            }
        }
    }

    showWarningModal = () => {
        const message = this.translate.instant('More than 200 records.');
        const title = this.translate.instant('Warning!');
        const button2Text = this.translate.instant('Ok');
        this.modalFactory.ConfirmModal(title, message, button2Text).then(() => { });
    }
}
export class OtherToDoGridData implements IGridHelper {
    constructor(private translate: TranslateService,
        private patientLandingGridService: PatientLandingGridService,
        private patientFilterService: PatientFilterService,
        private locationTimeService: LocationTimeService) { }

    fetch = (request, tempRequest, url: string, locationId: number): Promise<OtherToDo> => {
        document.title = this.translate.instant(DocumentTitles.OtherToDo);
        request.FilterCriteria.LocationId = locationId;
        request.CurrentPage = this.patientFilterService.CurrentPage;
        this.patientFilterService.currentFilterCriteria = request.FilterCriteria;
        tempRequest = cloneDeep(request);
        this.transformRequestData(tempRequest);
        return this.patientLandingGridService.getAllToDo(tempRequest, url);
    }

    transformRequestData = (tempRequest) => {
        const otherToDoFields = this.patientFilterService.getDateTimeFields();
        Object.values(otherToDoFields)?.forEach((key) => {
            if (tempRequest?.FilterCriteria[key]) {
                tempRequest.FilterCriteria[key] = this.locationTimeService.toUTCDateKeepLocalTime(tempRequest?.FilterCriteria[key]);
            }
        });
    }

    onDateRangeFilter = (otherToDoRequest: OtherToDoRequest, data: { startDate: Date; endDate: Date; }, field: string): OtherToDoRequest => {
        const fieldMapping = {
            [DateRangeFilterType.DueDate]: ['DueDateFrom', 'DueDateTo'],
            [DateRangeFilterType.OtherToDoLastAppointment]: ['PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo'],
            [DateRangeFilterType.NextAppointment]: ['NextAppointmentDateFrom', 'NextAppointmentDateTo'],
            [DateRangeFilterType.LastCommunication]: ['LastCommunicationFrom', 'LastCommunicationTo']
        };

        if (fieldMapping[field]) {
            const [fromField, toField] = fieldMapping[field];
            if (data.startDate) {
                otherToDoRequest.FilterCriteria[fromField] = data.startDate;
            } else {
                delete otherToDoRequest?.FilterCriteria?.[fromField];
            }
            if (data.endDate) {
                otherToDoRequest.FilterCriteria[toField] = data.endDate;
            } else {
                delete otherToDoRequest?.FilterCriteria?.[toField];
            }
        }

        return otherToDoRequest;
    }

    onSortGridData = (sortData: ({ sortField: string, sortDirection: number })): OtherToDoGridSort => {
        const currentSortField = PatientSortField[sortData.sortField];
        const otherToDoGridSort = new OtherToDoGridSort();
        otherToDoGridSort[currentSortField] = sortData.sortDirection;
        return otherToDoGridSort;
    }

    onSlideOutFilterChange = (otherToDoRequest: OtherToDoRequest, filter: OtherToDoGridFilter): OtherToDoRequest => {
        otherToDoRequest.FilterCriteria = filter;
        if(!otherToDoRequest?.FilterCriteria?.DueDateItems?.length){
            delete otherToDoRequest.FilterCriteria.DueDateItems;
        }
        return otherToDoRequest;
    }
}
