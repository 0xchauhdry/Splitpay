import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/services/auth/auth.service';
import { getUser } from 'src/services/auth/user.state';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  private isLoggedInSubscription: Subscription;
  isLoggedIn: boolean = false;
  subscriberId: string = '';
  applicationIdentifier = environment.applicationIdentifier;
  constructor(private authService: AuthService, private router: Router, private store: Store) {}

  ngOnInit() {
    this.isLoggedInSubscription = this.authService
      .isLoggedIn()
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      });

    this.store.pipe(select(getUser))
      .subscribe((user: any) => {
        this.subscriberId = user?.user?.UserId?.toString() ?? '';
      })
  }

  sessionLoaded = (data: unknown) => {
    console.log('loaded', { data });
  };

  LogOut() {
    this.authService.logoutUser();
    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
  }
}
