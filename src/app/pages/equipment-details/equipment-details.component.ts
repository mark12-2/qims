import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-equipment-details',
  imports: [CommonModule, NgIf],
  templateUrl: './equipment-details.component.html',
  styleUrls: ['./equipment-details.component.css'],
})
export class EquipmentDetailsComponent implements OnInit {
  equipmentId: string | null = null;
  equipmentData: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.equipmentId = this.route.snapshot.paramMap.get('id');
    if (this.equipmentId) {
      await this.fetchEquipmentDetails(this.equipmentId);
    }
  }

  async fetchEquipmentDetails(equipmentId: string) {
    const data = await this.supabaseService.getEquipmentById(equipmentId);
    if (data) {
      this.equipmentData = data;
      console.log('✅ Equipment Details Loaded:', this.equipmentData);
    } else {
      console.error('❌ Failed to fetch equipment details');
      this.router.navigate(['/equipment-list']); // Redirect if not found
    }
  }

  goBack() {
    this.router.navigate(['/equipment-list']);
  }
}
