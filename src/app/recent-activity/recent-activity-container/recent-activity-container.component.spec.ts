import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActivityContainerComponent } from './recent-activity-container.component';

describe('RecentActivityContainerComponent', () => {
  let component: RecentActivityContainerComponent;
  let fixture: ComponentFixture<RecentActivityContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecentActivityContainerComponent]
    });
    fixture = TestBed.createComponent(RecentActivityContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
