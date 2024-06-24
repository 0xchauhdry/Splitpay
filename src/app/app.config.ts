import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, ErrorHandler, importProvidersFrom } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ROUTES } from "./app.routes";
import { provideRouter, withHashLocation } from "@angular/router";
import { apiRequestInterceptor } from "src/services/api/api.request.interceptor";
import { apiResponseInterceptor } from "src/services/api/api.response.interceptor";
import { StoreModule } from "@ngrx/store";
import { userReducer } from "src/services/auth/user.state";
import { MessageService } from "primeng/api";
import { NotifierService } from "src/services/services/notifier.service";
import { LoaderService } from "src/services/services/loader.service";
import { ErrorHandlerService } from "src/services/common/error-handler.service";
 
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES,withHashLocation()),
    provideHttpClient(withInterceptors([
      apiRequestInterceptor,
      apiResponseInterceptor
    ])),
    provideAnimations(),
    importProvidersFrom(StoreModule.forRoot({ user: userReducer })),
    MessageService,
    NotifierService,
    LoaderService,
    { provide: ErrorHandler, useClass: ErrorHandlerService }
  ]
}