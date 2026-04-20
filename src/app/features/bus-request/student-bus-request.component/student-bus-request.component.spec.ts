import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBusRequestComponent } from './student-bus-request.component';

describe('StudentBusRequestComponent', () => {
  let component: StudentBusRequestComponent;
  let fixture: ComponentFixture<StudentBusRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentBusRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentBusRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
