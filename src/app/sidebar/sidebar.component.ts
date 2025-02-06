import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})
export class SidebarComponent {
  isDropdownOpen = false;

  @Output() darkModeToggled = new EventEmitter<boolean>();

  constructor() {
    this.loadDarkModePreference();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
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
