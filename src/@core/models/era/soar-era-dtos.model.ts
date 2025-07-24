import { ClaimDto } from "../bulk-payment/bulk-insurance-dtos.model";
import { ClaimStatus } from "../claim/claim-enums.model";
import { CurrencyType } from "../currency/currency-type.model";

export class EraHeaderDto {
    EraHeaderId: number;
    Amount: number;
    PaymentNumber: string;
    Paid: number;
    CarrierName: string;
    EraClaimPayments: EraClaimPaymentDto[];
    IsAssociatedWithBulk: boolean;
    IsProcessed: boolean;
    ContainsAllPredeterminations: boolean;
    CurrencyType: CurrencyType;
    IsAutoMatched: boolean;
    EraPayerName: string | null;

    // Non-DTO / Component
    expanded: boolean;
    canView: boolean;
    tooltip: string;
    PaymentString: string;
    claimOrder: { sortColumnName: string, sortDirection: number };
    items: EraHeaderMenuItem[];
}

export class EraHeaderMenuItem {
    label: string;
    click: string;
    disabled?: boolean;
    disabledText?: string;
};

export class EraClaimPaymentDto {
    LocationId: number;
    PatientFirstName: string;
    PatientLastName: string;
    Amount: number;
    EraSubmittedAmount: number;
    ClaimStatus: ClaimStatus;
    Matched: boolean;
    EraPatientFirst: string;
    EraPatientMiddle: string;
    EraPatientLast: string;

    // Non-DTO / Component
    inAllowedLocation: boolean;
    location: string;
    patientName: string;
    ClaimStatusText: string;
    items: EraHeaderMenuItem[];
}

export class EraPaymentDto {
    Era: EraHeaderDto;
    ClaimPayments: ClaimDto[];
    PaidTotal: number;
    LocationIds: [];
}

