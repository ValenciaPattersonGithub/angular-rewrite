import { Inject, Injectable } from "@angular/core";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { CoreModule } from "../@core/core.module";
import { FuseFlag } from "src/@core/feature-flags/fuse-flag";
import { init as initFullStory, FullStory } from '@fullstory/browser'; // small shim only, most JS is loaded only if feature flag is ON

export const FULLSTORY_ORG_ID = 'FULLSTORY_ORG_ID';

@Injectable({
  providedIn: CoreModule
})
export class FullstoryInitializationService {
  constructor(
    @Inject(FULLSTORY_ORG_ID) private fullstoryOrgId: string,
    @Inject('platformSessionService') private platformSessionService,
    @Inject('platformSessionCachingService') private platformSessionCachingService,
    @Inject('RolesFactory') private rolesFactory,
    private flagService: FeatureFlagService) { }

  /** Will inspect the FullStory feature flag, and only if ON, will load FullStory javascript and 
   * initialize data collection. */
  initialize(): Promise<void> {

    return new Promise((resolve, reject) => {
      this.flagService.getOnce$(FuseFlag.EnableFullstoryDataCollection).subscribe(flag => {
        if (flag) {
          // practiceid is not guaranteed to be immediately available on startup, but is 
          // waited on for flag service initialization, so should be safe here:
          const practiceId = this.platformSessionService.getSessionStorage('userPractice')?.id
          const userId = this.platformSessionCachingService.userContext.get().Result.User.UserId;

          this.rolesFactory.UserRoles(userId).then((res) => {
            const rolename = res?.Result?.PracticeRoles[practiceId]?.[0]?.RoleName;

            // This will actully load in the bulk of the FullStory JS, and initialize the data collection
            initFullStory({ orgId: this.fullstoryOrgId });

            // Tell FullStory who the current user is
            FullStory('setIdentity', {
              uid: userId.toString(),
              properties: {
                practiceId: practiceId,
                rolename: rolename
              }
            });

            resolve();

          }).catch(reject);
        }
        else {
          resolve();
        }
      });
    });
  }
}