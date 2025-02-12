import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCostChartComponent } from './equipment-cost-chart.component';

describe('EquipmentCostChartComponent', () => {
  let component: EquipmentCostChartComponent;
  let fixture: ComponentFixture<EquipmentCostChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentCostChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentCostChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
