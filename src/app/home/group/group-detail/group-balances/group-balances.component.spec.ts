import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBalancesComponent } from './group-balances.component';

describe('GroupBalancesComponent', () => {
  let component: GroupBalancesComponent;
  let fixture: ComponentFixture<GroupBalancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBalancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
