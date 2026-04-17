import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { StudentService } from '../student';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent implements OnInit {
  studentData: any = null;

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStudentData();
  }

  loadStudentData() {
    const userEmail = localStorage.getItem('user_email');
    
    if (!userEmail) {
      console.error('No user email found');
      this.redirectToLogin();
      return;
    }
    
    this.studentService.searchByEmail(userEmail).subscribe({
      next: (student) => {
        this.studentData = student;
        // Store student data in a service or localStorage for child components to access
        localStorage.setItem('student_id', student.studentId);
        localStorage.setItem('student_name', student.name);
      },
      error: (error) => {
        console.error('Error loading student data:', error);
        if (error.status === 401 || error.status === 403) {
          this.redirectToLogin();
        }
      }
    });
  }

  redirectToLogin() {
    this.authService.logout().subscribe();
  }

  logout() {
    this.authService.logout().subscribe();
  }
}