import { ErrorHandler, Injectable } from '@angular/core';
import { MixpanelService } from '../services/mixpanel.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
    constructor(private mixpanel: MixpanelService) {}
    handleError(error: any): void {
        if(error.stack !== undefined){
            this.mixpanel.log('Scripting Error', {error: error.stack});
        } else if (error.error !== undefined){
            this.mixpanel.log('Scripting Error', {error: error.error});
        }
    }
}

