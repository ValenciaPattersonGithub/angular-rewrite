import { Injectable } from "@angular/core";
import { CurrencyPipe } from '@angular/common';
import * as moment from 'moment-timezone';
import { TransactionHistory } from "../models/transactionHistory.model"

@Injectable()
export class TransactionHistoryExportService {

    constructor(private readonly currencyPipe: CurrencyPipe) { }

    // TODO: remove when using models in controllers is understood or controller is not needed
    newTransactionHistoryArray() {
        return new Array<TransactionHistory>();
    }

    // TODO: remove when using models in controllers is understood or controller is not needed
    newTransactionHistory() {
        return new TransactionHistory();
    }

    convertTransactionHistoryArrayToCsv(historyArray: TransactionHistory[], activeLocationTimezoneIdentifier: string, hideRunningBalance: boolean) {
        let csv = 'Date,Patient,Provider,Location,Type,Description,Tooth,Area,Est. Ins.,Amount,Deposited,Split,Allowed Amount,Ins Adj,Balance\r\n';

        if (!historyArray) return csv;

        for (let item of historyArray) {
            csv += moment(item.utcDateTimeString).tz(activeLocationTimezoneIdentifier).format('MM/DD/YYYY') +
                ',\"' + item.patientName +
                '\",\"' + (!item.providerUserName ? '' : item.providerUserName) +
                '\",\"' + (!item.locationName ? '' : item.locationName) +
                '\",' + (item.type !== null && item.type !== undefined ? item.type.charAt(0) === '-' ? item.type.replace('-', ' -') :
                    item.type.charAt(0) === '+' ? item.type.replace('+', ' +') : item.type : item.type) +
                ',\"' + item.description +
                '\",' + (item.tooth === null || item.tooth === undefined ? '' : '"=""' + item.tooth + '"""') +
                ',' + (item.area === null || item.area === undefined ? '' : '\"' + item.area + '\"') +
                ',' + (item.totalEstimatedInsurance === null || item.totalEstimatedInsurance === undefined ? ''
                    : '\"' + this.currencyPipe.transform(item.totalEstimatedInsurance) + '\"') +
                ',' + (item.amount === null || item.amount === undefined ? '' : '\"' + this.currencyPipe.transform(item.amount) + '\"') +
                ',' + (item.isDeposited === null || item.isDeposited === undefined || (item.type !== 'Account Payment' && item.type !== 'Insurance Payment') ? ''
                    : item.isDeposited === false ? 'No' : 'Yes') +
                ',' + (item.isSplitPayment === null || item.isSplitPayment === undefined ? '' : item.isSplitPayment === false ? 'No' : 'Yes') +
                ',' + (item.allowedamount === null || item.allowedamount === undefined ? ''
                : '\"' + this.currencyPipe.transform(item.allowedamount) + '\"') +
                ',' + (item.totalAdjEstimate === null || item.totalAdjEstimate === undefined || parseInt(item.totalAdjEstimate) === 0 ? ''
                : '\"' + this.currencyPipe.transform(item.totalAdjEstimate) + '\"') +
                ',' + (item.runningBalance === null || item.runningBalance === undefined || hideRunningBalance ? ''
                : '\"' + this.currencyPipe.transform(item.runningBalance) + '\"') + '\r\n';
        }

        return csv;
    }
}
