
import { Injectable, Inject } from '@angular/core';

// The purpose of this file is to get the defined Application Variables so that they can be used in the application.

@Injectable()
export class ApplicationVariableService {
	//private variable definitions

	constructor(@Inject('ApplicationVariableConfig') private applicationVariableConfig) {
		
	}

	//public methods to get variable value.
	//getVariableEx() {

	//}
	
}