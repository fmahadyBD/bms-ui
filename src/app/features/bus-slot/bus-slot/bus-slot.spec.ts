import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusSlot } from './bus-slot';

describe('BusSlot', () => {
  let component: BusSlot;
  let fixture: ComponentFixture<BusSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusSlot],
    }).compileComponents();

    fixture = TestBed.createComponent(BusSlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
