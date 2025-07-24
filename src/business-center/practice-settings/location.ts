import { PaymentProvider } from "../../@shared/enum/accounting/payment-provider";
import { CardReader } from "./card-reader/card-reader";

export class Location {
    AcceptMasterCardOnEstatement?: boolean;
    AcceptDiscoverOnEstatement?: boolean;
    AcceptVisaOnEstatement?: boolean;
    AcceptAmericanExpressOnEstatement?: boolean;
    IncludeCvvCodeOnEstatement?: boolean;
    RemitAddressSource?: Number;
    RemitToNameLine1?: string;
    RemitToNameLine2?: string;
    RemitToAddressLine1?: string;
    RemitToAddressLine2?: string;
    RemitToCity?: string;
    RemitToState?: string;
    RemitToZipCode?: string;
    RemitToPrimaryPhone?: string;
    RemitOtherLocationId?: Number;
    InsuranceRemittanceAddressSource?: Number;
    InsuranceRemittanceNameLine1?: string = '';
    InsuranceRemittanceNameLine2?: string = '';
    InsuranceRemittanceAddressLine1?: string = '';
    InsuranceRemittanceAddressLine2?: string = '';
    InsuranceRemittanceCity?: string = '';
    InsuranceRemittanceState?: string = '';
    InsuranceRemittanceZipCode?: string = '';
    InsuranceRemittancePrimaryPhone?: string = '';
    InsuranceRemittanceTaxId?: string = '';
    InsuranceRemittanceTypeTwoNpi?: string = '';
    InsuranceRemittanceLicenseNumber?: string = '';
    InsuranceRemittanceOtherLocationId?: Number;
    Timezone?: string;
    Rooms?: Array<Rooms>;
    Fax?: string;
    PrimaryPhone?: string;
    DeactivationTimeUtc?: Date;
    State?: string;
    LocationId?: number;
    NameLine1?: string;
    NameLine2?: string;
    NameAbbreviation?: string;
    Email?: string;
    Website?: string;
    SecondaryPhone?: string;
    AddressLine1?: string;
    AddressLine2?: string;
    City?: string;
    ZipCode?: string
    SalesAndUseTaxRate?: number;
    DefaultFinanceCharge?: number;
    MerchantId?: string; // Account credential associated with openEdge. To be deprecated
    DisplayCardsOnEstatement?: boolean;
    ProviderTaxRate?: number;
    isActiveLoc?: boolean;
    MinimumFinanceCharge?: Number;
    IsPaymentGatewayEnabled?: boolean;
    isEstatementsEnabled?: boolean;
    TaxId?: string;
    TypeTwoNpi?: string;
    LicenseNumber?: string;
    AdditionalIdentifiers?: Array<AdditionalIdentifier>;
    AccountsOverDue?: string;
    TaxonomyId?: Number;
    FeeListId?: Number;
    MasterLocationAdditionalIdentifiers?: [];
    DataTag?: string;
    DateModified?: string;
    ImageFile?: string;
    IsRxRegistered?: boolean;
    LogoFile?: string;
    UserModified?: string;
    StateName?: string;
    SortOrder?: number;
    PaymentProvider?: PaymentProvider;
    PaymentProviderAccountCredential?: string; // Account credential associated with GPI
    PlaceOfTreatment?: number;
    CardReaders?: Array<CardReader>;

    constructor(RemitToAddressLine1: string, AdditionalIdentifiers: Array<AdditionalIdentifier>,
        DisplayCardsOnEstatement: boolean, InsuranceRemittanceAddressSource: Number,
        InsuranceRemittanceCity: string, InsuranceRemittanceNameLine1: string,
        InsuranceRemittanceNameLine2: string, InsuranceRemittanceOtherLocationId: Number,
        InsuranceRemittancePrimaryPhone: string, InsuranceRemittanceState: string,
        InsuranceRemittanceZipCode: string, IsPaymentGatewayEnabled: boolean,
        TaxonomyId: Number, FeeListId: Number, LocationId: number, AcceptMasterCardOnEstatement: boolean,
        AcceptDiscoverOnEstatement: boolean, AcceptVisaOnEstatement: boolean, AcceptAmericanExpressOnEstatement: boolean,
        IncludeCvvCodeOnEstatement: boolean, RemitAddressSource: Number, RemitToNameLine1: string,
        RemitToNameLine2: string, RemitToAddressLine2: string, RemitToCity: string, RemitToState: string,
        RemitToZipCode: string, RemitToPrimaryPhone: string, RemitOtherLocationId: Number,
        InsuranceRemittanceAddressLine1: string, InsuranceRemittanceAddressLine2: string,
        InsuranceRemittanceTaxId: string, InsuranceRemittanceTypeTwoNpi: string,
        InsuranceRemittanceLicenseNumber: string, Timezone: string, Rooms: Array<Rooms>, Fax: string,
        PrimaryPhone: string, DeactivationTimeUtc: Date, State: string, NameLine1: string,
        NameLine2: string, NameAbbreviation: string, Email: string, Website: string,
        SecondaryPhone: string, AddressLine1: string, AddressLine2: string, City: string,
        ZipCode: string, SalesAndUseTaxRate: number, DefaultFinanceCharge: number,
        MerchantId: string, ProviderTaxRate: number, isActiveLoc: boolean, MinimumFinanceCharge: Number,
        isEstatementsEnabled: boolean, TaxId: string,
        TypeTwoNpi: string, LicenseNumber: string, AccountsOverDue: string, MasterLocationAdditionalIdentifiers: [],
        IsRxRegistered: boolean, StateName: string, SortOrder: number, PaymentProvider: PaymentProvider,
        PaymentProviderAccountCredential: string, PlaceOfTreatment: number,CardReaders: Array<CardReader>
    ) {
        this.RemitToAddressLine1 = RemitToAddressLine1;
        this.AdditionalIdentifiers = AdditionalIdentifiers;
        this.DisplayCardsOnEstatement = DisplayCardsOnEstatement;
        this.InsuranceRemittanceAddressSource = InsuranceRemittanceAddressSource;
        this.InsuranceRemittanceCity = InsuranceRemittanceCity;
        this.InsuranceRemittanceNameLine1 = InsuranceRemittanceNameLine1;
        this.InsuranceRemittanceNameLine2 = InsuranceRemittanceNameLine2;
        this.InsuranceRemittanceOtherLocationId = InsuranceRemittanceOtherLocationId;
        this.InsuranceRemittancePrimaryPhone = InsuranceRemittancePrimaryPhone;
        this.InsuranceRemittanceState = InsuranceRemittanceState;
        this.InsuranceRemittanceZipCode = InsuranceRemittanceZipCode;
        this.IsPaymentGatewayEnabled = IsPaymentGatewayEnabled;
        this.TaxonomyId = TaxonomyId;
        this.FeeListId = FeeListId;
        this.LocationId = LocationId;
        this.AcceptMasterCardOnEstatement = AcceptMasterCardOnEstatement;
        this.AcceptDiscoverOnEstatement = AcceptDiscoverOnEstatement;
        this.AcceptVisaOnEstatement = AcceptVisaOnEstatement;
        this.AcceptAmericanExpressOnEstatement = AcceptAmericanExpressOnEstatement;
        this.IncludeCvvCodeOnEstatement = IncludeCvvCodeOnEstatement;
        this.RemitAddressSource = RemitAddressSource;
        this.RemitToNameLine1 = RemitToNameLine1;
        this.RemitToNameLine2 = RemitToNameLine2;
        this.RemitToAddressLine2 = RemitToAddressLine2;
        this.RemitToCity = RemitToCity;
        this.RemitToState = RemitToState;
        this.RemitToZipCode = RemitToZipCode;
        this.RemitToPrimaryPhone = RemitToPrimaryPhone;
        this.RemitOtherLocationId = RemitOtherLocationId;
        this.InsuranceRemittanceAddressLine1 = InsuranceRemittanceAddressLine1;
        this.InsuranceRemittanceAddressLine2 = InsuranceRemittanceAddressLine2;
        this.InsuranceRemittanceTaxId = InsuranceRemittanceTaxId;
        this.InsuranceRemittanceTypeTwoNpi = InsuranceRemittanceTypeTwoNpi;
        this.InsuranceRemittanceLicenseNumber = InsuranceRemittanceLicenseNumber;
        this.Timezone = Timezone;
        this.Rooms = Rooms
        this.Fax = Fax;
        this.PrimaryPhone = PrimaryPhone;
        this.DeactivationTimeUtc = DeactivationTimeUtc;
        this.State = State;
        this.NameLine1 = NameLine1;
        this.NameLine2 = NameLine2;
        this.NameAbbreviation = NameAbbreviation;
        this.Email = Email;
        this.Website = Website;
        this.SecondaryPhone = SecondaryPhone;
        this.AddressLine1 = AddressLine1;
        this.AddressLine2 = AddressLine2;
        this.City = City;
        this.ZipCode = ZipCode;
        this.SalesAndUseTaxRate = SalesAndUseTaxRate;
        this.DefaultFinanceCharge = DefaultFinanceCharge;
        this.MerchantId = MerchantId;
        this.ProviderTaxRate = ProviderTaxRate;
        this.isActiveLoc = isActiveLoc;
        this.MinimumFinanceCharge = MinimumFinanceCharge;
        this.InsuranceRemittanceLicenseNumber = InsuranceRemittanceLicenseNumber;
        this.isEstatementsEnabled = isEstatementsEnabled;
        this.TaxId = TaxId;
        this.TypeTwoNpi = TypeTwoNpi;
        this.LicenseNumber = LicenseNumber;
        this.AccountsOverDue = AccountsOverDue;
        this.MasterLocationAdditionalIdentifiers = MasterLocationAdditionalIdentifiers;
        this.IsRxRegistered = IsRxRegistered;
        this.StateName = StateName;
        this.SortOrder = SortOrder;
        this.PaymentProvider = PaymentProvider
        this.PaymentProviderAccountCredential = PaymentProviderAccountCredential;
        this.PlaceOfTreatment = PlaceOfTreatment;
        this.CardReaders = CardReaders;        
    }
}

export interface TimeZoneModel {
    Display?: string;
    Value?: string;
}

export class Rooms {
    RoomId?: Number;
    LocationId?: Number;
    Name?: string;
    ObjectState?: string;
    FailedMessage?: string;
    $unique: boolean;
    $duplicate?: boolean;
}

export class AdditionalIdentifier {
    LocationIdentifierId?: Number;
    LocationId?: Number;
    MasterLocationIdentifierId?: Number;
    Value?: string;
    Description?: string;
}

export class MasterAdditionalIdentifier {
    MasterLocationIdentifierId?: Number;
    Description?: string;
    DateDeleted?: Date;
    Qualifier?: Number;
}

export class StateList {
    Abbreviation?: string;
    DataTag?: string;
    DateModified?: string;
    Name?: string;
    StateId?: Number;
    UserModified?: string;
}

