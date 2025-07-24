'use strict';
/**
 * @import { StatementsComponent } from '../../../../../src/accounting/statements/statements.component';
 * @import { FeatureFlagService } from '../../../../../src/featureflag/featureflag.service';
 * @import { FuseFlag } from '../../../../../src/@core/feature-flags/fuse-flag';
 * @typedef {typeof FuseFlag} FuseFlag
 * @import { Observable } from 'rxjs';
 */

angular.module('Soar.BusinessCenter').controller('NewStatementsController', NewStatementsController);

NewStatementsController.$inject = ['FeatureFlagService', 'FuseFlag'];

/**
 * This controller is a wrapper for the new statements component, implemented in Angular.
 *
 * @see {@link StatementsComponent}
 *
 * @param {FeatureFlagService} featureFlagService
 * @param {FuseFlag} fuseFlag
 */
function NewStatementsController(featureFlagService, fuseFlag) {
  var vm = this;

  /**
   * Indicates whether the new statements experience is enabled.
   * @type {boolean}
   */
  vm.newStatementsExperienceIsEnabled = false;

  activate();

  /**
   * All initialization logic should go here.
   */
  function activate() {
    /** 
     * @type { Observable<boolean> }
     */
    (featureFlagService.getOnce$(fuseFlag.EnableNewStatementsExperience)).subscribe({
      next: (isEnabled) => vm.newStatementsExperienceIsEnabled = isEnabled === true,
    });
  }
}
