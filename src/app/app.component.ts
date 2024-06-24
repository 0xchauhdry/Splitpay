import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { NotificationCenterModule } from '@novu/notification-center-angular';
import { ToastModule } from 'primeng/toast';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoaderService } from 'src/services/services/loader.service';
import { CommonModule } from '@angular/common';
import { CsrfService } from 'src/services/services/csrf.service';
import { AuthService } from 'src/services/auth/auth.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { User } from 'src/models/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    NotificationCenterModule,
    NavBarComponent,
    RouterOutlet,
    LoaderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'PSClient';
  constructor(
     public loaderService: LoaderService,
     private csrfService: CsrfService,
     private authService: AuthService,
     private mixpanel: MixpanelService
  ){
    this.getcsrfToken();
    this.initMixpanel();
  }

  getcsrfToken(){
    this.csrfService.get()
    .subscribe({
      next: (res) => {
        this.authService.csrfToken = res.csrfToken;
      }
    });
  }

  initMixpanel(){
    this.authService.user$
    .subscribe((user: User) => {
      if(user){
        this.mixpanel.init(`ps_${user.id}`, environment.mixpanelKey,
           { name: user.username, email: user.email});
        this.mixpanel.log('Online');
      } 
    })
  }
}
