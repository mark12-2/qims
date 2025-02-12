import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  private supabase = createClient('https://uqeuskaicawwgyknrbfi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxZXVza2FpY2F3d2d5a25yYmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxOTk0NzksImV4cCI6MjA1Mzc3NTQ3OX0.ghXQrzjmj7cQZaeIijE5pfdIhVk88pj1fZPtz-CfMq0');

  constructor(private authService: SupabaseAuthService, private router: Router) {}

  async login() {
    try {
      const { data, error } = await this.authService.signIn(this.email, this.password);

      if (error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert('Login successful!');
        
        const id = data.user.id; // Extract user ID

        // Fetch user type from the 'users' table
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('usertype')
          .eq('id', id)
          .single();

        if (userError) {
          alert(`Error fetching user type: ${userError.message}`);
        } else {
          const userType = userData.usertype;

          if (userType === 'admin') {
            this.router.navigate(['/dashboard']);
          } else if (userType === 'user') {
            this.router.navigate(['/equipment-list']);
          } else {
            alert('Unknown user type.');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
