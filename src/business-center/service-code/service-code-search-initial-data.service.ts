import { Inject, Injectable } from '@angular/core';
import { ServiceCodeSearchInitialData } from './service-code-model';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';
import { DrawTypeModel } from '../practice-settings/chart/draw-types/draw-types.model';
import { ServiceTypesService } from '../practice-settings/service-types/service-types.service';
import { ServiceTypes } from './service-types';

@Injectable({
  providedIn: 'root'
})
export class ServiceCodeSearchInitialDataService {

  constructor(@Inject('referenceDataService') private referenceDataService,
    private drawtypesService: DrawTypesService,
    private serviceTypesService: ServiceTypesService,
    @Inject('StaticData') private staticData) { }

  serviceCodeSearchInitialData = (): Promise<ServiceCodeSearchInitialData> => {
    return new Promise((resolve) => {
      let taxableServices = this.staticData.TaxableServices();
      let affectedAreas = this.staticData.AffectedAreas();
      let providerTypes = this.staticData.ProviderTypes();
      let serviceTypes: Promise<ServiceTypes[]> = new Promise((resolve, reject) => {
        this.serviceTypesService.getAll().then(serviceTypes => resolve(serviceTypes))
          .catch(err => {
            console.error(err);
            reject();
          });
      })
      let serviceCodes = this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes);
      let drawTypes: Promise<DrawTypeModel[]> = new Promise((resolve, reject) => {
        this.drawtypesService.getAll().then(drawTypes => resolve(drawTypes))
          .catch(err => {
            console.error(err);
            reject();
          });
      });
      return Promise.all([taxableServices, affectedAreas, providerTypes, serviceCodes, serviceTypes, drawTypes]).then(results => {
        let filterProviderTypes = () => {
          let filterProviderTypes = [];
          if (results?.length > 0) {
            results[2]?.Value?.forEach(providerType => {
              if (providerType?.Id === 1 || providerType?.Id === 2) {
                filterProviderTypes?.push(providerType);
              }
            });
          }
          return filterProviderTypes;
        };
        let res: ServiceCodeSearchInitialData = {
          DrawTypes: (results?.length > 0 && results[5]?.length > 0) ? results[5] : [],
          ServiceTypes: (results?.length > 0 && results[4]?.length > 0) ? results[4] : [],
          ServiceCodes: (results?.length > 0 && results[3]?.length > 0) ? results[3] : [],
          TaxableServices: (results?.length > 0 && results[0]?.Value) ? results[0].Value : [],
          AffectedAreas: (results?.length > 0 && results[1]?.Value) ? results[1].Value : [],
          ProviderTypes: filterProviderTypes()
        };
        resolve(res);        
      });
    });
  }
}
