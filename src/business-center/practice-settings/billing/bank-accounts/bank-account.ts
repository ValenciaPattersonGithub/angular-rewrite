import { InvalidPropertyInfo } from "src/@core/models/base-models.model";

export interface FilterCriteria {
    Name?:string;
    Locations?:string;
    Institution?:string;
    Description?:string;
    AccountNumber?:string;
    RoutingNumber?:string;
    BankAccountId?:string;
    LocationId?:number;
    InActive?:boolean;
}

export interface SortCriteria {
    Name?:number;
    Locations?:number;
    Institution?:number;
    Description?:number;
    AccountNumber?:number;
    RoutingNumber?:number;
    BankAccountId?:number;
}

export interface BankAccountRequest {
    uiSuppressModal?:boolean;
    PageCount?:number;
    CurrentPage?:number;
    FilterCriteria?:FilterCriteria;
    SortCriteria?:SortCriteria;
}



export interface FilterCriteria {
    InActive?:boolean;
}

export interface SortCriteria {
    Name?:number;
    Locations?:number;
    Institution?:number;
    Description?:number;
    AccountNumber?:number;
    RoutingNumber?:number;
}

export interface Row {
    Name?:string;
    BankAccountId?:number;
    BankLocations?:number[];
    Locations?:string;
    Institution?:string;
    Description?:string;
    RoutingNumber?:string;
    AccountNumber?:string;
    DataTag?:string;
    IsActive?:boolean;
    DisabledEdit?:boolean;
}

export interface Value {
    PageCount?:number;
    CurrentPage?:number;
    FilterCriteria?:FilterCriteria;
    SortCriteria?:SortCriteria;
    TotalCount?:number;
    Rows?:Row[];
}

export interface BankAccountResponse {
    ExtendedStatusCode?:number;
    Value?:Value;
    Count?:number;
    InvalidProperties?:InvalidPropertyInfo[];
}

export class locationList {
    nameLine1?: string;
    locationId?: string;
    inactiveDate?: string;
    sortOrder?: number;
    text?: string;
    value?: number;
    subcategory?: string;
    deactivationTimeUtc?: string;
  }





