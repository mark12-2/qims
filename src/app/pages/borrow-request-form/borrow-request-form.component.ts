import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './borrow-request-form.component.html',
  styleUrls: ['./borrow-request-form.component.css']
})
export class BorrowRequestComponent {
  equipmentList: any[] = []; // Array to store available equipment
  borrowDate: string = '';
  returnDate: string = '';
  purpose: string = '';
  selectedEquipmentIds: string[] = []; // Array to store selected equipment IDs
  userEmail: string | null = null;

  // New properties for borrower details
  borrowerName: string = '';
  borrowerDepartment: string = '';

  showAllItems = false;

  constructor(
    private supabaseService: SupabaseService,
    private authService: SupabaseAuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Fetch available equipment from Supabase
      const rawEquipmentList = await this.supabaseService.getAvailableEquipment();
      console.log('Fetched equipment list:', rawEquipmentList);
  
      // Initialize the equipment list with a default quantity of 0
      this.equipmentList = rawEquipmentList.map((item: any) => ({
        ...item,
        quantity: 0, // Default quantity is 0
        selected: false // Default selection state
      }));
  
      console.log('Initialized equipment list:', this.equipmentList);
      this.loadUserEmail();
    } catch (error) {
      console.error('Failed to load available equipment:', error);
      alert('Failed to load available equipment. Please try again.');
    }
  }


  get displayedItems() {
    return this.showAllItems ? this.equipmentList : this.equipmentList.slice(0, 6);
  }

  async loadUserEmail() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data.user?.email || null;
    }
  }

  // Update the selected equipment IDs when a checkbox is toggled
  updateSelectedEquipment(item: any): void {
    if (item.selected) {
      this.selectedEquipmentIds.push(item.id);
    } else {
      this.selectedEquipmentIds = this.selectedEquipmentIds.filter(
        (id) => id !== item.id
      );
    }
    console.log('Selected equipment IDs:', this.selectedEquipmentIds);
  }

  async submitBorrowRequest(): Promise<void> {
    try {
      const userId = (await this.supabaseService.getCurrentUser()).id; // Get current user's ID
  
      // Insert into borrow_requests
      const { data: borrowRequestData, error: borrowRequestError } =
        await this.supabaseService
          .from('borrow_requests')
          .insert([
            {
              user_id: userId,
              borrower_name: this.borrowerName,
              borrower_department: this.borrowerDepartment,
              borrow_date: this.borrowDate,
              return_date: this.returnDate,
              purpose: this.purpose,
              status: 'pending'
            }
          ])
          .select();
  
      if (borrowRequestError) throw borrowRequestError;
  
      const borrowRequestId = borrowRequestData[0].id;
  
      // Insert into borrow_request_equipment with quantity
      const equipmentInsertData = this.equipmentList
        .filter((item) => item.selected && item.quantity > 0)
        .map((item) => ({
          borrow_request_id: borrowRequestId,
          equipment_id: item.id,
          quantity: item.quantity // Include the quantity here
        }));
  
      // Use the new method from supabase.service.ts
      await this.supabaseService.insertBorrowRequestEquipment(equipmentInsertData);
  
      alert('Borrow request submitted successfully!');
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      alert('Failed to submit borrow request. Please try again.');
    }
  }

  increaseQuantity(item: any): void {
    item.quantity++;
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  viewDetails(item: any) {
    console.log('Viewing details for:', item);
    // Implement the logic to view the details of the selected item
  }
}