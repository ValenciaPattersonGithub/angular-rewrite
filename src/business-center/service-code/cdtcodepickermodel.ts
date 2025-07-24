
export class CDTCodeModel {
	AffectedAreaId: number;
	CdtCodeId: string;
	Code: string;
	DataTag: string;
	DateModified: string;
	Description: string;
	DisplayAs: string;
	IconName: string;
	ServiceTypeId: string;
	SubmitOnInsurance: boolean;
	TaxableServiceTypeId: number;
	UserModified: string;

	constructor(AffectedAreaId: number, CdtCodeId: string, Code: string, DataTag: string,DateModified: string,Description: string,
		DisplayAs: string,IconName: string,ServiceTypeId: string,SubmitOnInsurance: boolean,TaxableServiceTypeId: number,
		UserModified: string) {

		this.AffectedAreaId = AffectedAreaId;
		this.CdtCodeId = CdtCodeId;
		this.Code = Code;
		this.DataTag = DataTag;
		this.DateModified = DateModified;
		this.Description = Description;
		this.DisplayAs = DisplayAs;
		this.IconName = IconName;
		this.ServiceTypeId = ServiceTypeId;
		this.SubmitOnInsurance = SubmitOnInsurance;
		this.TaxableServiceTypeId = TaxableServiceTypeId;
		this.UserModified = UserModified;
	}
}