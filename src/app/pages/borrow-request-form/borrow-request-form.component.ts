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
      this.equipmentList = rawEquipmentList.map((item: any) => ({
        ...item,
        quantity: 0, // Default quantity is 0
        selected: false // Default selection state
      }));
      this.loadUserEmail();
    } catch (error) {
      console.error('Failed to load available equipment:', error);
      alert('Failed to load available equipment. Please try again.');
    }
  }


  get displayedItems() {
    return this.equipmentList; // Always display all items
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


  // Validate the quantity for an equipment item
  validateQuantity(item: any): void {
    const maxQuantity = item.quantity_available || 0; // Available stock in the database
    if (!item.quantity || isNaN(item.quantity) || item.quantity < 1) {
      alert('⚠ Invalid quantity. Setting to 1.');
      item.quantity = 1;
    } else if (item.quantity > maxQuantity) {
      alert(`⚠ Quantity cannot exceed available stock (${maxQuantity}).`);
      item.quantity = maxQuantity;
    }
  }

  async submitBorrowRequest(): Promise<void> {
    try {
      const userId = (await this.supabaseService.getCurrentUser()).id;

      // Insert into borrow_requests
      const requestData = {
        user_id: userId,
        borrower_name: this.borrowerName,
        borrower_department: this.borrowerDepartment,
        borrow_date: this.borrowDate,
        return_date: this.returnDate,
        purpose: this.purpose,
        status: 'pending'
      };

      const borrowRequestData = await this.supabaseService.createBorrowRequest(requestData);
      const borrowRequestId = borrowRequestData.id;

      // Prepare equipment data
      const equipmentInsertData = this.equipmentList
        .filter((item) => item.selected && item.quantity > 0)
        .map((item) => ({
          borrow_request_id: borrowRequestId,
          equipment_id: item.id,
          quantity: item.quantity
        }));

      // Insert into borrow_request_equipment
      await this.supabaseService.insertBorrowRequestEquipment(equipmentInsertData);

      // Decrement the equipment quantity in the database
      await this.supabaseService.decrementEquipmentQuantity(borrowRequestId);

      alert('Borrow request submitted successfully!');
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      alert('Failed to submit borrow request. Please try again.');
    }
  }

  increaseQuantity(item: any): void {
    item.quantity++;
    this.validateQuantity(item); // Validate after increasing
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.validateQuantity(item); // Validate after decreasing
    }
  }

  viewDetails(item: any) {
    console.log('Viewing details for:', item);
    // Implement the logic to view the details of the selected item
  }
}