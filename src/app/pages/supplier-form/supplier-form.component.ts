import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For ngModel
import { SupabaseService } from '../../supabase.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [FormsModule], // Add NgIf to the imports array
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent {
  // Form fields
  supplierName = '';
  contactPerson = '';
  phone = '';
  email = '';
  address = '';
  groupChatLink = '';

  constructor(
    private supabaseService: SupabaseService,
    private authService: SupabaseAuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.restoreSession(); // 🔹 Ensure session is restored first
    const user = await this.authService.getUser();
    if (!user) {
      console.error('❌ User session is missing after navigation.');
      alert('Session expired. Please log in again.');
      return;
    }
    console.log('✅ User session exists:', user);
  }

  async onSubmit(): Promise<void> {
    try {
      // Validate required fields
      if (
        !this.supplierName ||
        !this.contactPerson ||
        !this.phone ||
        !this.email ||
        !this.address
      ) {
        alert('Please fill out all required fields.');
        return;
      }
      console.log('Submitting form...');

      // Prepare supplier data
      const supplierData = {
        supplier_name: this.supplierName,
        contact_person: this.contactPerson,
        phone: this.phone,
        email: this.email,
        address: this.address,
        group_chat_link: this.groupChatLink
      };
      console.log('Adding supplier:', supplierData);

      // Add supplier to the database
      const supplier = await this.supabaseService.addSupplier(supplierData);
      console.log('Supplier added successfully:', supplier);

      // Clear the form
      this.supplierName = '';
      this.contactPerson = '';
      this.phone = '';
      this.email = '';
      this.address = '';
      this.groupChatLink = '';

      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add supplier. Please try again.');
    }
  }
}