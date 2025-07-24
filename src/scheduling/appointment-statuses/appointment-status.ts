import {Injectable} from "@angular/core";

//TODO: Research -- declarationMerging ... look up to understand how it knows the interface works with the class
export interface AppointmentStatus {
    id: number,
    description: string,
    icon: string,
    sectionEnd: boolean,
    descriptionNoSpace: string,
    descriptionTranslation: string,
    visibleInPatientGrid?: boolean
}

@Injectable()
export class AppointmentStatus {

    constructor (id: number, description: string, icon: string, sectionEnd: boolean,visibleInPatientGrid:boolean)
    {
        this.id = id;
        this.description = description;
        this.icon = icon;
        this.sectionEnd = sectionEnd;
        this.descriptionNoSpace = description.replace(/\s/g, "");
        this.descriptionTranslation = ''; // after we convert to a new way of translating I will translate the value here.
        this.visibleInPatientGrid = visibleInPatientGrid; //To handle visibility of statuses in the patient grid
    }
}