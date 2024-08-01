import { CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotificationCenterModule } from '@novu/notification-center-angular';
import { ToastModule } from 'primeng/toast';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { Router, RouterOutlet } from '@angular/router';
import { LoaderComponent } from 'src/shared/components/loader/loader.component';
import { LoaderService } from 'src/services/services/loader.service';
import { CommonModule } from '@angular/common';
import { CsrfService } from 'src/services/services/csrf.service';
import { AuthService } from 'src/services/auth/auth.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { User } from 'src/shared/models/user.model';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { UserService } from 'src/services/components/user.service';
import { NotifierService } from 'src/services/services/notifier.service';

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
  providers: [
    CsrfService,
    UserService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PSClient';
  subscription: Subscription;
  constructor(
     public loader: LoaderService,
     private csrfService: CsrfService,
     private authService: AuthService,
     private mixpanel: MixpanelService,
     private changeDetectorRef: ChangeDetectorRef,
     private socialAuth: SocialAuthService,
     private userService: UserService,
     private notifier: NotifierService,
     private router: Router
  ){
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.getcsrfToken();
    this.subscribeToSocialAuth();
    this.initMixpanel();
  }

  subscribeToSocialAuth(){
    this.subscription.add(
      this.socialAuth.authState
      .subscribe((user: SocialUser) => {
        if (user){
          this.socialLogin(user);
        }
        else{
          this.authService.signOut();
        }
      })
    );
  }

  socialLogin(socialUser: SocialUser){
    const signinUser = {
      name: {
        first: socialUser.firstName,
        last: socialUser.lastName,
        display: socialUser.name
      },
      email: socialUser.email,
      googleToken: socialUser.idToken
    } as User;

    this.userService.socialLogin(signinUser).subscribe({
      next: (user: User) => {
        console.log(user)
        this.notifier.success('User Logged In Successfully', 'Signed In');
        this.authService.loginUser(user);
        this.mixpanel.log('Social Login', { userId : user.id });
        this.router.navigate(['home']);
      }
    })
  }

  ngAfterViewInit() {
    this.loader.isLoading.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  getcsrfToken(){
    this.subscription.add(
      this.csrfService.get()
      .subscribe({
        next: (res) => {
          this.authService.csrfToken = res.csrfToken;
        }
      })
    );
  }

  initMixpanel(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if(user){
          this.mixpanel.init(`ps_${user.id}`, environment.mixpanelKey,
             { name: user.username, email: user.email});
          this.mixpanel.log('Online');
        } 
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
