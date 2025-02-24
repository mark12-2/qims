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

  // 🔹 Equipment Data Array
  equipmentDataArray = [{
    serial_no: '',
    name: '',
    model: '',
    brand: '',
    supplier: '',
    supplier_cost: 0,
    srp: 0,
    quantity: 1,
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
  }];

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadSuppliers();

    // ✅ Check if there's an equipment object in history.state
    if (history.state.equipment) {
      this.isEditMode = true;
      this.equipmentId = history.state.equipment.id;
      this.equipmentDataArray = [{ ...history.state.equipment }];

      console.log('🔄 Editing Equipment:', this.equipmentDataArray);
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
    for (const equipment of this.equipmentDataArray) {
      await this.generateQRCode(equipment);

      if (!equipment.date_acquired) {
        equipment.date_acquired = new Date().toISOString().split('T')[0];
      }

      const imageInput = document.getElementById(`productImage${this.equipmentDataArray.indexOf(equipment)}`) as HTMLInputElement;
      if (imageInput && imageInput.files) {
        const imageUrls = await this.uploadImages(imageInput.files);
        equipment.product_images = imageUrls;
      }

      if (this.isEditMode && this.equipmentId) {
        // 🔹 If in edit mode, update the existing equipment by ID
        const updateResult = await this.supabaseService.updateEquipment(this.equipmentId, equipment);

        if (updateResult) {
          console.log(`✅ Equipment updated successfully: ${equipment.name}`);
          this.router.navigate(['/equipment-list']);  // Redirect after update
        } else {
          console.error(`❌ Failed to update equipment: ${equipment.name}`);
        }
      } else {
        // 🔹 If not in edit mode, check if the equipment exists before adding a new one
        const existingEquipment = await this.supabaseService.getEquipmentByNameModelBrand(
          equipment.name,
          equipment.model,
          equipment.brand
        );

        if (existingEquipment) {
          // Update the existing equipment quantity instead of creating a new entry
          const newQuantity = existingEquipment.quantity + equipment.quantity;
          const updateResult = await this.supabaseService.updateEquipment(existingEquipment.id, {
            ...equipment, // Merge data
            quantity: newQuantity
          });

          if (updateResult) {
            console.log(`✅ Equipment updated successfully: ${existingEquipment.name}`);
          } else {
            console.error(`❌ Failed to update equipment: ${existingEquipment.name}`);
          }
        } else {
          // Add new equipment if no match is found
          const result = await this.supabaseService.addEquipment(equipment);
          if (result) {
            console.log('✅ Equipment added successfully:', result);
            this.router.navigate(['/equipment-list']);
          } else {
            console.error('❌ Failed to add equipment');
          }
        }
      }
    }
  }

  async generateQRCode(equipment: any) {
    const data = `${equipment.serial_no}-${equipment.name}`;
    try {
      const qrCode = await QRCode.toDataURL(data);
      equipment.qr_code = qrCode;
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

  handleFileInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadImages(input.files).then((urls) => {
        this.equipmentDataArray[index].product_images = urls;
      });
    }
  }

  async handleReturnSlip(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const url: string | null = await this.supabaseService.uploadFile(file);
      if (url) {
        this.equipmentDataArray[index].return_slip = url;
      } else {
        console.error('❌ Failed to upload return slip.');
      }
    }
  }

  addRepairLog(equipment: any) {
    equipment.repair_logs.push({ repair_details: '', repair_status: 'New', repair_date: '' });
  }

  removeRepairLog(equipment: any, index: number) {
    equipment.repair_logs.splice(index, 1);
  }

  addEquipment() {
    this.equipmentDataArray.push({
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
    });
  }

  removeEquipment(index: number) {
    this.equipmentDataArray.splice(index, 1);
  }
}
