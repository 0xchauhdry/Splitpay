import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationCenterModule } from '@novu/notification-center-angular';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { User } from 'src/models/user.model';
import { ImageService } from 'src/services/common/image.service';
import { AvatarModule } from 'primeng/avatar';
import { SafeUrl } from '@angular/platform-browser';

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
})
export class NavBarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  subscriberId: string = '';
  applicationIdentifier = environment.applicationIdentifier;
  subscription: Subscription;
  user: User;
  userImageUrl: SafeUrl;
  constructor(private authService: AuthService,
     private router: Router,
     private imageService: ImageService,
     ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription.add(this.authService
      .isLoggedIn()
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      })
    );

    this.authService.user$
    .subscribe({
      next: (user: User) => {
        if(user){
          this.user = user;
          this.subscriberId = this.user.id.toString() ?? '';
        }
      },
    });
    
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

  isDarkMode: boolean = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout() {
    this.authService.logoutUser();
    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
