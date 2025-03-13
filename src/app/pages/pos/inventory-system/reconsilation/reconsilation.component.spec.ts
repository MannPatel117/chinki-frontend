import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconsilationComponent } from './reconsilation.component';

describe('ReconsilationComponent', () => {
  let component: ReconsilationComponent;
  let fixture: ComponentFixture<ReconsilationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReconsilationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReconsilationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
