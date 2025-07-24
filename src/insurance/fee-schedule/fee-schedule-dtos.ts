
export class FeeScheduleDto {
    DataTag: string;
    DateModified: string;    
    FeeScheduleId: string;
    FeeScheduleName: string;
    FeeScheduleDetailDtos: FeeScheduleDetailDto[];
    FeeScheduleGroupDtos: FeeScheduleGroupDto[];
    UserModified: string;
}

export class FeeScheduleDetailDto {
   DataTag: string;
    DateModified: string;  
    FailedMessage: string;  
    FeeScheduleId: string;
    FeeScheduleDetailId: string;
    IsManagedCare: boolean;
    ObjectState: string;
    ServiceCodeId: string;
    UserModified: string;
}

export class FeeScheduleGroupDto {
    DataTag: string;
    DateModified: string;
    FailedMessage: string;    
    FeeScheduleGroupId: string;
    FeeScheduleId: string;
    LocationIds: number[];
    ObjectState: string;
    SortOrder: number;  
    FeeScheduleGroupDetails: FeeScheduleGroupDetailDto[];
    UserModified: string;
}

export class FeeScheduleGroupDetailDto {
    AllowedAmount: number;    
    DataTag: string;
    DateModified: string; 
    FailedMessage: string;
    FeeScheduleGroupDetailId: string;
    FeeScheduleGroupId: string;    
    ObjectState: string;
    ServiceCodeId: string;
    UserModified: string;
}


export class UpdatedAllowedAmountDto {
    ClaimLocationId: number;
    ServiceCodeId: string;   
    FeeScheduleId: string; 
    FeeScheduleGroupId: string | null;
    FeeScheduleGroupDetailId: string | null;
    CurrentAmount: number;
    UpdatedAmount: number;
}

export class FeeScheduleGroupDetailUpdateDto {
    IsSelected: boolean;
    ServiceCodeId?: string;
    ServiceCodeDisplayAs?: string;    
    FeeScheduleId: string; 
    FeeScheduleName: string;
    FeeScheduleGroupId: string | null;
    FeeScheduleGroupDetailId: string | null;
    CurrentAmount: number;
    UpdatedAmount: number;
    Locations: FeeScheduleGroupDetailLocationDto[];
}


export class FeeScheduleGroupDetailLocationDto {
    LocationId: number;
    LocationName: string;
}


export interface AllLocations {
    LocationId: number;
    NameLine1: string;
}



