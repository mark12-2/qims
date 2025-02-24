
import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { SupabaseService } from '../../services/supabase.service'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})
export class SidebarComponent {
  userEmail: string | null = null;
  isDropdownOpen = false;
  pendingRequestCount = 0;

  @Output() darkModeToggled = new EventEmitter<boolean>();

  constructor(private authService: SupabaseAuthService, private supabaseService: SupabaseService) {
    this.loadDarkModePreference();
  }

  async ngOnInit() {
  this.loadUserEmail();
  await this.fetchPendingRequests(); // ✅ Fix: Awaiting inside an async function
}




  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async loadUserEmail() {
    try {
      const user = await this.authService.getUser(); // ✅ Directly get the user object

      if (!user) {
        console.warn('⚠ No user found. Hiding sidebar options...');
        this.userEmail = null;
        return;
      }

      this.userEmail = user.email || null; // ✅ Directly access 'email'
      console.log('✅ Sidebar user loaded:', this.userEmail);
    } catch (err) {
      console.error('❌ Error loading sidebar user:', err);
    }
  }

  toggleDarkMode(event: any): void {
    const isDarkMode = event.target.checked;
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('dark-mode', 'enabled');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('dark-mode', 'disabled');
    }
    this.darkModeToggled.emit(isDarkMode);
  }

  private loadDarkModePreference(): void {
    const darkModeEnabled = localStorage.getItem('dark-mode') === 'enabled';
    if (darkModeEnabled) {
      document.body.classList.add('dark-mode');
    }
  }

  async fetchPendingRequests() {
    try {
      this.pendingRequestCount = await this.supabaseService.getPendingRequestsCount();
    } catch (error) {
      console.error('❌ Error fetching pending requests:', error);
    }
  }

}
