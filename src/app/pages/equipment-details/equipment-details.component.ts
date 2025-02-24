import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-equipment-details',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './equipment-details.component.html',
  styleUrls: ['./equipment-details.component.css'],
})
export class EquipmentDetailsComponent implements OnInit {
  equipmentId: string | null = null;
  equipmentData: any = null;
  costChart: any;
  equipmentMovements: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.equipmentId = this.route.snapshot.paramMap.get('id');
    console.log('Equipment ID:', this.equipmentId);

    if (this.equipmentId) {
      await this.fetchEquipmentDetails(this.equipmentId);
      await this.fetchEquipmentMovements(this.equipmentId);
    }
  }

  async fetchEquipmentMovements(equipmentId: string) {
    const movements = await this.supabaseService.getEquipmentMovements(equipmentId);

    if (!movements) {
      console.error('❌ Failed to fetch equipment movements');
    } else {
      console.log('Fetched Equipment Movements:', movements);

      // Map the data to the equipmentMovements array
      this.equipmentMovements = movements.map((movement: any) => ({
        movement_date: movement.movement_date ? new Date(movement.movement_date).toISOString() : null,
        used_quantity: movement.used_quantity,
        total_quantity: movement.total_quantity,
        remaining_quantity: movement.remaining_quantity,
        project_name: movement.project_name,
      }));

      console.log('Processed Equipment Movements:', this.equipmentMovements);
    }
  }

  async fetchEquipmentDetails(equipmentId: string) {
    const data = await this.supabaseService.getEquipmentById(equipmentId);
    console.log('Fetched Equipment Data:', data);

    if (data) {
      this.equipmentData = data;

      // 🔹 Render chart after fetching cost history
      setTimeout(() => {
        this.renderChart();
      }, 500);
    } else {
      console.error('❌ Failed to fetch equipment details');
      this.router.navigate(['/equipment-list']);
    }
  }

  renderChart() {
    const canvas = document.getElementById('costChart') as HTMLCanvasElement;

    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }

    if (this.costChart) {
        this.costChart.destroy(); // ✅ Destroy old chart before creating a new one
    }

    if (!this.equipmentData?.cost_history || this.equipmentData.cost_history.length === 0) {
        console.warn('⚠ No valid cost data found for chart.');
        return;
    }

    this.costChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: this.equipmentData.cost_history.map((entry: { date_updated: string }) =>
                new Date(entry.date_updated).toLocaleDateString()
            ),
            datasets: [
                {
                    label: 'Supplier Cost',
                    data: this.equipmentData.cost_history.map((entry: { supplier_cost: number }) => entry.supplier_cost),
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'SRP',
                    data: this.equipmentData.cost_history.map((entry: { srp: number }) => entry.srp),
                    borderColor: 'green',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            const numericValue = Number(value);
                            if (numericValue >= 1_000_000) return `${numericValue / 1_000_000}M`;
                            if (numericValue >= 1_000) return `${numericValue / 1_000}K`;
                            return numericValue;
                        }
                    }
                }
            }
        }
    });

    console.log('✅ Cost history chart rendered successfully!');
  }

  goBack() {
    this.router.navigate(['/equipment-list']);
  }
}
