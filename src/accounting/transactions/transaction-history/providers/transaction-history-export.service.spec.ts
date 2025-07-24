import { TestBed } from '@angular/core/testing';

import { TransactionHistoryExportService } from './transaction-history-export.service';
import { CurrencyPipe } from '@angular/common';
import { TransactionHistory } from "../models/transactionHistory.model"
import 'moment-timezone';

describe('TransactionHistoryExportService', () => {

    let service: TransactionHistoryExportService;

    beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TransactionHistoryExportService, CurrencyPipe],
            });
            service = TestBed.get(TransactionHistoryExportService);
        }
    );

    it('should be created',
        () => {
            expect(service).toBeTruthy();
        });

    it('newTransactionHistoryArray should return a new TransactionHistory array', () => {
        const result = service.newTransactionHistoryArray();
        expect(result).toBeTruthy();
        expect(result).toEqual(new Array<TransactionHistory>());
    });

    it('newTransactionHistory should return a new TransactionHistory', () => {
        const result = service.newTransactionHistory();
        expect(result).toBeTruthy();
        expect(result).toEqual(new TransactionHistory());
    });

    describe('convertTransactionHistoryArrayToCsv -> ', () => {
        const columnHeadersCsv = 'Date,Patient,Provider,Location,Type,Description,Tooth,Area,Est. Ins.,Amount,Deposited,Split,Allowed Amount,Ins Adj,Balance\r\n';
        let skeletonHistory: TransactionHistory;
        const cst = 'America/Chicago';

        beforeEach(() => {
            skeletonHistory = Object.assign(new TransactionHistory(), {
                utcDateTimeString: "2019-03-29T12:30:12Z"
            });
            }
        );

        it('should return only the column headers when history array is null',
            () => {
                const result = service.convertTransactionHistoryArrayToCsv(null, '', true);
                expect(result).toBeTruthy();
                expect(result).toBe(columnHeadersCsv);
            });

        it('should return only the column headers when history array is empty', () => {
            const result = service.convertTransactionHistoryArrayToCsv(new Array<TransactionHistory>(), '', true);
            expect(result).toBeTruthy();
            expect(result).toBe(columnHeadersCsv);
        });

        it('should set Date to MM/dd/yyyy transformed utcDateTimeString', () => {
            const csv = columnHeadersCsv + '07/15/2011,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].utcDateTimeString = "2011-07-15T12:30:12Z";
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Date to correct date for active location when transaction timezone is behind active location timezone', () => {
            const csv = columnHeadersCsv + '09/10/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            // transaction at 11:30 PM on September 9th CDT should be exported as September 10th EDT
            historyArray[0].utcDateTimeString = "2019-09-10T04:30:12Z";
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, 'America/New_York', false);
            expect(result).toBe(csv);
        });

        it('should set Date to correct date for active location when transaction timezone is ahead of active location timezone', () => {
            const csv = columnHeadersCsv + '09/09/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            // transaction at 12:30 AM on September 10th EDT should be exported as September 9th CDT
            historyArray[0].utcDateTimeString = "2019-09-10T04:30:12Z";
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Patient as null when patientName is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"null","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].patientName = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Patient as undefined when patientName is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].patientName = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Patient to patientName when patientName has a string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"Salmon P. Chase","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].patientName = 'Salmon P. Chase';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Provider to empty string when providerUserName is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].providerUserName = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Provider to empty string when providerUserName is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].providerUserName = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Provider to providerUserName when providerUserName has a string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","Salmon P. Chase","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].providerUserName = 'Salmon P. Chase';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Location to empty string when locationName is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].locationName = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Location to empty string when locationName is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].locationName = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Location to locationName when locationName has a string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","New York",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].locationName = 'New York';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Type as null when type is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",null,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Type as undefined when type is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Type to type when type has a string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",Account Payment,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = 'Account Payment';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should prepend space to Type when type starts with a minus sign', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","", -Adjustment,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = '-Adjustment';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should prepend space to Type when type starts with a plus sign', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","", +Adjustment,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = '+Adjustment';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Description as null when description is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"null",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].description = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should output Description as undefined when description is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].description = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Description to description when description has a string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"D0120",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].description = 'D0120';
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Tooth to empty string when tooth is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].tooth = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Tooth to empty string when tooth is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].tooth = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Tooth to tooth when tooth has string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined","=""Tooth1""",,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].tooth = "Tooth1";
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Area to empty string when area is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].area = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Area to empty string when area is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].area = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Area to area when area has string value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,"UA",,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].area = "UA";
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Est. Ins. to empty string when totalEstimatedInsurance is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].totalEstimatedInsurance = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Est. Ins. to empty string when totalEstimatedInsurance is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].totalEstimatedInsurance = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Est. Ins. to currency transformed totalEstimatedInsurance when totalEstimatedInsurance has numeric value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,"$19.23",,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].totalEstimatedInsurance = 19.23;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Amount to empty string when amount is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].amount = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Amount to empty string when amount is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].amount = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Amount to currency transformed amount when amount has numeric value', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,"$192.37",,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].amount = 192.37;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });

        it('should set Deposited to empty string when isDeposited is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isDeposited = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to empty string when isDeposited is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isDeposited = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to empty string when type is not an insurance or account payment', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","", -Adjustment,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = '-Adjustment';
            historyArray[0].isDeposited = true;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to Yes when type is Insurance Payment and isDeposited is true', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",Insurance Payment,"undefined",,,,,Yes,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = 'Insurance Payment';
            historyArray[0].isDeposited = true;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to Yes when type is Account Payment and isDeposited is true', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",Account Payment,"undefined",,,,,Yes,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = 'Account Payment';
            historyArray[0].isDeposited = true;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to No when type is Insurance Payment and isDeposited is false', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",Insurance Payment,"undefined",,,,,No,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = 'Insurance Payment';
            historyArray[0].isDeposited = false;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Deposited to No when type is Account Payment and isDeposited is false', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",Account Payment,"undefined",,,,,No,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].type = 'Account Payment';
            historyArray[0].isDeposited = false;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Split to empty string when isSplitPayment is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isSplitPayment = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Split to empty string when isSplitPayment is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isSplitPayment = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Split to No when type isSplitPayment is false', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,No,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isSplitPayment = false;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Split to Yes when type isSplitPayment is true', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,Yes,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].isSplitPayment = true;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Balance to empty string when hideRunningBalance is true', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].runningBalance = 86.23;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Balance to empty string when runningBalance is null', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].runningBalance = null;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Balance to empty string when runningBalance is undefined', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].runningBalance = undefined;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, true);
            expect(result).toBe(csv);
        });

        it('should set Balance to currency transformed running balance when hideRunningBalance is false', () => {
            const csv = columnHeadersCsv + '03/29/2019,"undefined","","",undefined,"undefined",,,,,,,,,"$86.23"\r\n';
            const historyArray = [skeletonHistory];
            historyArray[0].runningBalance = 86.23;
            const result = service.convertTransactionHistoryArrayToCsv(historyArray, cst, false);
            expect(result).toBe(csv);
        });
    });
});
