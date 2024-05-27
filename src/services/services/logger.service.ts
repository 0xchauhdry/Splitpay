import { MixpanelService } from './mixpanel.service';
import { NGXLogger } from 'ngx-logger';
import * as i0 from '@angular/core';
import { NotifierService } from './notifier.service';

export declare class LoggerService {
  private logger;
  private mixpanelService;
  private notifierService;
  constructor(
    logger: NGXLogger,
    mixpanelService: MixpanelService,
    notifierService: NotifierService
  );

  trace(message: any, ...additional: any[]): void;

  debug(message: any, ...additional: any[]): void;

  info(
    message: any,
    additionalMsg?: string,
    logMsg?: string,
    timeSpent?: number
  ): void;

  log(message: any, ...additional: any[]): void;

  warn(message: any, ...additional: any[]): void;

  error(
    message: any,
    additionalMsg: string,
    isNotifyError?: boolean,
    notificationMsg?: string,
    errorCode?: number
  ): void;

  fatal(message: any, ...additional: any[]): void;

  static ɵfac: i0.ɵɵFactoryDeclaration<LoggerService, never>;

  static ɵprov: i0.ɵɵInjectableDeclaration<LoggerService>;
}
