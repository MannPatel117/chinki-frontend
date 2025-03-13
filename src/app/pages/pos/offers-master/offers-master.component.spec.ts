import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersMasterComponent } from './offers-master.component';

describe('OffersMasterComponent', () => {
  let component: OffersMasterComponent;
  let fixture: ComponentFixture<OffersMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffersMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
