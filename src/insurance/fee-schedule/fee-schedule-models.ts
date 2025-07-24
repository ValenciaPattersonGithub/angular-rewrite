// models for fee schedule management in the Soar UI application
export class FeeScheduleGroupDetailUpdate {
    IsSelected: boolean;
    ServiceCodeId?: string;
    ServiceCodeDisplayAs?: string;    
    FeeScheduleId: string; 
    FeeScheduleName: string;
    FeeScheduleGroupId: string | null;
    FeeScheduleGroupDetailId: string | null;
    CurrentAmount: number;
    UpdatedAmount: number;
    Locations: FeeScheduleGroupDetailLocation[];
}

export class FeeScheduleGroupDetailLocation {
    LocationId: number;
    LocationName: string;
}

export interface AllLocations {
    LocationId: number;
    NameLine1: string;
}



