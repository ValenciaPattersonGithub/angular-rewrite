// To Do - this needs to be changed to standard service once old standard service is removed
export class NewStandardServiceModel<T> {
    OriginalData?: T;
    Data?: T;
    IdField?: string;
    Name?: string;
    Valid?: boolean = true;
    Loading?: boolean = false;
    Saving?: boolean = false;
    Deleting?: boolean = false;
    IsDuplicate?: boolean = false;
    IsServiceCodeUsed?: boolean = false;
}
