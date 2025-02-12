import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-sidebar',
  imports: [ CommonModule ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  userEmail: string | null = null;
  isDropdownOpen = false;

  @Output() darkModeToggled = new EventEmitter<boolean>();

  constructor(private authService: SupabaseAuthService, private supabaseService: SupabaseService) {
    this.loadDarkModePreference();
  }

  ngOnInit() {
    this.loadUserEmail();
  }


  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  async loadUserEmail() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data.user?.email || null;
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
}
