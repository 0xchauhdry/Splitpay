import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupContainerComponent } from './group-container.component';

describe('GroupContainerComponent', () => {
  let component: GroupContainerComponent;
  let fixture: ComponentFixture<GroupContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
