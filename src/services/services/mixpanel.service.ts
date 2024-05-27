import * as i0 from '@angular/core';

export declare class MixpanelService {
  /**

     * Initialize mixpanel.

     *

     * @param {string} userToken

     * @memberof MixpanelService

     */

  init(userToken: string, mixpanelProjectKey: string): void;

  /**

     * Push new action to mixpanel.

     *

     * @param {string} id Name of the action to track.

     * @param {*} [action={}] Actions object with custom properties.

     * @memberof MixpanelService

     */

  track(id: string, action?: any): void;

  setPeople(object: any, value: any): void;

  identify(): void;

  static ɵfac: i0.ɵɵFactoryDeclaration<MixpanelService, never>;

  static ɵprov: i0.ɵɵInjectableDeclaration<MixpanelService>;
}
