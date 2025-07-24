import { Inject, Injectable } from "@angular/core";
import { LDContext, LDOptions } from "launchdarkly-js-client-sdk";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { CoreModule } from "../@core/core.module";

export const LAUNCH_DARKLY_CLIENT_ID = 'LAUNCH_DARKLY_CLIENT_ID';

@Injectable({
  providedIn: CoreModule
})
export class FuseFeatureFlagInitializationService {
  constructor(
    @Inject(LAUNCH_DARKLY_CLIENT_ID) private clientId: string,
    @Inject('platformSessionService') private platformSessionService,
    @Inject('platformSessionCachingService') private platformSessionCachingService,
    @Inject('$rootScope') private $rootScope,
    private flagService: FeatureFlagService) {}

  async initialize(): Promise<void> {

    let practiceId = await this.getPracticeId$();
    let userId = this.platformSessionCachingService.userContext.get().Result.User.UserId;

    let context: LDContext = {
      kind: 'multi',
      user: {
        key: `user-key-${userId}`,
        name: userId.toString(),
      },
      practice: {
        key: `practice-key-${practiceId}`,
        name: practiceId.toString(),
      },
    };

    let options: LDOptions = {};

    await this.flagService.initialize(this.clientId, context, options);
  }

  /**
   * Return the practice ID, waiting if necessary for it to be loaded
   */
  private async getPracticeId$(): Promise<string> {

    let practiceId = this.platformSessionService.getSessionStorage('userPractice')?.id;
    if (practiceId) {
      return Promise.resolve(practiceId);
    }
    else {
      return new Promise((resolve, reject) => {
        this.$rootScope.$on('patCore:initpractice', () => {
          resolve(this.platformSessionService.getSessionStorage('userPractice').id);
        });
      });
    }
  }
}
