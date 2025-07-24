import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationVariableService, UltInterceptorService } from './providers';
import { GlobalErrorHandlerService } from './providers';
import { GlobalInterceptorService } from './providers';
import { MicroServiceApiService } from './providers';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        ApplicationVariableService,
        GlobalErrorHandlerService,
        GlobalInterceptorService,
        MicroServiceApiService,
        UltInterceptorService        
    ]
})
export class SecurityModule { }
