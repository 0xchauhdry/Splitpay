import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsDetailComponent } from './friends-detail.component';

describe('FriendsDetailComponent', () => {
  let component: FriendsDetailComponent;
  let fixture: ComponentFixture<FriendsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
