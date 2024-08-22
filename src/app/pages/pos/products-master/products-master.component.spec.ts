import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMasterComponent } from './products-master.component';

describe('ProductsMasterComponent', () => {
  let component: ProductsMasterComponent;
  let fixture: ComponentFixture<ProductsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
