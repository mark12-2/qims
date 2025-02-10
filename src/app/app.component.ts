import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Add RouterOutlet here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'qims';
  isDarkMode = false;

  ngOnInit(): void {
    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode !== null) {
      this.isDarkMode = JSON.parse(savedMode);
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
  }

  toggleDarkMode(isDarkMode: boolean): void {
    this.isDarkMode = isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    // Save dark mode preference to localStorage
    localStorage.setItem('isDarkMode', JSON.stringify(this.isDarkMode));
  }
}