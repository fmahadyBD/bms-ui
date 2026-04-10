import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRoutines } from './student-routines';

describe('StudentRoutines', () => {
  let component: StudentRoutines;
  let fixture: ComponentFixture<StudentRoutines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRoutines],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentRoutines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
