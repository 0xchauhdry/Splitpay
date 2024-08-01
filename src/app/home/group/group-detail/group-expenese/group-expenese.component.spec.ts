import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupExpeneseComponent } from './group-expenese.component';

describe('GroupExpeneseComponent', () => {
  let component: GroupExpeneseComponent;
  let fixture: ComponentFixture<GroupExpeneseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupExpeneseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupExpeneseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
