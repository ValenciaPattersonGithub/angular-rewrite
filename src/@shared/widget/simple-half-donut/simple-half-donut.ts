export class SimpleHalfDonutChart {
    Appointment?: string;
    Data?: SimpleHalfDonutFilterList;
    DefaultFilter?: string;
    FilterList?: Array<string>
}

export class SeriesData {
    Category?: string;
    Color?: string;
    Count?: number;
    Label?: string;
    SeriesName?: string;
    Value?: number;
}

export class SimpleHalfDonutFilterList {    
    MTD?: SimpleHalfDonutFiltersData;
    YTD?: SimpleHalfDonutFiltersData;
    LastYear?: SimpleHalfDonutFiltersData;
    LastMonth?: SimpleHalfDonutFiltersData;
}

export class SimpleHalfDonutFiltersData {
    SeriesData?: Array<SeriesData>;
    TotalStatements?: number;
    TotalValue?: number
}

export enum SimpleHalfDonutFiltersTypes {   
    MTD = "MTD",
    YTD = "YTD",
    LastMonth = "Last Month",
    LastYear = "Last Year"    
}

export enum SerialCategory {
    Value = "Value",
    Goal = "Goal",
}


