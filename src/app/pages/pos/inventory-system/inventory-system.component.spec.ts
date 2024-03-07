import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySystemComponent } from './inventory-system.component';

describe('InventorySystemComponent', () => {
  let component: InventorySystemComponent;
  let fixture: ComponentFixture<InventorySystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventorySystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
