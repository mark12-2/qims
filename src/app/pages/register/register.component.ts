import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { Router } from '@angular/router';
import { AuthError } from '@supabase/supabase-js'; // Import AuthError

@Component({
    imports: [FormsModule],
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: SupabaseAuthService, private router: Router) {}

  async register() {
    try {
      const { data, error }: { data: any; error: AuthError | null } = await this.authService.signUp(this.email, this.password);

      if (error) {
        // Access the 'message' property safely
        alert(`Registration failed: ${error.message}`);
      } else {
        alert('Registration successful! Please check your email.');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}