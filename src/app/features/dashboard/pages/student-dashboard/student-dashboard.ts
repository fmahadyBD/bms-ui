import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student';
import { AuthService } from '../../../auth/services/auth';
import { ChangePasswordComponent } from '../../components/change-password/change-password';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, ChangePasswordComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent implements OnInit {
  studentData: any = null;
  routines: any[] = [];
  loading = false;
  activeTab = 'profile';
  private studentId: string = '';

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStudentData();
  }

  loadStudentData() {
    this.loading = true;
    const userEmail = localStorage.getItem('user_email');
    
    if (!userEmail) {
      console.error('No user email found');
      this.loading = false;
      this.redirectToLogin();
      return;
    }
    
    // Get student by email first
    this.studentService.searchByEmail(userEmail).subscribe({
      next: (student) => {
        this.studentData = student;
        this.studentId = student.studentId;
        this.loading = false;
        // After getting student data, load routines
        this.loadRoutines();
      },
      error: (error) => {
        console.error('Error loading student data:', error);
        this.loading = false;
        if (error.status === 401 || error.status === 403) {
          this.redirectToLogin();
        } else {
          alert('Failed to load student data. Please try again.');
        }
      }
    });
  }

  loadRoutines() {
    if (!this.studentId) return;
    
    this.studentService.getStudentRoutines(this.studentId).subscribe({
      next: (data) => {
        this.routines = data || [];
      },
      error: (error) => {
        console.error('Error loading routines:', error);
        this.routines = [];
      }
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  refreshData() {
    this.loadStudentData();
  }

  redirectToLogin() {
    this.authService.logout().subscribe();
  }

  logout() {
    this.authService.logout().subscribe();
  }
}