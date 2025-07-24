export class GaugeChart {
    Appointment?: string;
    Data?: GaugeFilters;
    DefaultFilter?: string;
    FilterList?: Array<string>
}

export class GaugeFilters {
    YTD?: GaugeFiltersData;
    MTD?: GaugeFiltersData;
    Today?: GaugeFiltersData;

    //TO DO -- need to map APIs response from 'Last Year' to 'LastYear' and same for 'Last Month' to 'LastMonth',
    //There is space in APIs response, but we cannot declare property like that so we need to map
    LastYear?: GaugeFiltersData;
    LastMonth?: GaugeFiltersData;
}

export class GaugeFiltersData {
    SeriesData?: Array<SeriesData>;
    TotalStatements?: number;
    TotalValue?: number
}

export class SeriesData {
    Category?: string;
    Color?: string;
    Count?: number;
    Label?: string;
    SeriesName?: string;
    Value?: number;
}

export enum GaugeChartType {
    GrossProduction = 1,
    NetProduction = 2,
    ScheduleUtilization = 3,
    OtherType = 4
}

export enum GaugeSerialCategory {
    Value = "Value",
    Goal = "Goal",
    TotalMinutesBooked = "TotalMinutesBooked",
    TotalMinutesAvailable = "TotalMinutesAvailable"
}

export enum SeriesNameTypes {
    _hole_ = "_hole_"
}

export enum GaugeFiltersTypes {
    YTD = "YTD",
    MTD = "MTD",
    Today = "Today",
    LastYear = "Last Year",
    LastMonth = "Last Month",
    DateRange = "Date Range"
}

export enum GaugeChartColors {
    GrossNetProductionColor = "#59ADC9",
    ScheduleColor = '#AFB5B9',
    NoDataColor = '#fff',
    rangeLineCap = "butt"
}

export enum GaugeReferralFiltersTypes {
    YTD = "YTD",
    MTD = "MTD",
    LastYear = "Last Year",
    DateRange = "Date Range"
}
