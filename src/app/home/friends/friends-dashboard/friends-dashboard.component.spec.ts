import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsDashboardComponent } from './friends-dashboard.component';

describe('FriendsDashboardComponent', () => {
  let component: FriendsDashboardComponent;
  let fixture: ComponentFixture<FriendsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
