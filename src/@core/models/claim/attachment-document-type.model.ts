export class AttachmentDocumentTypeDto {
    DisplayDocumentName:string;
    AttachmentDocumentType:string;
    OrientationRequired: boolean;
}

export class EAttachmentFileTypesDto {
    ValidFileExtensions: string[];
    DocumentTypes: AttachmentDocumentTypeDto[];
    OrientationRequired: boolean;
}

