import { Component, OnInit } from '@angular/core';
import QRCode from 'qrcode';
import { SupabaseService } from '../../services/supabase.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-equipment',
  imports: [SidebarComponent, FormsModule, CommonModule, NgIf],
  templateUrl: './add-equipment.component.html',
  styleUrls: ['./add-equipment.component.css']
})
export class AddEquipmentComponent implements OnInit {
  suppliers: any[] = [];
  isEditMode = false;
  equipmentId: string | null = null;

  // 🔹 Equipment Data Object
  equipmentData = {
    serial_no: '',
    name: '',
    model: '',
    brand: '',
    supplier: '',
    supplier_cost: 0,
    srp: 0,
    quantity: 0,
    location: '',
    description: '',
    variety: '',
    qr_code: '',
    product_images: [] as string[],
    repair_logs: [] as any[],
    return_slip: '',
    damaged: false,
    condition: '',
    date_acquired: '',  // 🔹 New field
    lifespan_months: 12 // 🔹 Default lifespan of 12 months
  };

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadSuppliers();

    // ✅ Check if there's an equipment object in history.state
    if (history.state.equipment) {
      this.isEditMode = true;
      this.equipmentId = history.state.equipment.id;
      this.equipmentData = { ...history.state.equipment };

      console.log('🔄 Editing Equipment:', this.equipmentData);
    }
  }


  async loadSuppliers() {
    const data = await this.supabaseService.getSuppliers();
    if (data) {
      this.suppliers = data;
    } else {
      console.error('❌ Failed to load suppliers.');
    }
  }

  async onSubmit() {
    await this.generateQRCode();

    // 🔹 Set today's date if no date is provided
  if (!this.equipmentData.date_acquired) {
    this.equipmentData.date_acquired = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

    // 🔹 Upload Images
    const imageFiles = (document.getElementById('productImage') as HTMLInputElement).files;
    if (imageFiles) {
      const imageUrls = await this.uploadImages(imageFiles);
      this.equipmentData.product_images = imageUrls;
    }

    if (this.isEditMode && this.equipmentId) {
      // ✅ Update Equipment
      const result = await this.supabaseService.updateEquipment(this.equipmentId, this.equipmentData);
      if (result) {
        console.log('✅ Equipment updated successfully:', result);
        this.router.navigate(['/equipment-list']);
      } else {
        console.error('❌ Failed to update equipment');
      }
    } else {
      // ✅ Add New Equipment
      const result = await this.supabaseService.addEquipment(this.equipmentData);
      if (result) {
        console.log('✅ Equipment added successfully:', result);
        this.router.navigate(['/equipment-list']);
      } else {
        console.error('❌ Failed to add equipment');
      }
    }
  }


  async generateQRCode() {
    const data = `${this.equipmentData.serial_no}-${this.equipmentData.name}`;
    try {
      const qrCode = await QRCode.toDataURL(data);
      this.equipmentData.qr_code = qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  async uploadImages(files: FileList) {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 50 * 1024 * 1024) {
        console.error(`❌ Skipping file ${file.name} (too large).`);
        continue;
      }

      const url = await this.supabaseService.uploadFile(file);
      if (url) {
        urls.push(url);
      } else {
        console.error(`❌ Failed to upload image: ${file.name}`);
      }
    }
    return urls;
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadImages(input.files);
    }
  }

  async handleReturnSlip(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const url: string | null = await this.supabaseService.uploadFile(file);
      if (url) {
        this.equipmentData.return_slip = url;
      } else {
        console.error('❌ Failed to upload return slip.');
      }
    }
  }

  addRepairLog() {
    this.equipmentData.repair_logs.push({ repair_details: '', repair_status: 'New', repair_date: '' });
  }

  removeRepairLog(index: number) {
    this.equipmentData.repair_logs.splice(index, 1);
  }
}
