import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  userEmail: string | null = null;

  constructor(private authService: SupabaseAuthService) {}

  ngOnInit() {
    this.loadUserEmail();
  }

  async loadUserEmail() {
    if (await this.authService.isLoggedIn()) {
      const { data } = await this.authService.getUser();
      this.userEmail = data.user?.email || null;
    }
  }
}
