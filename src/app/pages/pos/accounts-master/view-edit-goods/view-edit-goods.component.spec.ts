import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditGoodsComponent } from './view-edit-goods.component';

describe('ViewEditGoodsComponent', () => {
  let component: ViewEditGoodsComponent;
  let fixture: ComponentFixture<ViewEditGoodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditGoodsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewEditGoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
