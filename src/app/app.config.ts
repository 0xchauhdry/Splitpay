import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, ErrorHandler, importProvidersFrom, isDevMode } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ROUTES } from "./app.routes";
import { provideRouter, withHashLocation } from "@angular/router";
import { apiRequestInterceptor } from "src/services/api/api.request.interceptor";
import { apiResponseInterceptor } from "src/services/api/api.response.interceptor";
import { StoreModule, provideStore } from "@ngrx/store";
import { MessageService } from "primeng/api";
import { NotifierService } from "src/services/services/notifier.service";
import { LoaderService } from "src/services/services/loader.service";
import { ErrorHandlerService } from "src/services/common/error-handler.service";
import { MixpanelService } from "src/services/services/mixpanel.service";
import { ApiService } from "src/services/api/api.service";
import { AuthService } from "src/services/auth/auth.service";
import { ImageService } from "src/services/common/image.service";
import { CommonService } from "src/services/common/common.service";
import { EffectsModule, provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { dataReducer } from "src/store/reducer";
import { DataEffects } from "src/store/effects";
import { socialAuthConfig } from "src/services/auth/social-auth.config";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES),
    provideHttpClient(withInterceptors([
        apiRequestInterceptor,
        apiResponseInterceptor
    ])),
    provideAnimations(),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    ApiService,
    AuthService,
    MessageService,
    ImageService,
    NotifierService,
    LoaderService,
    MixpanelService,
    CommonService,
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    importProvidersFrom(
      StoreModule.forRoot({ data: dataReducer }),
      EffectsModule.forRoot([DataEffects]),
    ),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: socialAuthConfig,
    }
]
}