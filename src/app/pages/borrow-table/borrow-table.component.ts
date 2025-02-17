import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { NgIf, NgFor } from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-borrow-table',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './borrow-table.component.html',
  styleUrl: './borrow-table.component.css'
})
export class BorrowTableComponent implements OnInit {
  borrowRequests: any[] = []; // Array to store all borrow requests
  userEmail: string | null = null; // Current user's email address

  constructor(
    private supabaseService: SupabaseService,
    private authService: SupabaseAuthService
  ) {}

  ngOnInit(): void {
    this.fetchBorrowRequests();
    this.loadUserEmail();
  }

  async loadUserEmail() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data?.user?.email || null;
    }
  }

  async fetchBorrowRequests(): Promise<void> {
    try {
      // Step 1: Fetch all borrow requests (no filtering by status)
      const { data: requests, error: requestsError } = await this.supabaseService
        .from('borrow_requests')
        .select(`id, user_id, borrow_date, return_date, borrower_name, borrower_department, purpose`);

      // Step 2: Check for errors in fetching borrow requests
      if (requestsError) {
        console.error('Error fetching borrow requests:', requestsError);
        throw requestsError;
      }

      console.log('Raw Borrow Requests Data:', JSON.stringify(requests, null, 2));

      // Step 3: Process each request to fetch related equipment data
      const processedRequests = await Promise.all(
        requests.map(async (request) => {
          // Fetch related equipment for the current request
          const { data: equipmentData, error: equipmentError } = await this.supabaseService
            .from('borrow_request_equipment')
            .select(`
              equipment_id,
              quantity,
              equipments!borrow_request_equipment_equipment_id_fkey (
                name
              )
            `)
            .eq('borrow_request_id', request.id);

          // Log the raw equipment data for debugging
          console.log(`Raw Equipment Data for Request ID ${request.id}:`, JSON.stringify(equipmentData, null, 2));

          // Handle errors in fetching equipment data
          if (equipmentError) {
            console.error('Error fetching equipment data for request ID:', request.id, equipmentError);
            return {
              ...request,
              equipment_names: 'No equipment',
              quantities: 'N/A'
            };
          }

          // Extract equipment names and quantities
          const equipmentNames = equipmentData
            .map((bre: any) => bre.equipments?.name || 'Unknown Equipment')
            .join(', ') || 'No equipment';

          const quantities = equipmentData
            .map((bre: any) => bre.quantity || 0)
            .join(', ') || 'N/A';

          // Return the processed request with equipment details
          return {
            ...request,
            equipment_names: equipmentNames,
            quantities: quantities
          };
        })
      );

      // Step 4: Log and store the final processed requests
      console.log('Final Processed Requests:', JSON.stringify(processedRequests, null, 2));
      this.borrowRequests = processedRequests;
    } catch (error) {
      console.error('Failed to load borrow requests:', error);
      alert('An error occurred while loading borrow requests. Please try again later.');
    }
  }
}