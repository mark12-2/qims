import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgFor],
  selector: 'app-borrow-history',
  templateUrl: './borrow-history.component.html',
  styleUrls: ['./borrow-history.component.css']
})
export class BorrowHistoryComponent implements OnInit {
  borrowHistory: any[] = []; // Array to store borrow history data

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Fetch borrow history data from Supabase
      this.borrowHistory = await this.supabaseService.getBorrowHistory();
      console.log('Fetched borrow history:', this.borrowHistory);
    } catch (error) {
      console.error('Error fetching borrow history:', error);
      alert('Failed to load borrow history. Please try again.');
    }
  }
}