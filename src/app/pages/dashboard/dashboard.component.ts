import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Chart } from 'chart.js/auto';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgFor, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userEmail: string | null = null;
  selectedEquipmentId: string | null = null;
  costHistory: any[] = [];
  equipmentList: any[] = [];
  costChart: any;
  totalEquipment: number = 0;
  recentActivities: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.loadUserEmail();
    this.equipmentList = await this.supabaseService.getEquipmentList() || [];
    this.totalEquipment = await this.supabaseService.getTotalEquipmentCount();
    this.recentActivities = await this.supabaseService.getRecentActivities();

    console.log('🔍 Recent Activities Data:', this.recentActivities); // ✅ Debugging Log
  }


  async loadUserEmail() {
    const user = await this.supabaseService.getUser();
    this.userEmail = user?.email || 'Guest';
  }

  async onEquipmentChange(event: any) {
    this.selectedEquipmentId = event.target.value;
    console.log('🔍 Selected Equipment ID:', this.selectedEquipmentId);

    if (this.selectedEquipmentId) {
      this.costHistory = await this.supabaseService.getCostHistory(this.selectedEquipmentId);
      console.log('📊 Cost History Data:', this.costHistory);


      setTimeout(() => {
        this.renderChart();
      }, 500); // Delay to ensure canvas is available
    }
  }

  renderChart() {
    const canvas = document.getElementById('costChart') as HTMLCanvasElement;

    if (!canvas) {
      console.error('❌ Canvas element not found!');
      return;
    }

    if (this.costChart) {
      this.costChart.destroy(); // Remove old chart before creating a new one
    }

    this.costChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.costHistory.map(entry => new Date(entry.date_updated).toLocaleDateString()),
        datasets: [
          {
            label: 'Supplier Cost',
            data: this.costHistory.map(entry => entry.supplier_cost),
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
            spanGaps: true
          },
          {
            label: 'SRP',
            data: this.costHistory.map(entry => entry.srp),
            borderColor: 'green',
            borderWidth: 2,
            fill: false,
            spanGaps: true
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
                if (numericValue >= 1_000_000) return `${numericValue / 1_000_000}M`; // Convert to millions
                if (numericValue >= 1_000) return `${numericValue / 1_000}K`; // Convert to thousands
                return numericValue; // Otherwise, show raw value
              }
            }
          }
        }
      }
    });

    console.log('✅ Chart rendered with formatted values!');
  }


  // Duplicate method removed
}



