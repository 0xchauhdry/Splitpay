import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSettleUpComponent } from './add-settle-up.component';

describe('AddSettleUpComponent', () => {
  let component: AddSettleUpComponent;
  let fixture: ComponentFixture<AddSettleUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSettleUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSettleUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
