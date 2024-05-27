import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroupComponent } from './add-group.component';

describe('AddGroupComponent', () => {
  let component: AddGroupComponent;
  let fixture: ComponentFixture<AddGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddGroupComponent]
    });
    fixture = TestBed.createComponent(AddGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
