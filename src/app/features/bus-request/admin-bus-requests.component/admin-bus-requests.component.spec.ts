import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBusRequestsComponent } from './admin-bus-requests.component';

describe('AdminBusRequestsComponent', () => {
  let component: AdminBusRequestsComponent;
  let fixture: ComponentFixture<AdminBusRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBusRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBusRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
