
import { Injectable, Inject, ErrorHandler } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

	constructor(@Inject('errorLogService') private errorLogService) {
	}

	handleError(error) {
		this.errorLogService(error);
    }
}