import { Component, EventEmitter, Inject, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ReferralType, ReferralSourceType, GetProviderReferralAffiliatesRequest, GetPracticeAffiliatesRequest } from '../referral-type.model';
import { ReferralResponse } from 'src/@core/models/core/soar-response';
import { ReferralManagementHttpService } from '../../../../../@core/http-services/referral-management-http.service';
import { NgTemplateOutlet } from '@angular/common';

// export const emailOrPhoneRequiredValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//     const email = control.get('email').value;
//     const phone = control.get('phone').value;

//     return (email || phone) ? null : { emailOrPhoneRequired: true };
// };

@Component({
    selector: 'referral-type-curd',
    templateUrl: './referral-type-crud.component.html',
    styleUrls: ['./referral-type-crud.component.scss']
})

export class ReferralTypeCrudComponent extends DialogContentBase implements OnInit {
    addReferralType: FormGroup;
    title: string;
    isActiveStatus: true;
    @Output() refreshReferralTypeGrid = new EventEmitter();
    referralTypes: ReferralType;
    editReferralType: ReferralType;
    isValidZipCode = true;
    
    setActive: string;
    displayStyle = "none";
    public practiceList = [];
    public providerAffiliates = [];
    practiceId: any;

    pageNumber: number = 1;
    pageSize: number = 15;
    sortColumn: string = "FirstName";
    sortOrder: string = "ASC";
    initialValues: any = {};
    isFormModified: boolean = false;
    isPracticeSelected: boolean = false;

    constructor(
        @Inject('ReferralTypeService') private referralTypesService,
        @Inject('practiceService') private practiceService,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService,
        private fb: FormBuilder,
        public dialog: DialogRef,
        private referralManagementHttpService: ReferralManagementHttpService,
        private dialogService: DialogService
    ) {
        super(dialog);
        
    }

    ngOnInit(): void {
        this.practiceId = this.practiceService.getCurrentPractice().id;
        this.title = "Add Referral Affiliate";
        this.setActive = "Active";
        this.editReferralType = this.dialog.content.instance.referralType;
        if (this.editReferralType != null) {
            this.title = "Edit Referral Affiliate";
        }
        this.createFormControls(this.editReferralType);
        this.title = this.dialog.content.instance.title;
    }

    CancelAddReferralType = () => {
        this.dialog.close();
    }

    createFormControls = (referalType: ReferralType) => {
        if (referalType) {
            this.addReferralType = this.fb.group({
                referralSourceType: [ReferralSourceType.Both],
                firstName: [referalType.firstName, [Validators.maxLength(100)]],
                middleName: [referalType.middleName, [Validators.maxLength(100)]],
                lastName: [referalType.lastName, [Validators.maxLength(100)]],
                address1: [referalType.address1, [Validators.maxLength(250)]],
                address2: [referalType.address2, [Validators.maxLength(250)]],
                city: [referalType.city, [Validators.maxLength(64)]],
                state: [referalType.state, []],
                zipCode: [referalType.zipCode, []],
                email: [referalType.emailAddress, [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
                phone: [referalType.phone, [Validators.minLength(10)]],
                practiceName: [referalType.practiceName, [Validators.required, Validators.maxLength(100)]],
                status: [referalType.status],
                isDeleted: [false]
            });
        }
        else {
            this.addReferralType = this.fb.group({
                referralSourceType: 0,
                firstName: ['', [Validators.maxLength(100)]],
                middleName: ['', [Validators.maxLength(100)]],
                lastName: ['', [Validators.maxLength(100)]],
                address1: ['', [Validators.maxLength(250)]],
                address2: ['', [Validators.maxLength(250)]],
                city: ['', [Validators.maxLength(64)]],
                state: ['', []],
                zipCode: ['', []],
                email: ['', [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
                phone: ['', [Validators.minLength(10)]],
                practiceName: ['', [Validators.required, Validators.maxLength(100)]],
                status: [],
                isDeleted: [false]
            });
        }

    }
    get f() {
        return this.addReferralType.controls;
    }

    saveReferralType = (isDuplicate: boolean = false) => {
        if (this.addReferralType.invalid) {
            this.f.firstName.markAsDirty();
            this.f.lastName.markAsDirty();
            this.f.address1.markAsDirty();
            this.f.city.markAsDirty();
            this.f.state.markAsDirty();
            this.f.zipCode.markAsDirty();
            this.f.email.markAsDirty();
            this.f.phone.markAsDirty();
            return false;
        }
        
        const referralType = this.addReferralType.getRawValue();
        referralType.status = this.isActiveStatus;
        
        const oldReferralType = { ...this.dialog.content.instance.referralType }
        if (oldReferralType && oldReferralType.providerAffiliateId) {
            referralType.referralAffiliateId = oldReferralType.providerAffiliateId;
            referralType.dataTag = oldReferralType.dataTag;            
            referralType.isDuplicate = isDuplicate;

            this.referralManagementHttpService.updateReferralAffiliate(referralType).then((res: ReferralResponse<ReferralType>) => {
                this.onSuccessEdit(res);
            }, () => {
                this.onFailureEdit();
            })
        }
        else {
            const referralType = this.addReferralType.getRawValue();
            referralType.status = this.isActiveStatus;
            referralType.practiceId = this.practiceId;
            referralType.isDuplicate = isDuplicate;

            this.referralManagementHttpService.createReferralAffiliate(referralType).then((res: ReferralResponse<ReferralType>) => {
                this.onSuccess(res);
            }, () => {
                this.onFailure();
            })
        }
    }

    onSuccess = (res: ReferralResponse<ReferralType>) => {

        if (res?.statusCode == 1) {
            this.toastrFactory.success(
                this.translate.instant("A new referral affiliate has been saved."),
                this.translate.instant('Success'));
            this.dialog.close(res?.data);
            this.refreshReferralTypeGrid.emit();
            this.addReferralType.reset();
        } else if (res?.statusCode == 2) {
            this.openDuplicateModal();
        }
        else {

        }
    }

    onSuccessEdit = (res: ReferralResponse<ReferralType>) => {
        if (res?.statusCode == 1) {
            this.toastrFactory.success(
                this.translate.instant("The referral affiliate has been updated."),
                this.translate.instant('Success'));
            this.dialog.close(res?.data);
            this.refreshReferralTypeGrid.emit();
            this.addReferralType.reset();
        } else if (res?.statusCode == 2) {
            this.openDuplicateModal();
        } else {

        }

    }

    onFailure = () => {
        this.translate.instant('There was an error and referral affiliate was not created.'),
            this.translate.instant('Server Error');
    }

    onFailureEdit = () => {
        this.translate.instant('There was an error and referral affiliate was not updated.'),
            this.translate.instant('Server Error');
    }


    toggleStatus = (event) => {
        this.isActiveStatus = event;
        this.lblActiveStatus(this.isActiveStatus);
    }

    lblActiveStatus = (value) => {
        this.setActive = value == true ? "Active" : "Inactive";
    }

    openDuplicateModal() {
        this.displayStyle = "block";
    }
    closeDuplicateModal() {
        this.displayStyle = "none";
    }

    getPractices(searchKeyword) {
        if (searchKeyword.length < 3) {
            return false;
        }

        let req: GetPracticeAffiliatesRequest =  {PracticeId: this.practiceId, Search: searchKeyword};

        this.referralManagementHttpService
            .getPracticesByKeyword(req)
            .subscribe((data: any[]) => {
                this.practiceList = data.map((item, index) => {
                    return { ...item, practiceAffiliateIdMasked: `${item.practiceAffiliateId}~${index}` };
                });
            });
    }

    getAllProviderAffiliates(){
        let req: GetProviderReferralAffiliatesRequest =  { PracticeId: this.practiceId
            , PageSize: this.pageSize
            , PageNumber: this.pageNumber
            , SortColumn: this.sortColumn
            , SortOrder: this.sortOrder
        };
        this.getProviderAffiliates(req);
    }


    getProviderAffiliates(req: GetProviderReferralAffiliatesRequest) {
        this.referralManagementHttpService
            .getProviderAffiliates(req)
            .subscribe((data: any[]) => {
                this.providerAffiliates = data;
                //console.log(this.providerAffiliates);
            });
    }

    public practiceValueChange(value: any): void {
        if (value) {
            const selectedPractice = this.practiceList.find(practice => practice.practiceAffiliateIdMasked === value);
            if (selectedPractice){
                this.f.practiceName.setValue(selectedPractice.name);
                this.f.firstName.setValue(selectedPractice.firstName);
                this.f.middleName.setValue(selectedPractice.middleName);
                this.f.lastName.setValue(selectedPractice.lastName);
                this.f.phone.setValue(selectedPractice.phone);
                this.f.email.setValue(selectedPractice.emailAddress);
                this.f.address1.setValue(selectedPractice.address1);
                this.f.address2.setValue(selectedPractice.address2);
                this.f.city.setValue(selectedPractice.city);
                this.f.state.setValue(selectedPractice.state);
                this.f.zipCode.setValue(selectedPractice.zipcode);

                this.isPracticeSelected = true;
                this.isFormModified = false;
                this.storeInitialValues();
                this.trackChanges();
            }
        } else {
            this.f.practiceName.setValue(null);
            this.f.firstName.setValue(null);
            this.f.middleName.setValue(null);
            this.f.lastName.setValue(null);
            this.f.phone.setValue(null);
            this.f.email.setValue(null);
            this.f.address1.setValue(null);
            this.f.address2.setValue(null);
            this.f.city.setValue(null);
            this.f.state.setValue(null);
            this.f.zipCode.setValue(null);

            this.isPracticeSelected = false;
        }
    }

    storeInitialValues(): void {
        this.initialValues = this.addReferralType.value;
    }

    trackChanges(): void {
        this.addReferralType.valueChanges.subscribe((newValues) => {
            this.isFormModified = this.detectChanges(newValues);
        });
    }

    detectChanges(newValues: any): boolean {
        const changes = {};
        for (const key in newValues) {
            if (newValues[key] !== this.initialValues[key]) {
                return true;
            }
        }
        return false;
    }

    public closeAutoComplete(): void {
        this.isPracticeSelected = false;
    }

    saveDuplicateAffiliate (){
        this.saveReferralType(true);
    }

    formatPhoneNumber(phoneNumber: string): string {
        if (phoneNumber && phoneNumber.length === 10) {
            return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, 10)}`;
        }
        return phoneNumber;
    }
}


