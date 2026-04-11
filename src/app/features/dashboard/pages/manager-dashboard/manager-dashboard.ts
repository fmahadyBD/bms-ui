// manager-dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { StudentService } from '../../services/student';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboardComponent implements OnInit {
  // User data from localStorage
  userEmail: string = '';
  userName: string = '';
  
  // UI State
  showProfileDropdown = false;
  loading = false;
  
  // Students data
  students: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadAllStudents();
  }

  loadUserData() {
    // Load from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userEmail = user.email || '';
        this.userName = user.name || user.email?.split('@')[0] || 'Manager';
      } catch (e) {
        this.userEmail = localStorage.getItem('email') || '';
        this.userName = this.userEmail?.split('@')[0] || 'Manager';
      }
    } else {
      this.userEmail = localStorage.getItem('email') || 'manager@example.com';
      this.userName = this.userEmail?.split('@')[0] || 'Manager';
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    setTimeout(() => {
      this.showProfileDropdown = false;
    }, 200);
  }

  loadAllStudents() {
    this.loading = true;
    this.ngZone.run(() => {
      this.studentService.getAllStudents(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.students = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.loading = false;
          this.cdr.detectChanges();
          alert('Failed to load students: ' + (error.error?.message || error.message));
        }
      });
    });
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadAllStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAllStudents();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAllStudents();
    }
  }

  getPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          // Clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('email');
          localStorage.removeItem('token');
          // Navigation handled in AuthService
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Force logout anyway
          localStorage.clear();
          window.location.href = '/login';
        }
      });
    }
  }
}