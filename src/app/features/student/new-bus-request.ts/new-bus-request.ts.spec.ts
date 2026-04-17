import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusRequestTs } from './new-bus-request.ts';

describe('NewBusRequestTs', () => {
  let component: NewBusRequestTs;
  let fixture: ComponentFixture<NewBusRequestTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBusRequestTs],
    }).compileComponents();

    fixture = TestBed.createComponent(NewBusRequestTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
