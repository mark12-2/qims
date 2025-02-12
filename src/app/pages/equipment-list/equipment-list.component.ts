import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipment-list',
  imports: [CommonModule],
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.css'],
})
export class EquipmentListComponent implements OnInit {
  equipmentList: any[] = [];
  filteredEquipmentList: any[] = [];
  isQRCodeModalOpen = false;
  selectedQRCode: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEquipmentData();
  }

      async fetchEquipmentData() {
        const result = await this.supabaseService.getEquipmentList();
        if (result) {
          // ✅ Sort by `date_acquired` (latest first) to maintain order
          this.equipmentList = result.sort((a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime());
          this.filteredEquipmentList = [...this.equipmentList];
        } else {
          console.error('Failed to fetch equipment data');
        }
    }

    getStatusClass(timeRemaining: number) {
      if (timeRemaining <= 0) {
        return 'expired'; // Red
      } else if (timeRemaining <= 60) {
        return 'warning'; // Orange
      } else {
        return 'safe'; // Green (default)
      }
    }

  applyFilter(event: any, field: string) {
    const value = event.target.value.toLowerCase();
    this.filteredEquipmentList = this.equipmentList.filter(equipment =>
      equipment[field].toLowerCase().includes(value)
    );
  }

  editEquipment(equipment: any) {
    this.router.navigate(['/add-equipment'], { state: { equipment } });
  }

  async deleteEquipment(equipmentId: string) {
    console.log(`🗑️ Deleting equipment with ID: ${equipmentId}`);

    const result = await this.supabaseService.deleteEquipment(equipmentId);

    if (result.error) {
      console.error('❌ Error deleting equipment:', result.error);
    } else {
      console.log('✅ Equipment deleted successfully:', result.data);
      this.equipmentList = this.equipmentList.filter(e => e.id !== equipmentId);
      this.filteredEquipmentList = [...this.equipmentList];
    }
  }

  viewEquipmentDetails(equipmentId: string) {
    this.router.navigate(['/equipment-details', equipmentId]);
  }

  openQRCodeModal(qrCodeUrl: string) {
    this.selectedQRCode = qrCodeUrl;
    this.isQRCodeModalOpen = true;
  }

  closeQRCodeModal() {
    this.isQRCodeModalOpen = false;
    this.selectedQRCode = null;
  }
}
