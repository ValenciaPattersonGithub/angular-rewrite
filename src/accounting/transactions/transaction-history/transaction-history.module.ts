import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { TransactionHistoryExportService } from './providers';
import { SoarTransactionHistoryHttpService } from 'src/@core/http-services/soar-transaction-history-http.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        TransactionHistoryExportService,
        SoarTransactionHistoryHttpService,
        CurrencyPipe
    ]
})
export class TransactionHistoryModule { }
