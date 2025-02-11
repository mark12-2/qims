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
      this.equipmentList = result;
    } else {
      console.error('Failed to fetch equipment data');
    }
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
    }
  }

  viewEquipmentDetails(equipmentId: string) {
    this.router.navigate(['/equipment-details', equipmentId]);
  }

  // ✅ Open QR Code Modal
  openQRCodeModal(qrCodeUrl: string) {
    this.selectedQRCode = qrCodeUrl;
    this.isQRCodeModalOpen = true;
  }

  // ✅ Close QR Code Modal
  closeQRCodeModal() {
    this.isQRCodeModalOpen = false;
    this.selectedQRCode = null;
  }
}
