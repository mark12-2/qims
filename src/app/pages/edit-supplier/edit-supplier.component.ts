import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SupabaseService } from '../../supabase.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor, NgIf], // Add FormsModule here
})
export class EditSupplierComponent implements OnInit {
  supplierId: number = 0;
  supplierData: any = {
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  };
  itemGroups: any[] = []; // Array to hold supplier items

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    // Get the supplier ID from the route parameters
    this.supplierId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.fetchSupplierDetails();
    this.fetchSupplierItems();
  }

  // Fetch supplier details by ID
  async fetchSupplierDetails(): Promise<void> {
    try {
      const supplier = await this.supabaseService.getSupplierById(this.supplierId);
      this.supplierData = supplier;
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      alert('Failed to load supplier data. Please try again.');
    }
  }

  // Fetch supplier items by ID
  async fetchSupplierItems(): Promise<void> {
    try {
      const items = await this.supabaseService.getSupplierItems(this.supplierId);
      this.itemGroups = items.map(item => ({
        id: item.id, // Store item ID for updating
        brandsOffered: item.brand_offered,
        itemsOffered: item.item_offered,
        itemCosts: item.item_cost,
        itemImage: null, // Initialize as null for editing
        item_image_url: item.item_image_url,
      }));
  
      console.log('Fetched items:', this.itemGroups); // Debugging
    } catch (error) {
      console.error('Error fetching supplier items:', error);
      alert('Failed to load supplier items. Please try again.');
    }
  }
  
  
  
  

  // Handle file selection for an item group
  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.itemGroups[index].itemImage = input.files[0];
    }
  }

  // Add a new item group
  addItemGroup(): void {
    this.itemGroups.push({
      brandsOffered: '',
      itemsOffered: '',
      itemCosts: '',
      itemImage: null,
      item_image_url: null,
    });
  }

  // Remove an item group
  removeItemGroup(index: number): void {
    this.itemGroups.splice(index, 1);
  }

  async updateSupplier(): Promise<void> {
    try {
      console.log('Updating supplier:', this.supplierData);
  
      // Update supplier details
      await this.supabaseService.updateSupplier(this.supplierId, this.supplierData);
  
      // Fetch existing supplier items
      const existingItems = await this.supabaseService.getSupplierItems(this.supplierId);
      const existingItemIds = existingItems.map(item => item.id);
  
      // Track items to update, add, or delete
      const updatedItems = [];
      const newItems = [];
      const itemsToDelete = [...existingItemIds];
  
      console.log('Existing items in DB:', existingItems);
  
      for (const group of this.itemGroups) {
        let imageUrl = group.item_image_url;
  
        // Upload new image if a file is selected
        if (group.itemImage) {
          imageUrl = await this.supabaseService.uploadImage(group.itemImage);
        }
  
        if (group.id) {
          // Existing item (update it)
          updatedItems.push({
            id: group.id,
            supplier_id: this.supplierId,
            brand_offered: group.brandsOffered,
            item_offered: group.itemsOffered,
            item_cost: parseFloat(group.itemCosts), // Ensure numeric value
            item_image_url: imageUrl,
          });
  
          // Remove from delete list since it's being updated
          const index = itemsToDelete.indexOf(group.id);
          if (index !== -1) {
            itemsToDelete.splice(index, 1);
          }
        } else {
          // New item (insert it)
          newItems.push({
            supplier_id: this.supplierId,
            brand_offered: group.brandsOffered,
            item_offered: group.itemsOffered,
            item_cost: parseFloat(group.itemCosts), // Ensure numeric value
            item_image_url: imageUrl,
          });
        }
      }
  
      console.log('Items to update:', updatedItems);
      console.log('New items to add:', newItems);
      console.log('Items to delete:', itemsToDelete);
  
      // Perform batch updates for existing items
      for (const item of updatedItems) {
        try {
          await this.supabaseService.updateSupplierItems(item.id, item);
        } catch (error) {
          console.error(`Failed to update item ID ${item.id}:`, error);
        }
      }
  
      // Insert new items if any
      if (newItems.length > 0) {
        try {
          await this.supabaseService.addSupplierItems(this.supplierId, newItems);
        } catch (error) {
          console.error('Failed to add new items:', error);
        }
      }
  
      // Delete removed items
      for (const itemId of itemsToDelete) {
        try {
          await this.supabaseService.deleteSupplierItem(itemId);
        } catch (error) {
          console.error(`Failed to delete item ID ${itemId}:`, error);
        }
      }
  
      alert('Supplier updated successfully!');
      this.router.navigate(['/suppliers']); // Redirect to the supplier list
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Failed to update supplier. Please try again.');
    }
  }
    
  
}