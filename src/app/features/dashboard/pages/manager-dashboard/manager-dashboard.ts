// manager-dashboard.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // ← ADD THIS
import { NavbarComponent } from '../../components/navbar-component/navbar-component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,      // ← ADD THIS
    NavbarComponent
  ],
  templateUrl: './manager-dashboard.html',
})
export class ManagerDashboardComponent {}