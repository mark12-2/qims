
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { NgIf, NgFor} from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-borrow-table',
  standalone: true,
  imports: [ NgIf, NgFor],
  templateUrl: './borrow-table.component.html',
  styleUrl: './borrow-table.component.css'
})
export class BorrowTableComponent implements OnInit {
  pendingRequests: any[] = []; // Array to store pending borrow requests
  userEmail: string | null = null; // Current user's email address

  constructor(
    private supabaseService: SupabaseService,
    private authService: SupabaseAuthService
  ) {}


  
  ngOnInit(): void {
    this.fetchPendingRequests();
    this.loadUserEmail();
  }


  async loadUserEmail() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data?.user?.email || null;
    }
  }

  /**
   * Fetch all pending borrow requests from the database.
   */
  async fetchPendingRequests(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .from('borrow_requests')
        .select(`
          id,
          user_id,
          borrow_date,
          return_date,
          status,
          borrower_name,
          borrower_department,
          borrow_request_equipment!borrow_request_equipment_borrow_request_id_fkey (
            equipment_id,
            quantity,
            equipments!borrow_request_equipment_equipment_id_fkey (
              id,
              name
            )
          )
        `)
        .eq('status', 'pending');
  
      if (error) {
        console.error('Error fetching pending borrow requests:', error);
        throw error;
      }
  
      console.log('Raw data from Supabase:', data);
  
      this.pendingRequests = data.map((request) => ({
        ...request,
        equipment_names: request.borrow_request_equipment
          ?.map((bre: any) => bre.equipments?.name || null)
          ?.filter((name: string | null) => name !== null)
          ?.join(', ') || '',
        quantities: request.borrow_request_equipment
          ?.map((bre: any) => bre.quantity || 0)
          ?.join(', ') || ''
      }));
  
      console.log('Fetched pending requests:', this.pendingRequests);
    } catch (error) {
      console.error('Failed to load pending borrow requests:', error);
      alert('An error occurred while loading pending borrow requests. Please try again later.');
    }
  }
  
  
  


  
  /**
   * Approve a borrow request by updating its status to 'approved'.
   * @param requestId - The ID of the borrow request to approve.
   */
  async approveRequest(requestId: string): Promise<void> {
    try {
      // Approve the borrow request
      const { error: updateError } = await this.supabaseService
        .from('borrow_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
  
      if (updateError) throw updateError;
  
      // Decrement the quantity of associated equipment
      const { error: equipmentError } = await this.supabaseService.rpc('decrement_equipment_quantity', { request_id: requestId });
  
      if (equipmentError) throw equipmentError;
  
      alert('Borrow request approved successfully!');
    } catch (error) {
      console.error('Failed to approve borrow request:', error);
      alert('Failed to approve borrow request. Please try again.');
    }
  }

  /**
   * Reject a borrow request by updating its status to 'rejected'.
   * @param requestId - The ID of the borrow request to reject.
   */
  async rejectRequest(requestId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .from('borrow_requests')
        .update({ status: 'rejected', updated_at: new Date() })
        .eq('id', requestId)
        .select(); // Return the updated record

      if (error) {
        console.error('Error rejecting borrow request:', error);
        throw error;
      }

      console.log('Borrow request rejected:', data[0]);
      alert('Borrow request rejected successfully!');

      // Refresh the list of pending requests
      this.fetchPendingRequests();
    } catch (error) {
      console.error('Failed to reject borrow request:', error);
      alert('Failed to reject borrow request. Please try again.');
    }
  }
}