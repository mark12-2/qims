import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-equipment-cost-chart',
  templateUrl: './equipment-cost-chart.component.html',
  styleUrls: ['./equipment-cost-chart.component.css']
})
export class EquipmentCostChartComponent implements OnInit {
  @Input() equipmentId!: string;
  costChart: any;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    if (this.equipmentId) {
      try {
        const costHistory = await this.supabaseService.getCostHistory(this.equipmentId);
        this.renderChart(costHistory);
      } catch (error) {
        console.error('Error fetching cost history:', error);
      }
    }
  }

  renderChart(costHistory: any) {
    if (!costHistory || costHistory.length === 0) {
      console.error('❌ No cost history found.');
      return;
    }

    const labels = costHistory.map((entry: any) => new Date(entry.updated_at).toLocaleDateString());
    const supplierCosts = costHistory.map((entry: any) => entry.supplier_cost);
    const srpCosts = costHistory.map((entry: any) => entry.srp);

    const ctx = document.getElementById('costChart') as HTMLCanvasElement;
    this.costChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Supplier Cost',
            data: supplierCosts,
            borderColor: '#007bff',
            fill: false,
          },
          {
            label: 'SRP',
            data: srpCosts,
            borderColor: '#28a745',
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
