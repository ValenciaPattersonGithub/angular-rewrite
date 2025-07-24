import { Injectable } from "@angular/core"
import { CoreModule } from "../core.module"

export interface IPlaceOfTreatment {
    code: number;
    description: string;
}

export interface IProcedureCodeModifierType {
    code: number;
    description: string;
}

export enum PlaceOfTreatmentEnum {
    Office = 11,
    OtherPlaceOfTreatment = -1
}

@Injectable({
    providedIn: CoreModule
})

export class ClaimEnumService {
    constructor() { }

    getPlaceOfTreatment(): IPlaceOfTreatment[] {

        let placeOfTreatments: IPlaceOfTreatment[] = [
            { code: 1, description: '01 - Pharmacy' },
            { code: 2, description: '02 - Telehealth Provided Other than in Patient’s Home' },
            { code: 3, description: '03 - School' },
            { code: 4, description: '04 - Homeless Shelter' },
            { code: 5, description: '05 - Indian Health Service Free-standing Facility' },
            { code: 6, description: '06 - Indian Health Service Provider-based Facility' },
            { code: 7, description: '07 - Tribal 638 Free-standing Facility' },
            { code: 8, description: '08 - Tribal 638 Provider-based Facility' },
            { code: 9, description: '09 - Prison/Correctional Facility' },
            { code: 10, description: '10 - Telehealth Provided in Patient’s Home' },
            { code: 11, description: '11 - Office' },
            { code: 12, description: '12 - Home' },
            { code: 13, description: '13 - Assisted Living Facility' },
            { code: 14, description: '14 - Group Home' },
            { code: 15, description: '15 - Mobile Unit' },
            { code: 16, description: '16 - Temporary Lodging' },
            { code: 17, description: '17 - Walk-in Retail Health Clinic' },
            { code: 18, description: '18 - Place of Employment-Worksite' },
            { code: 19, description: '19 - Off Campus-Outpatient Hospital' },
            { code: 20, description: '20 - Urgent Care Facility' },
            { code: 21, description: '21 - Inpatient Hospital' },
            { code: 22, description: '22 - On Campus-Outpatient Hospital' },
            { code: 23, description: '23 - Emergency Room – Hospital' },
            { code: 24, description: '24 - Ambulatory Surgical Center' },
            { code: 25, description: '25 - Birthing Center' },
            { code: 26, description: '26 - Military Treatment Facility' },
            { code: 27, description: '27 - Outreach Site/ Street' },
            { code: 31, description: '31 - Skilled Nursing Facility' },
            { code: 32, description: '32 - Nursing Facility' },
            { code: 33, description: '33 - Custodial Care Facility' },
            { code: 34, description: '34 - Hospice' },
            { code: 41, description: '41 - Ambulance - Land' },
            { code: 42, description: '42 - Ambulance – Air or Water' },
            { code: 49, description: '49 - Independent Clinic' },
            { code: 50, description: '50 - Federally Qualified Health Center' },
            { code: 51, description: '51 - Inpatient Psychiatric Facility' },
            { code: 52, description: '52 - Psychiatric Facility-Partial Hospitalization' },
            { code: 53, description: '53 - Community Mental Health Center' },
            { code: 54, description: '54 - Intermediate Care Facility/ Individuals with Intellectual Disabilities' },
            { code: 55, description: '55 - Residential Substance Abuse Treatment Facility' },
            { code: 56, description: '56 - Psychiatric Residential Treatment Center' },
            { code: 57, description: '57 - Non-residential Substance Abuse Treatment Facility' },
            { code: 58, description: '58 - Non-residential Opioid Treatment Facility' },
            { code: 60, description: '60 - Mass Immunization Center' },
            { code: 61, description: '61 - Comprehensive Inpatient Rehabilitation Facility' },
            { code: 62, description: '62 - Comprehensive Outpatient Rehabilitation Facility' },
            { code: 65, description: '65 - End-Stage Renal Disease Treatment Facility' },
            { code: 71, description: '71 - Public Health Clinic' },
            { code: 72, description: '72 - Rural Health Clinic' },
            { code: 81, description: '81 - Independent Laboratory' },
            { code: 99, description: '99 - Other Place of Service' }]

        return placeOfTreatments;
    }

    getprocedureCodeModifierTypes(): IProcedureCodeModifierType[] {
        let procedureCodeModifierTypes: IProcedureCodeModifierType[] = [
            { code: 0, description: "" },
            { code: 1, description: "KX" },
            { code: 2, description:"GY" }
        ]

        return procedureCodeModifierTypes;
    }
}