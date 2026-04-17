import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponentTs } from './overview-component.ts';

describe('OverviewComponentTs', () => {
  let component: OverviewComponentTs;
  let fixture: ComponentFixture<OverviewComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponentTs],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponentTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
