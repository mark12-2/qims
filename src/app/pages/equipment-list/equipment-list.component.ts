import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipment-list',
  imports: [CommonModule,],
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.css'],
})
export class EquipmentListComponent implements OnInit {
  equipmentList: any[] = []; // Store the fetched equipment data

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEquipmentData(); // Fetch the equipment data when the component is initialized
  }

  // Fetch data from Supabase
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

    // ✅ Immediately update the UI by filtering out the deleted item
    this.equipmentList = this.equipmentList.filter(e => e.id !== equipmentId);
  }
}



  // Method to delete equipment from Supabase
  async deleteEquipmentFromDatabase(equipmentId: string): Promise<{ data: any, error: any }> {
    return await this.supabaseService.deleteEquipment(equipmentId);
  }
}
