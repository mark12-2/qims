import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For ngModel
import { NgFor, NgIf } from '@angular/common'; // Import NgFor and NgIf
import { SupabaseService } from '../../supabase.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf], // Add NgIf to the imports array
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent {
  // Array to hold dynamic item groups
  itemGroups = [
    { brandsOffered: '', itemsOffered: '', itemCosts: '', itemImage: null as File | null } // Initial group
  ];

  // Form fields
  supplierName = '';
  contactPerson = '';
  phone = '';
  email = '';
  address = '';
  groupChatLink = '';

  constructor(private supabaseService: SupabaseService, private authService: SupabaseAuthService) {}

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




  // Add a new group
  addItemGroup(): void {
    this.itemGroups.push({ brandsOffered: '', itemsOffered: '', itemCosts: '', itemImage: null });
  }

  // Remove a group by index
  removeItemGroup(index: number): void {
    if (this.itemGroups.length > 1) {
      this.itemGroups.splice(index, 1); // Remove the group at the specified index
    }
  }

  // Handle file input changes
  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log(`File selected for group ${index}:`, file);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        console.error(`Invalid file type for group ${index}. Only JPEG, PNG, and GIF are allowed.`);
        alert('Please select a valid image file (JPEG, PNG, or GIF).');
        return;
      }

      // Store the selected file in the corresponding item group
      this.itemGroups[index].itemImage = file;
    } else {
      console.warn(`No file selected for group ${index}`);
    }
  }

  async onSubmit(): Promise<void> {
    try {
      // Validate required fields
      if (!this.supplierName || !this.contactPerson || !this.phone || !this.email || !this.address) {
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

      // Upload images and prepare item data
      const itemsWithImages = await Promise.all(
        this.itemGroups.map(async (group, index) => {
          console.log(`Processing item group ${index}:`, group);

          const imageUrl = group.itemImage
            ? await this.supabaseService.uploadImage(group.itemImage)
            : null;

          console.log(`Image URL for group ${index}:`, imageUrl);

          return {
            brand_offered: group.brandsOffered,
            item_offered: group.itemsOffered,
            item_cost: parseFloat(group.itemCosts),
            item_image_url: imageUrl
          };
        })
      );

      console.log('Items with images:', itemsWithImages);

      // Add supplier items to the database
      await this.supabaseService.addSupplierItems(supplier.id, itemsWithImages);
      console.log('Supplier items added successfully.');

      // Clear the form
      this.supplierName = '';
      this.contactPerson = '';
      this.phone = '';
      this.email = '';
      this.address = '';
      this.groupChatLink = '';
      this.itemGroups = [{ brandsOffered: '', itemsOffered: '', itemCosts: '', itemImage: null }];

      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add supplier. Please try again.');
    }
  }
}
