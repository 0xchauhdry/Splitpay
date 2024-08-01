import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpenseComponent } from './expense-list/expense/expense.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FriendsComponent } from './friends/friends.component';
import { LeftNavComponent } from './left-nav/left-nav.component';
import { FETCH_IMAGE, FETCH_FRIENDS, FETCH_GROUPS, clearStore } from 'src/store/actions';
import { getImage } from 'src/store/selectors';
import { Subscription } from 'rxjs';
import { ImageService } from 'src/services/common/image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    ExpenseComponent,
    RouterModule,
    FriendsComponent,
    LeftNavComponent,
    RouterOutlet
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(private store: Store, private imageService: ImageService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.store.dispatch(FETCH_IMAGE());
    this.store.dispatch(FETCH_FRIENDS());
    this.store.dispatch(FETCH_GROUPS());

    this.getImage();
  }
  getImage(){
    this.subscription.add(
      this.store.select(getImage)
      .subscribe(image => {
        if (image){
          const imageUrl = this.imageService.imageToSafeUrl(image);
          this.imageService.userImageUrl = imageUrl;
        } 
      })
    );
  }
  ngOnDestroy(): void {
    this.store.dispatch(clearStore());
    this.subscription.unsubscribe();
  }
}
