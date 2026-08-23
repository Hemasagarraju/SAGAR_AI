import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hema } from './hema';

describe('Hema', () => {
  let component: Hema;
  let fixture: ComponentFixture<Hema>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hema],
    }).compileComponents();

    fixture = TestBed.createComponent(Hema);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
