import { Inject, Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { AppointmentData } from './appointment-data';

const MAX_PATH_LENGTH = 2048;

/**
 * Interface for navigating between current fuse and the new scheduling domain
 */
@Injectable({
  providedIn: 'root',
})
export class SchedulingMFENavigator {
  constructor(
    private sanitizer: Sanitizer,
    @Inject('tabLauncher') private tabLauncher: { launchNewTab: (url: string) => void }
  ) {}

  /**
   * Takes data about an appointment and opens the new scheduling appointment modal.
   * Note: Unlike the current appointment modal, this will link to a new page.
   * @function navigateToAppointmentModal
   * @param {AppointmentData} data Data about the appointment to display when the modal opens
   */
  public navigateToAppointmentModal = (data: AppointmentData, newTab = false): void => {
    const params = new URLSearchParams();
    if (data.id) {
      params.set('publicRecordId', data.id);
    }
    if (data.appointmentTypeId) {
      params.set('appointmentTypeId', data.appointmentTypeId);
    }
    if (data.locationId) {
      params.set('locationId', data.locationId);
    }
    if (data.patientId) {
      params.set('patientId', data.patientId);
    }
    if (data.serviceTransactionIds && data.serviceTransactionIds.length) {
      params.set('serviceTransactionIds', data.serviceTransactionIds.join(','));
    }
    const path = `#/schedule/v2/appointment?${params.toString()}`;
    if (path.length > MAX_PATH_LENGTH) {
      console.error('Path too long, cannot navigate to appointment modal');
      return;
    }
    this.navigateToPath(path, newTab);
  };

  /**
   * Navigates the user to the new schedule view, by default opens in a new tab
   * @param newTab
   */
  public navigateToSchedule = (newTab = true): void => {
    const path = '#/schedule/v2';
    this.navigateToPath(path, newTab);
  }

  navigateToPath = (path: string, newTab = false): void => {
    if (newTab) {
      this.tabLauncher.launchNewTab(this.sanitizer.sanitize(SecurityContext.URL, path));
      return;
    }
    window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
  };
}
