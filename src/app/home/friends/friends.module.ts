import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsComponent } from './friends.component';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    FriendsComponent
  ],
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    TabViewModule,
    TooltipModule
  ]
})
export class FriendsModule { }
