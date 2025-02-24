import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.css']
})
export class EquipmentListComponent implements OnInit {
  equipmentList: any[] = [];
  groupedEquipment: { [key: string]: any[] } = {};
  filteredEquipmentList: any[] = [];
  isQRCodeModalOpen = false;
  selectedQRCode: string | null = null;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  paginatedEquipmentList = [];
  selectedEquipment: any = null;
  showQRCode: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadEquipment();
  }

  async loadEquipment() {
    const data = await this.supabaseService.getEquipmentList();
    if (data) {
      this.equipmentList = data.sort((a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime());

      // For each equipment, check if it's in use by looking up its latest movement
      for (let equipment of this.equipmentList) {
        const movements = await this.supabaseService.getEquipmentMovements(equipment.id);

        if (movements && movements.length > 0) {
          const latestMovement = movements[0]; // Assuming the latest movement is the first one
          if (latestMovement.movement_date === 'in use') {
            equipment.status = 'in use'; // Set status to 'in use'
          } else {
            equipment.status = 'available'; // You can set this if it's not in use
          }
        } else {
          equipment.status = 'available'; // If no movements found, assume it's available
        }
      }

      this.filteredEquipmentList = [...this.equipmentList];
      this.groupEquipment();
    }
  }


  groupEquipment() {
    this.groupedEquipment = this.equipmentList.reduce((groups: { [key: string]: any[] }, item) => {
      const key = item.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  getTotalQuantity(group: any[]): number {
    return group.reduce((sum, item) => sum + item.quantity, 0);
  }

  getGroupValue(group: any[]): number {
    return group.reduce((sum, item) => sum + (item.quantity * item.srp), 0);
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

  async deleteEquipment(id: string) {
    if (confirm('Are you sure you want to delete this equipment?')) {
      const success = await this.supabaseService.deleteEquipment(id);
      if (success) {
        await this.loadEquipment();
      }
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

  showQRCodeModal(equipment: any) {
    this.selectedEquipment = equipment;
    this.showQRCode = true;
  }


  getConditionClass(condition: string): string {
    return condition.toLowerCase() === 'new' ? 'condition-new' : 'condition-used';
  }

  getDamagedClass(damaged: boolean): string {
    return damaged ? 'damaged' : 'not-damaged';
  }
}
