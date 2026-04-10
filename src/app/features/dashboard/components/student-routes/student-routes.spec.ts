import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRoutes } from './student-routes';

describe('StudentRoutes', () => {
  let component: StudentRoutes;
  let fixture: ComponentFixture<StudentRoutes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRoutes],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentRoutes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
