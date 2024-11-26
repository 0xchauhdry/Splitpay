import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationCenterModule } from '@novu/notification-center-angular';
import { FormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { User } from 'src/shared/models/user.model';
import { ImageService } from 'src/services/common/image.service';
import { AvatarModule } from 'primeng/avatar';
import { SafeUrl } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { ChangePasswordComponent } from 'src/shared/components/change-password/change-password.component';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationCenterModule,
    FormsModule,
    OverlayPanelModule,
    InputSwitchModule,
    AvatarModule
  ],
  providers:[
    DialogService
  ]
})
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  subscriberId: string = '';
  applicationIdentifier = environment.applicationIdentifier;
  subscription: Subscription;
  user: User;
  userImageUrl: SafeUrl;
  isDarkMode: boolean = false;
  @ViewChild('op') overlayPanel: OverlayPanel;

  constructor(private authService: AuthService,
     private router: Router,
     private imageService: ImageService,
     private dialog: DialogService,
     ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription.add(
      this.authService
      .isLoggedIn()
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      })
    );

    this.subscription.add(
      this.authService.user$
      .subscribe({
        next: (user: User) => {
          if(user){
            this.user = user;
            this.subscriberId = this.user.id.toString() ?? '';
          }
        },
      })
    );

    this.subscription.add(
      this.imageService.userImageUrl.subscribe({
        next: (imageUrl: string) => {
          this.userImageUrl = imageUrl;
        },
      })
    );
  }

  sessionLoaded = (data: unknown) => {
    console.log('loaded', { data });
  };

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  updatePassword(){
    this.dialog.open(ChangePasswordComponent, {
      header: this.user.passwordSet ? 'Change Password' : 'Set Password',
      width: '600px',
      modal: true,
      contentStyle: { overflow: 'auto' },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });
  }

  logout() {
    this.authService.logoutUser();
    this.overlayPanel.hide();
    this.imageService.userImageUrl = '';
    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
