import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { RequestTransactionHistoryArgs, SoarTransactionHistoryHttpService } from 'src/@core/http-services/soar-transaction-history-http.service';
import { TransactionHistoryPrintDto } from 'src/@core/models/core/transaction-history/transaction-history.models';

@Component({
    selector: 'patient-transaction-print',
    templateUrl: './patient-transaction-print.component.html',
    styleUrls: ['./patient-transaction-print.component.scss']
})
export class PatientTransactionPrintComponent implements OnInit {
    accountId: string = null;
    printOptions: any = null;
    transactionHistories: TransactionHistoryPrintDto[] = [];
    printDisplayDate: any = moment(new Date());
    practiceName: string = '';
    userCode:string = '';
    disablePrint: boolean = true;
  
    constructor(
        private transactionHistoryService: SoarTransactionHistoryHttpService,
        @Inject('$routeParams') public $routeParams, ) { }

    ngOnInit(): void {        
        const userPractice = JSON.parse(sessionStorage.getItem('userPractice'));        
        if (userPractice) {
            this.practiceName = userPractice.name;
        }        
        this.accountId = this.$routeParams.accountId;
        const localStorageIdentifier = 'printTransactionHistory_' + this.accountId;
		this.printOptions = JSON.parse(localStorage.getItem(localStorageIdentifier));
        this.loadTransactionHistory();
        // remove the local storage item        
        localStorage.removeItem(localStorageIdentifier);        
    }

    print() {
        window.print();
    } 

    loadTransactionHistory() {
        if (this.printOptions){
            const requestArgs: RequestTransactionHistoryArgs = {
                AccountId: this.$routeParams.accountId,
                FilterCriteria: this.printOptions.FilterObject,
                SortCriteria: this.printOptions.SortObject,
                PageCount: 0,
                CurrentPage: 0
            };
            this.transactionHistoryService.requestTransactionHistory(requestArgs).subscribe(rows => {
                this.transactionHistories = rows.Value;
                this.disablePrint = false;            
            })
        }        
    }    

    close() {
        window.close();
    } 
}
