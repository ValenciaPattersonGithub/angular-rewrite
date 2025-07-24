
import { Injectable, Inject } from '@angular/core';
import { ImagingPatient } from '../models/imaging-patient';
import * as moment from 'moment';

@Injectable()
export class ImagingPatientService {
  constructor(@Inject('imagingProviderFactory') private imagingProviderFactory,
              @Inject('toastrFactory') private toastrFactory,
  ) { }

  createImagingPatient(updatedPatient, imagingInfo) {
    const imagingPatient = new ImagingPatient();
    // current capture doesn't support additional (middle) name, prefix, or suffix
    // so we will send only last and first otherwise the
    // images will not be attributed to correct patient if patient name edited.
    const delimiter = '^';
    const name = updatedPatient.Profile.LastName + delimiter +  updatedPatient.Profile.FirstName + delimiter;

    // NOTE this may need revisited when Apteryx updates their endpoint
    // see dev note in PBI 425674.  We will temporariy modify the name based on reply from query to
    // Apteryx even though it doesn't conform to their swagger signature
    //
    // const name = updatedPatient.Profile.LastName + delimiter +
    //     updatedPatient.Profile.FirstName + delimiter +
    //     updatedPatient.Profile.MiddleName + delimiter +
    //     updatedPatient.Profile.Prefix + delimiter +
    //     updatedPatient.Profile.Suffix ;

    imagingPatient.id = imagingInfo.Id;
    imagingPatient.primaryId = imagingInfo.PrimaryId;
    imagingPatient.name = name;
    imagingPatient.gender = updatedPatient.Profile.Sex;
    imagingPatient.birthDate =  updatedPatient.Profile.DateOfBirth;
    imagingPatient.comments = '';
    return imagingPatient;
  }

  updateImagingPatient(updatedPatient, imagingInfo) {
    const promise = new Promise((resolve, reject) => {
      const imagingService = this.imagingProviderFactory.resolve();
      const updatedPatientData = this.createImagingPatient(updatedPatient, imagingInfo);
      const toastr = this.toastrFactory;
      if (imagingService) {
        imagingService.seeIfProviderIsReady().then(() => {
          imagingService.updatePatientData(updatedPatientData).then((res) => {
              // Success
              console.log(res);
              resolve(res);
            }, (err) => {
                // Error
                console.log(err);
                toastr.error('Failed to update patient data on the imaging server.', 'Server Error');
                resolve(err);
              }
            );
        });
      }
    });
    return promise;
  }

  // compare stored imaging patient with updatedPatient
  compareImagingPatient(updatedPatient, imagingPatient) {
    // only compare month day and year of birthdate
    const d1 = updatedPatient.Profile.DateOfBirth ? moment.utc(updatedPatient.Profile.DateOfBirth).format('MM/DD/YY') : '';
    const d2 = imagingPatient.Birthdate ? moment.utc(imagingPatient.Birthdate).format('MM/DD/YY') : '';
    const birthDateHasChanged = ( d1 !== d2 );
    return (imagingPatient.FirstName.toUpperCase() !== updatedPatient.Profile.FirstName.toUpperCase() ||
        imagingPatient.LastName.toUpperCase() !== updatedPatient.Profile.LastName.toUpperCase() ||
        birthDateHasChanged === true ||
        (imagingPatient.Gender == null && updatedPatient.Profile.Sex !== null) ||
        (imagingPatient.Gender !== null && updatedPatient.Profile.Sex == null) ||
        (imagingPatient.Gender !== null && updatedPatient.Profile.Sex !== null && imagingPatient.Gender.toUpperCase() !== updatedPatient.Profile.Sex.toUpperCase()));
  }

    getImagingPatient(updatedPatient) {
        //This doesn't really handle imaging providers other than Apteryx
        //It will always choose Apteryx first and the logic doesn't pertain to other providers
        //Leaving this untouched for now, but might be good to look at in the future
        const promise = new Promise((resolve, reject) => {
            const imagingService = this.imagingProviderFactory.resolve();
            const toastr = this.toastrFactory;
            if (imagingService) {
                imagingService.seeIfProviderIsReady().then(() => {
                    imagingService.getPatientByPDCOPatientId(updatedPatient.Profile.PatientId.replace(/-/g, '')).then((res) => { // Success
                        console.log(res);
                        resolve(res);
                    }, () => { // Error
                        toastr.error('Failed to get patient data on the imaging server.', 'Server Error');
                        // indicates no patient returned
                        resolve(null);
                    }
                    );
                });
            } else {
                // indicates imaging not turned on for this practice
                resolve(null);
            }
        });
        return promise;
    }

    syncBluePatientLocation(patientId, locationId) {
        const promise = new Promise((resolve, reject) => {
            const imagingService = this.imagingProviderFactory.resolveSpecific('blue');
            const toastr = this.toastrFactory;
            if (imagingService) {
                imagingService.seeIfProviderIsReady().then(() => {
                    imagingService.updatePatientLocation(patientId, locationId).then((res) => { // Success
                        console.log(res);
                        resolve(res);
                    }, () => { // Error
                        toastr.error('Failed to get patient data on the imaging server.', 'Server Error');
                        // indicates no patient returned
                        resolve(null);
                        }
                    );
                });
            } else {
                //indicates blue imaging is not turned on for this practice
                resolve(null);
            }
        });
        return promise;
    }

}
