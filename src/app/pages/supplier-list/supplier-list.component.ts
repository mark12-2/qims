import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { NgFor, } from '@angular/common'; // Import NgFor and NgIf
import { RouterModule } from '@angular/router'; // Import RouterModule
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
    imports: [ NgFor, RouterModule], // Add NgIf to the imports array
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.css'
})
export class SupplierListComponent implements OnInit {
  suppliers: any[] = [];

  constructor(private supabaseService: SupabaseService, private authService: SupabaseAuthService) {}


  async ngOnInit(): Promise<void> {
    await this.authService.restoreSession(); // Ensure session is restored first

    const user = await this.authService.getUser();
    if (!user) {
      console.error('❌ User session is missing after navigation.');
      alert('Session expired. Please log in again.');
      return;
    }

    console.log('✅ User session exists:', user);
    await this.fetchSuppliers();
  }




  // Fetch supplier list from Supabase
  async fetchSuppliers(): Promise<void> {
    try {
      this.suppliers = await this.supabaseService.getSuppliers();
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Failed to load supplier list. Please try again.');
    }
  }

  // Delete a supplier by ID
  async deleteSupplier(id: number, event: Event): Promise<void> {
    event.preventDefault(); // Prevent default link behavior

    if (!confirm('Are you sure you want to delete this supplier?')) {
      return; // Exit if the user cancels the confirmation dialog
    }

    try {
      console.log(`🔍 Attempting to delete supplier with ID: ${id}`);

      // Call the Supabase service to delete the supplier and its items
      await this.supabaseService.deleteSupplier(id);

      alert('Supplier deleted successfully!');
      this.fetchSuppliers(); // Refresh the supplier list
    } catch (error) {
      console.error(`❌ Error deleting supplier ID ${id}:`, error);
      alert('Failed to delete supplier. Please try again.');
    }
  }
}
