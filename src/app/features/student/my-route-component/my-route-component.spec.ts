import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRouteComponent } from './my-route-component';

describe('MyRouteComponent', () => {
  let component: MyRouteComponent;
  let fixture: ComponentFixture<MyRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRouteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRouteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
