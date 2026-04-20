import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { ChangePasswordComponent } from '../change-password/change-password';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordComponent],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.css']
})
export class NavbarComponent implements OnInit {
  showProfileDropdown = false;
  mobileMenuOpen = false;
  showChangePasswordModal = false;

  userEmail: string = '';
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userEmail = user.email || '';
        this.userName = user.name || user.email?.split('@')[0] || 'User';
      } catch (e) {
        this.userEmail = localStorage.getItem('email') || '';
        this.userName = this.userEmail?.split('@')[0] || 'User';
      }
    } else {
      this.userEmail = localStorage.getItem('email') || 'user@example.com';
      this.userName = this.userEmail?.split('@')[0] || 'User';
    }
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const profileSection = document.querySelector('.profile-section');
    if (profileSection && !profileSection.contains(event.target as Node)) {
      this.showProfileDropdown = false;
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/manager-dashboard']);
    this.mobileMenuOpen = false;
  }

  navigateToStudents() {
    this.router.navigate(['/manager-dashboard/students']);
    this.mobileMenuOpen = false;
  }

  navigateToBuses() {
    this.router.navigate(['/manager-dashboard/buses']);
    this.mobileMenuOpen = false;
  }

  navigateToRoutes() {
    this.router.navigate(['/manager-dashboard/routes']);
    this.mobileMenuOpen = false;
  }

  navigateToBusSlots() {
    this.router.navigate(['/manager-dashboard/bus-slots']);
    this.mobileMenuOpen = false;
  }

  navigateToSurveys() {
    this.router.navigate(['/manager-dashboard/surveys']);
    this.mobileMenuOpen = false;
  }

  navigateToRequest() {
    this.router.navigate(['/manager-dashboard/bus-requests']);
    this.mobileMenuOpen = false;
  }

  navigateToProfile(event?: Event) {
    event?.stopPropagation();
    this.showProfileDropdown = false;
    this.router.navigate(['/manager-dashboard/profile']);
    this.mobileMenuOpen = false;
  }

  openChangePassword(event?: Event) {
    event?.stopPropagation();
    this.showChangePasswordModal = true;
    this.showProfileDropdown = false;
    this.mobileMenuOpen = false;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  logout(event?: Event) {
    event?.stopPropagation();
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: () => {
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      });
    }
  }
}