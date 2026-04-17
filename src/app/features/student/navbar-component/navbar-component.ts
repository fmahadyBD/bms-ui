import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isProfileDropdownOpen = false;
  studentName: string = '';
  studentEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudentInfo();
  }

  loadStudentInfo() {
    this.studentName = localStorage.getItem('user_name') || 'Student';
    this.studentEmail = localStorage.getItem('user_email') || '';
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown() {
    setTimeout(() => {
      this.isProfileDropdownOpen = false;
    }, 200);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  navigateTo(route: string) {
    // Fix: Use student-dashboard instead of student
    this.router.navigate([`/student-dashboard/${route}`]);
    this.closeProfileDropdown();
  }
}