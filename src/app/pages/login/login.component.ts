import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: SupabaseAuthService, private router: Router) {}

  async login() {
    try {
      const { data, error } = await this.authService.signIn(this.email, this.password);
      if (error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert('Login successful!');
        this.router.navigate(['/dashboard']);  // Example route for successful login
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
