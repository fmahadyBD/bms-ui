import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { ChangePasswordComponent } from '../change-password/change-password'; // Add this import

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordComponent], // Add ChangePasswordComponent here
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.css']
})
export class NavbarComponent implements OnInit {
  showStudentsDropdown = false;
  showRoutesDropdown = false;
  showComponentsDropdown = false;
  showProfileDropdown = false;
  mobileMenuOpen = false;
  showChangePasswordModal = false;
  
  userEmail: string = '';
  userName: string = '';

  constructor(
    private authService: AuthService,
    public router: Router
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

  toggleStudentsDropdown(event: Event) {
    event.stopPropagation();
    this.showStudentsDropdown = !this.showStudentsDropdown;
    this.showRoutesDropdown = false;
    this.showComponentsDropdown = false;
    this.showProfileDropdown = false;
  }

  toggleRoutesDropdown(event: Event) {
    event.stopPropagation();
    this.showRoutesDropdown = !this.showRoutesDropdown;
    this.showStudentsDropdown = false;
    this.showComponentsDropdown = false;
    this.showProfileDropdown = false;
  }

  toggleComponentsDropdown(event: Event) {
    event.stopPropagation();
    this.showComponentsDropdown = !this.showComponentsDropdown;
    this.showStudentsDropdown = false;
    this.showRoutesDropdown = false;
    this.showProfileDropdown = false;
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showStudentsDropdown = false;
    this.showRoutesDropdown = false;
    this.showComponentsDropdown = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns() {
    this.showStudentsDropdown = false;
    this.showRoutesDropdown = false;
    this.showComponentsDropdown = false;
    this.showProfileDropdown = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeAllDropdowns();
  }

  navigateToStudents() {
    this.router.navigate(['/manager/students']);
    this.closeAllDropdowns();
    this.mobileMenuOpen = false;
  }

  navigateToAddStudent() {
    this.router.navigate(['/manager/students/add']);
    this.closeAllDropdowns();
    this.mobileMenuOpen = false;
  }

  navigateToRoutes() {
    this.router.navigate(['/manager/routes']);
    this.closeAllDropdowns();
    this.mobileMenuOpen = false;
  }

  navigateToAddRoute() {
    this.router.navigate(['/manager/routes/add']);
    this.closeAllDropdowns();
    this.mobileMenuOpen = false;
  }

  openChangePassword() {
    this.showChangePasswordModal = true;
    this.closeAllDropdowns();
    this.mobileMenuOpen = false;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  logout() {
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