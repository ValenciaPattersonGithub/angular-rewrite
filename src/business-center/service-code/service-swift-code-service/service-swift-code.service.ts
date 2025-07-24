import { Inject, Injectable } from '@angular/core';
import { NewStandardService } from 'src/@shared/providers/new-standard.service';
import { ServiceCodeModel } from '../service-code-model';

@Injectable({
  providedIn: 'root'
})
export class ServiceSwiftCodeService {

  constructor(
    private standardService: NewStandardService<ServiceCodeModel>,
    @Inject('SoarConfig') private soarConfig) { }

  // Save
  save = (data: ServiceCodeModel, idField: string): Promise<ServiceCodeModel> => {
    return new Promise((resolve, reject) => {
      const isUpdate = data[idField] ? true : false;
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes`;
      const httpMethod = !isUpdate ? 'Post' : 'Put';
      this.standardService.save(data, url, httpMethod).then((res: ServiceCodeModel) => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }

  // Check Duplicate
  checkDuplicate = (data: ServiceCodeModel) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.domainUrl)}/servicecodes/duplicates/${String(data?.ServiceCodeId)}?Code=${String(data?.Code)}`;
      this.standardService.checkDuplicate(data, url).then((res) => {
        resolve(res);
      }, err => { // Error
        reject(err);
      })
    });
  }

  // Validate
  validate = (data: ServiceCodeModel): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      this.standardService.validate(this.validationFunction, data).then((callbackFunc: boolean) => {
        resolve(callbackFunc);
      }, (err) => {
        reject(err);
      });
    });
  }

  // Function gets called from new standard service
  validationFunction = (serviceCode) => {
    let status = false;
    if (!serviceCode?.IsSwiftPickCode) {
      if (serviceCode?.Code && serviceCode?.Description && serviceCode?.ServiceTypeId && serviceCode?.AffectedAreaId) {
        status = true;
      }
    } else {
      if (serviceCode?.Code && serviceCode?.Description && (serviceCode?.SwiftPickServiceCodes?.length > 0))
        status = true;
    }
    return status;
  }
}
