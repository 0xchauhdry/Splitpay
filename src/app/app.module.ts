import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { RouterModule } from '@angular/router';
import { HomeModule } from './home/home.module';
import { NavBarModule } from './nav-bar/nav-bar.module';
import { StoreModule } from '@ngrx/store';
import { userReducer } from '../services/auth/user.state';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApiResponseInterceptor } from 'src/services/api/api.response.interceptor';
import { ApiRequestInterceptor } from 'src/services/api/api.request.interceptor';
import { NotifierService } from 'src/services/services/notifier.service';
import { environment } from 'src/environments/environment';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationCenterModule } from '@novu/notification-center-angular';

export let AppInjector: Injector;
@NgModule({
  declarations: [AppComponent, PageNotFoundComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    HomeModule,
    LoginModule,
    SignupModule,
    RouterModule,
    NavBarModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({ user: userReducer }),
    HttpClientModule,
    ToastModule,
    LoggerModule.forRoot({
      serverLoggingUrl: environment.logApiUrl,
      level: NgxLoggerLevel.ERROR,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    NotificationCenterModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiRequestInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiResponseInterceptor,
      multi: true,
    },
    MessageService,
    NotifierService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
