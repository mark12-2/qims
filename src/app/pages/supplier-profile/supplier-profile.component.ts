import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // To get route parameters and navigate
import { SupabaseService } from '../../supabase.service';
import { NgFor, NgIf } from '@angular/common'; // Import NgFor and NgIf
import { CommonModule } from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

interface Supplier {
  id: number;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  group_chat_link: string;
  user_id: string;
}

interface EquipmentItem {
  brand: string;
  model: string;
  supplier_cost: number;
  product_images: string[];
}



@Component({
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  selector: 'app-supplier-profile',
  templateUrl: './supplier-profile.component.html',
  styleUrls: ['./supplier-profile.component.css'],
})
export class SupplierProfileComponent implements OnInit {
  supplier: Supplier | null = null;
  supplierItems: EquipmentItem[] = [];
  filteredItems: EquipmentItem[] = [];
  uniqueBrands: string[] = [];
  selectedBrand: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute, // To access route parameters
    private supabaseService: SupabaseService,
    private authService: SupabaseAuthService,
    private router: Router // To navigate to other routes
  ) {}

  ngOnInit(): void {
    const supplierId = this.route.snapshot.paramMap.get('id')?.trim();
    console.log('Current URL:', window.location.href);
    console.log('Supplier ID from route:', supplierId);
  
    if (!supplierId || isNaN(Number(supplierId))) {
      console.error('Invalid supplier ID:', supplierId);
      alert('Invalid supplier ID. Please check the URL.');
      this.router.navigate(['/suppliers']);
      return;
    }
  
    this.fetchSupplierData();
  }
  


  async fetchSupplierData(): Promise<void> {
    try {
      let supplierId = this.route.snapshot.paramMap.get('id')?.trim();
      console.log('Supplier ID from route:', supplierId);
  
      if (!supplierId || isNaN(Number(supplierId))) {
        throw new Error('Invalid supplier ID');
      }
  
      const numericSupplierId = Number(supplierId);
      console.log('Fetching supplier with ID:', numericSupplierId);
  
      // Fetch supplier details using ID
      const { data: supplierData, error: supplierError } = await this.supabaseService
        .from('suppliers')
        .select('*')
        .eq('id', numericSupplierId) // Ensure ID is a number
        .maybeSingle();
  
      if (supplierError) {
        console.error('Error fetching supplier:', supplierError);
        throw supplierError;
      }
      if (!supplierData) {
        console.error(`Supplier with ID "${numericSupplierId}" not found.`);
        alert(`Supplier not found. Please check the supplier ID.`);
        this.router.navigate(['/suppliers']); // Redirect to supplier list
        return;
      }
  
      console.log('Fetched supplier data:', supplierData);
      this.supplier = supplierData;
  
      // Fetch equipment items by supplier name or ID
      const { data: itemsData, error: itemsError } = await this.supabaseService
        .from('equipments')
        .select('brand, model, supplier_cost, product_images')
        .eq('supplier', supplierData.supplier_name); // Ensure supplier is matched correctly
  
      if (itemsError) {
        console.error('Error fetching equipment items:', itemsError);
        throw itemsError;
      }
  
      console.log('Fetched equipment items:', itemsData);
  
      // Store equipment items
      this.supplierItems = itemsData;
  
      // Create a unique list of brands
      this.uniqueBrands = [...new Set(itemsData.map((item) => item.brand))].filter(Boolean);
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
      this.filteredItems = this.supplierItems.filter((item) => item.brand === brand);
    } else {
      // Show all items if no brand is selected
      this.filteredItems = this.supplierItems;
    }
  }
}