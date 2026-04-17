import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Add this import
// import { NavbarComponent } from '../navbar-component/navbar-component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Add FormsModule here
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {
  notifications = {
    email: true,
    sms: false,
    push: true
  };
  
  preferences = {
    language: 'english',
    theme: 'light',
    timezone: 'Asia/Dhaka'
  };
  
  saveSettings() {
    // Save settings to localStorage or backend
    localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
    localStorage.setItem('notification_settings', JSON.stringify(this.notifications));
    alert('Settings saved successfully!');
  }
  
  resetSettings() {
    this.notifications = {
      email: true,
      sms: false,
      push: true
    };
    this.preferences = {
      language: 'english',
      theme: 'light',
      timezone: 'Asia/Dhaka'
    };
    alert('Settings reset to default!');
  }
}