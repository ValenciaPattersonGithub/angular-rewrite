import { InvalidPropertyInfo } from "../base-models.model";

export class SoarResponse<TValue> {
    ExtendedStatusCode?: number
    Value?: TValue;
    InvalidProperties?: InvalidPropertyInfo[];
}

export class ReferralResponse<TValue> {
    message: string
    statusCode: number
    data?: TValue;
}

export class PdfResponse {
    data: ArrayBuffer | Blob;      
    contentType: string;           
    status: number;  
}