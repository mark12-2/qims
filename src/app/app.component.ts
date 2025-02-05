import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupplierProfileComponent } from './supplier-profile/supplier-profile.component'; // Import the standalone component


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ SupplierProfileComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'qims';
}
