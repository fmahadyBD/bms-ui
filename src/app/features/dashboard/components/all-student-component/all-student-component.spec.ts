import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStudentComponent } from './all-student-component';

describe('AllStudentComponent', () => {
  let component: AllStudentComponent;
  let fixture: ComponentFixture<AllStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStudentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllStudentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
