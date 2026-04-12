import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyManagement } from './survey-management';

describe('SurveyManagement', () => {
  let component: SurveyManagement;
  let fixture: ComponentFixture<SurveyManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
