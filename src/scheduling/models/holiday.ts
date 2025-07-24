export interface NewHoliday {
    Description: string;
    Date?: Date | null;
    IsActive: boolean;
    IsDefaultHoliday: boolean;
    ByDay: boolean;
    ByMonthlyDay: boolean;
    SetPos: number;
}

export interface Holiday extends NewHoliday {
    Occurrences: string[];
    HolidayId: string;
    DataTag: string;
}
