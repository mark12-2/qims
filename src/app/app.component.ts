import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseAuthService } from './services/supabase-auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private authService: SupabaseAuthService) {}

  async ngOnInit() {
    console.log('🔄 Checking session...');
    await this.authService.restoreSession(); // 🔹 Ensure session is restored on page load
  }
}
