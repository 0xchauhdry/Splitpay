import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';

@Component({
  selector: 'app-left-nav',
  standalone: true,
  imports: [
    TooltipModule,
    RouterModule
  ],
  templateUrl: './left-nav.component.html',
  styleUrl: './left-nav.component.scss'
})
export class LeftNavComponent implements OnInit {
  items = []
  currentUrl: string = '';

  constructor(private router: Router){
    this.items.push({
      name: 'Home',
      url: '',
      icon : 'pi pi-home'
    },{
      name: 'Search',
      url: '',
      icon : 'pi pi-search'
    },{
      name: 'Friends',
      url: 'friend',
      icon : 'pi pi-user'
    },{
      name: 'Groups',
      url: 'group',
      icon : 'pi pi-users'
    },{
      name: 'Settings',
      url: 'settings',
      icon : 'pi pi-cog'
    },)
  }
  ngOnInit(): void {
    this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: NavigationEnd) => {
      this.currentUrl = this.router.url || '';
    });
  }
  isActive(url: string): boolean {
    return this.currentUrl.includes(url);
  }
  toggleNav(){

  }
}
