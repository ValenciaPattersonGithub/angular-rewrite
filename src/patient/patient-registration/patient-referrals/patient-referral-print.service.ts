import { Injectable } from "@angular/core";
import { ExportFileHttpService } from "src/@core/http-services/export-file-http.service";
import { ExportData } from "src/@shared/models/export-data.model";
import { PrintPatientReferral } from "./patient-referral-print.model";
import { ExportRequest } from "src/@shared/models/export-data.model";

@Injectable()
export class PatientReferralPrintService {
    constructor(private exportFileHttpService: ExportFileHttpService) { }

    downloadPatientReferral = (printPatientReferral: PrintPatientReferral) => {
        const exportData: ExportData = this.createDataToExport(printPatientReferral);
        var exportrequest: ExportRequest = {
            blobId: '',
            format: 'pdf',
            jsonData: JSON.stringify(exportData),
            fileName: 'CreateReferral.pdf'
        }

        this.exportFileHttpService.exportFile(exportrequest);
    }

    createDataToExport = (printPatientReferral: PrintPatientReferral): ExportData => {
        const exportData: ExportData = {
            TemplateType: 'CreateReferral',
            Header: null,
            Filters: null,
            Columns: ['Name', 'DOB', 'Age', 'Phone', 'Work Phone', 'Email', 'Gender', 'Responsible Party', 'Height', 'Weight', 'Alerts', 'Signature on File', 'Status Patient', 'Notes', 'Referring Office Address', 'Services','CampaignName','Referral Category','Referring Office Address2','Referring Patient Email', 'Next Appointment', 'Expected Return date', 'Referring Email' ,'Referring Phone', 'Actual Return Date'],
            Rows: [
                {
                    MainData: null,
                    SubRows: [
                        {
                            Cells: [
                                printPatientReferral.name,
                                printPatientReferral.dob,
                                printPatientReferral.age,
                                printPatientReferral.phone,
                                printPatientReferral.workPhone,
                                printPatientReferral.email,
                                printPatientReferral.gender,
                                printPatientReferral.responsibleParty,
                                printPatientReferral.height,
                                printPatientReferral.weight,
                                printPatientReferral.alerts,
                                printPatientReferral.signatureOnFile,
                                printPatientReferral.statusPatient,
                                printPatientReferral.notes,
                                printPatientReferral.referringOfficeAddress1,
                                printPatientReferral.practiceName,
                                printPatientReferral.referringOfficeName,
                                printPatientReferral.referringDoctorName,
                                printPatientReferral.treatmentPlan,
                                printPatientReferral.services?.join(', '),
                                printPatientReferral.reportType,
                                printPatientReferral.referralSource,
                                printPatientReferral.campaignName,
                                printPatientReferral.referralCategory,
                                printPatientReferral.referringOfficeAddress2,
                                printPatientReferral.referringPatientEmail,
                                printPatientReferral.nextAppointment,
                                printPatientReferral.returnDate,
                                printPatientReferral.referringEmail,
                                printPatientReferral.referringPhone,
                                printPatientReferral.actualReturnDate
                            ]
                        }
                    ]
                }
            ]
        }
        return exportData;
    }
}
