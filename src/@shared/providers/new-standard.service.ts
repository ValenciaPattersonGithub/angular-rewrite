import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Injectable({
  providedIn: 'root'
})
export class NewStandardService<T> {

  constructor(
    private httpClient: HttpClient
  ) { }

  load = (id: string, url: string, idField: string): Promise<T> => {
    if (id) {
      if (idField) {
        const retrieveParams = {};
        retrieveParams[idField] = id;
        return new Promise((resolve, reject) => {
          this.httpClient.get(url, retrieveParams)
            .toPromise()
            .then((res: SoarResponse<T>) => {
              resolve(res?.Value);
            }, err => { // Error
              reject(err);
            })
        });
      } else {
        return new Promise((resolve, reject) => {
          this.httpClient.get(url)
            .toPromise()
            .then((res: SoarResponse<T>) => {
              resolve(res?.Value);
            }, err => { // Error
              reject(err);
            })
        });
      }
    }
  }

  save = (data: T, url: string, method: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (method == 'Post') { // Save      
        this.httpClient.post(url, data)
          .toPromise()
          .then((res: SoarResponse<T>) => {
            resolve(res?.Value);
          }, err => { // Error
            reject(err);
          })
      } else { // Update       
        this.httpClient.put(url, data)
          .toPromise()
          .then((res: SoarResponse<T>) => {
            resolve(res?.Value);
          }, err => { // Error
            reject(err);
          })
      }
    });
  }

  checkDuplicate = (data: T, url: string) => {
    return new Promise((resolve, reject) => {
      this.httpClient.get(url, data)
        .toPromise()
        .then((res) => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  delete = (data: T, url: string, idField: string): Promise<T> => {
    const id = data[idField];
    if (id) {
      if (idField) {
        const deleteParams = {};
        deleteParams[idField] = data[idField];
        return new Promise((resolve, reject) => {
          this.httpClient.delete(url, deleteParams)
            .toPromise()
            .then((res: SoarResponse<T>) => {
              resolve(res?.Value);
            }, err => { // Error
              reject(err);
            })
        });
      } else {
        return new Promise((resolve, reject) => {
          this.httpClient.delete(url)
            .toPromise()
            .then((res: SoarResponse<T>) => {
              resolve(res?.Value);
            }, err => { // Error
              reject(err);
            })
        });
      }
    }
  }

  validate = (callbackFunc, data: T): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(callbackFunc(data));
    });
  }

  // To Do - Need to move checkAppointmentFailedOnInvalidService method in bound Object factory to patient components when migrating
}
