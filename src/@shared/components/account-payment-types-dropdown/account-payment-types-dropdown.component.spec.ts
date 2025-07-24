import { AccountPaymentTypesDropdownComponent } from './account-payment-types-dropdown.component';

describe('AccountPaymentTypesDropdownComponent', () => {
    let component: AccountPaymentTypesDropdownComponent;

    beforeEach(() => {
        component = new AccountPaymentTypesDropdownComponent(

        );
        component.paymentTypes = [{ PaymentTypeId: '1234', IsSystemType: false, Description: 'PaymentType1', PaymentTypeCategory: 1 },
        { PaymentTypeId: '2345', IsSystemType: false, Description: 'PaymentType4', PaymentTypeCategory: 1 },
        { PaymentTypeId: '3456', IsSystemType: false, Description: 'PaymentType2', PaymentTypeCategory: 1 },
        { PaymentTypeId: '4567', IsSystemType: true, Description: 'Vendor Payment', PaymentTypeCategory: 1 },
        { PaymentTypeId: '5678', IsSystemType: true, Description: 'PaymentType5', PaymentTypeCategory: 2 }];

    });

    describe('filterPaymentTypes ->', function () {
        var paymentTypes =[];
        beforeEach(() => {
            paymentTypes = [
                { PaymentTypeId: '1234', IsSystemType: false, Description: 'PaymentType1', PaymentTypeCategory: 1 }, 
                { PaymentTypeId: '2345', IsSystemType: false, Description: 'PaymentType4' ,PaymentTypeCategory: 1 },
                { PaymentTypeId: '3456', IsSystemType: false, Description: 'PaymentType2' ,PaymentTypeCategory: 1 },
                { PaymentTypeId: '4567', IsSystemType: true, Description: 'Vendor Payment' ,PaymentTypeCategory: 1 },
                { PaymentTypeId: '5678', IsSystemType: true, Description: 'PaymentType5' ,PaymentTypeCategory: 2 }];   
        });

        it('should filter paymentTypes to remove Vendor Payment from accountPaymentTypes list ', function () {
            component.filterPaymentTypes();
            var vendorPaymentType = component.accountPaymentTypes.find(paymentType => paymentType.Description === 'Vendor Payment');
            expect(vendorPaymentType).toBe(undefined);
        });

        it('should sort accountPaymentTypes list ', function () {
            component.filterPaymentTypes();           
            expect(component.accountPaymentTypes[0].Description).toBe('PaymentType1');
            expect(component.accountPaymentTypes[1].Description).toBe('PaymentType2');
            expect(component.accountPaymentTypes[2].Description).toBe('PaymentType4');
        });

        it('should filter paymentTypes to remove PaymentCategory 2 from accountPaymentTypes types ', function () {
            component.filterPaymentTypes();
            var insurancePaymentType = component.accountPaymentTypes.find(paymentType => paymentType.PaymentTypeCategory === 2);
            expect(insurancePaymentType).toBe(undefined);
        });
    });

    describe('onPaymentTypeChange ->', function () {
        var event;
        beforeEach(()=>{
            event = {};
            component.accountPaymentTypes =[{ PaymentTypeId: '1234', IsSystemType: false, Description: 'PaymentType1', PaymentTypeCategory: 1 }];
        })
        
        it('should emit selectedPaymentTypeId if paymentType is defined', function () {            
            component.selectedPaymentTypeChange.emit = jasmine.createSpy();
            component.selectedPaymentTypeId = '1234';
            component.onPaymentTypeChange(event);
            expect(component.selectedPaymentTypeChange.emit).toHaveBeenCalledWith(component.selectedPaymentTypeId)
        });

        it('should emit selectedPaymentTypeId if selectedPaymentTypeId is 0', function () {            
            component.selectedPaymentTypeChange.emit = jasmine.createSpy();
            component.selectedPaymentTypeId = '0';  
            component.onPaymentTypeChange(event);
            expect(component.selectedPaymentTypeChange.emit).toHaveBeenCalled();
        });

        it('should emit selectedPaymentTypeId if selectedPaymentTypeId is undefined', function () {            
            component.selectedPaymentTypeChange.emit = jasmine.createSpy();
            component.selectedPaymentTypeId = undefined;
            component.onPaymentTypeChange(event);
            expect(component.selectedPaymentTypeChange.emit).toHaveBeenCalled();
        });

        it('should not emit selectedPaymentTypeId if component.accountPaymentTypes is undefined', function () { 
            component.accountPaymentTypes=undefined;           
            component.selectedPaymentTypeChange.emit = jasmine.createSpy();
            component.selectedPaymentTypeId = '1234';
            component.onPaymentTypeChange(event);
            expect(component.selectedPaymentTypeChange.emit).not.toHaveBeenCalled();
        });
    });   
});
