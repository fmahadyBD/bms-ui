import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @ViewChild('dropdown') dropdownElement!: ElementRef;
  
  isProfileDropdownOpen = false;
  studentName: string = '';
  studentEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudentInfo();
    console.log('Navbar initialized'); // Debug log
  }

  loadStudentInfo() {
    this.studentName = localStorage.getItem('user_name') || 'Student';
    this.studentEmail = localStorage.getItem('user_email') || '';
    console.log('Student info loaded:', this.studentName, this.studentEmail); // Debug log
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    console.log('Dropdown toggled:', this.isProfileDropdownOpen); // Debug log
  }

  closeDropdown() {
    this.isProfileDropdownOpen = false;
    console.log('Dropdown closed'); // Debug log
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.dropdownElement && !this.dropdownElement.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  logout() {
    console.log('Logout clicked'); // Debug log
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
        this.closeDropdown();
      },
      error: (error) => {
        console.error('Logout error:', error);
        localStorage.clear();
        this.router.navigate(['/login']);
        this.closeDropdown();
      }
    });
  }

  navigateTo(route: string) {
    console.log('Navigating to:', route); // Debug log
    this.router.navigate([`/student-dashboard/${route}`]);
    this.closeDropdown();
  }
}