import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // To get route parameters
import { SupabaseService } from '../../supabase.service';
import { NgFor, NgIf } from '@angular/common'; // Import NgFor and NgIf
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  selector: 'app-supplier-profile',
  templateUrl: './supplier-profile.component.html',
  styleUrls: ['./supplier-profile.component.css'],
})
export class SupplierProfileComponent implements OnInit {
  supplier: any = null; // To store supplier details
  supplierItems: any[] = []; // To store all supplier items
  filteredItems: any[] = []; // To store filtered items based on selected brand
  selectedBrand: string | null = null; // To track the selected brand
  uniqueBrands: string[] = []; // To store unique brand names

  constructor(
    private route: ActivatedRoute, // To access route parameters
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.fetchSupplierData();
  }

  async fetchSupplierData(): Promise<void> {
    try {
      // Get the supplier ID from the route parameter
      const supplierId = this.route.snapshot.paramMap.get('id');
      if (!supplierId) {
        throw new Error('Supplier ID is missing');
      }
      console.log('Fetching supplier with ID:', supplierId);

      // Fetch supplier details
      const { data: supplierData, error: supplierError } = await this.supabaseService
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();
      if (supplierError) {
        throw supplierError;
      }
      console.log('Fetched supplier data:', supplierData);
      this.supplier = supplierData;

      // Fetch supplier items
      const { data: itemsData, error: itemsError } = await this.supabaseService
        .from('supplier_items')
        .select('*')
        .eq('supplier_id', supplierId);
      if (itemsError) {
        throw itemsError;
      }
      console.log('Fetched supplier items:', itemsData);

      // Store supplier items
      this.supplierItems = itemsData;

      // Create a unique list of brands
      this.uniqueBrands = [...new Set(itemsData.map(item => item.brand_offered))].filter(Boolean); // Remove duplicates and null values
      console.log('Unique brands:', this.uniqueBrands);

      // Initially show all items
      this.filteredItems = itemsData;
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      alert('Failed to load supplier profile. Please try again.');
    }
  }

  // Method to handle brand selection
  selectBrand(brand: string): void {
    this.selectedBrand = brand;
    if (brand) {
      // Filter items by the selected brand
      this.filteredItems = this.supplierItems.filter((item) => item.brand_offered === brand);
    } else {
      // Show all items if no brand is selected
      this.filteredItems = this.supplierItems;
    }
  }
}