import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutineManagement } from './routine-management';

describe('RoutineManagement', () => {
  let component: RoutineManagement;
  let fixture: ComponentFixture<RoutineManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutineManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutineManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
