import { Component } from '@angular/core';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
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
