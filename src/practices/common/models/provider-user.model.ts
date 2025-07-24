import { Address } from 'src/patient/common/models/address.model';

export interface ProviderUser {
    UserId:                         string;
    FirstName:                      string;
    MiddleName:                     null;
    LastName:                       string;
    PreferredName:                  null;
    SuffixName:                     null;
    DateOfBirth:                    null;
    UserName:                       string;
    UserCode:                       string;
    ImageFile:                      null;
    EmployeeStartDate:              null;
    EmployeeEndDate:                null;
    Address:                        Address;
    DepartmentId:                   null;
    JobTitle:                       null;
    RxUserType:                     number;
    TaxId:                          null;
    FederalLicense:                 null;
    DeaNumber:                      null;
    NpiTypeOne:                     null;
    PrimaryTaxonomyId:              null;
    SecondaryTaxonomyId:            null;
    DentiCalPin:                    null;
    StateLicense:                   null;
    AnesthesiaId:                   null;
    IsActive:                       boolean;
    StatusChangeNote:               null;
    ProfessionalDesignation:        null;
    Locations:                      null;
    Roles:                          null;
    ShowCardServiceDisabledMessage: boolean;
    DataTag:                        string;
    UserModified:                   string;
    DateModified:                   string;
}