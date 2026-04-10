import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student';
import { AuthService } from '../../../auth/services/auth';
import { ChangePasswordComponent } from '../../components/change-password/change-password';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  studentData: any = null;
  routines: any[] = [];
  loading = false;
  activeTab = 'profile';

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStudentData();
    this.loadRoutines();
  }

  loadStudentData() {
    this.loading = true;
    const studentId = localStorage.getItem('studentId') || 'CSE-2021-001';
    this.studentService.getStudentById(studentId).subscribe({
      next: (data) => {
        this.studentData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student data:', error);
        this.loading = false;
      }
    });
  }

  loadRoutines() {
    const studentId = localStorage.getItem('studentId') || 'CSE-2021-001';
    this.studentService.getStudentRoutines(studentId).subscribe({
      next: (data) => {
        this.routines = data;
      },
      error: (error) => {
        console.error('Error loading routines:', error);
      }
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout().subscribe();
  }
}