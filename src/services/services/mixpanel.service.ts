import { Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';
 
@Injectable()
export class MixpanelService {
  init(userToken: string, mixpanelProjectKey: string, {name, email}): void {    
    mixpanel.init(mixpanelProjectKey, {track_pageview: "url-with-path-and-query-string"});
    mixpanel.identify(userToken);
    mixpanel.people.set({'$name': name, '$email': email});
  }
 
  log(actionId: string, action: any = {}): void {
   mixpanel.track(actionId, action);
  }

  reset(): void {
   mixpanel.reset();
  }
}