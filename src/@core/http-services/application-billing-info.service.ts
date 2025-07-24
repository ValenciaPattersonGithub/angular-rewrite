import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable, ReplaySubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { MicroServiceApiService } from '../../security/providers';
import { ApplicationBillingInfoModelWrapper } from '../models/app-billing-info/app-billing-info.model';
import { BillingModel } from '../models/app-billing-info/billing-model.enum';

@Injectable()
export class ApplicationBillingInfoService {
    private readonly fuseApplicationId = 2;
  constructor(
    @Inject('practiceService') private practiceService,
    private httpClient: HttpClient,
    private microServiceApis: MicroServiceApiService
  ) {
      if (!window['qaOnly'])
          window['qaOnly'] = {};

      window['qaOnly']['billingModelService'] = this;
  }

  public applicationBilling$: Observable<ApplicationBillingInfoModelWrapper> =
    this.httpClient
      .get<ApplicationBillingInfoModelWrapper>(
          `${this.microServiceApis.getEnterpriseUrl()}/api/applicationBillingInfo/${this.fuseApplicationId}/${
          this.practiceService.getCurrentPractice().id
        }`
      )
      .pipe(shareReplay(1));

    qaOnlySetBillingModel(billingModel: BillingModel) {

      const testData = {
          Result: {
              ApplicationBillingInfoId: 1,
              ApplicationId: this.fuseApplicationId,
              BillingModel: billingModel
          },
      }
      this.applicationBilling$ = of(testData);
  }
}
