export interface ExportData {
    TemplateType: string;
    Header: {
        Title: string;
        DateTime: string;
        LocationOrPracticeName: string;
    };
    Filters: {};
    Columns: string[];
    Rows: {
        MainData: string;
        SubRows: {
            Cells: string[];
        }[];
    }[];
}

export interface ExportRequest {
    blobId: string;
    format: string;
    jsonData: string;
    fileName: string;
}