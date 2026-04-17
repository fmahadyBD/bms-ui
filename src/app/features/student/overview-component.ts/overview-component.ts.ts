import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../student';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-component.html',
  styleUrls: ['./overview-component.css']
})
export class OverviewComponent implements OnInit {
  studentData: any = null;
  routines: any[] = [];
  loading = false;
  recentActivities: any[] = [];

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudentData();
    this.loadRecentActivities();
  }

  loadStudentData() {
    this.loading = true;
    const studentId = localStorage.getItem('student_id');
    const userEmail = localStorage.getItem('user_email');
    
    if (studentId) {
      this.studentService.getStudentById(studentId).subscribe({
        next: (student) => {
          this.studentData = student;
          this.loading = false;
          this.loadRoutines();
        },
        error: (error) => {
          console.error('Error loading student data:', error);
          this.loading = false;
        }
      });
    } else if (userEmail) {
      this.studentService.searchByEmail(userEmail).subscribe({
        next: (student) => {
          this.studentData = student;
          this.loading = false;
          this.loadRoutines();
        },
        error: (error) => {
          console.error('Error loading student data:', error);
          this.loading = false;
        }
      });
    }
  }

  loadRoutines() {
    if (!this.studentData?.studentId) return;
    
    this.studentService.getStudentRoutines(this.studentData.studentId).subscribe({
      next: (data) => {
        this.routines = data || [];
      },
      error: (error) => {
        console.error('Error loading routines:', error);
        this.routines = [];
      }
    });
  }

  loadRecentActivities() {
    this.recentActivities = [
      { date: '2024-01-15', action: 'Submitted bus request', status: 'Pending' },
      { date: '2024-01-10', action: 'Completed survey', status: 'Completed' },
      { date: '2024-01-05', action: 'Updated profile', status: 'Completed' }
    ];
  }

  refreshRoutines() {
    this.loadRoutines();
  }

  getStatistics() {
    return {
      totalRequests: 5,
      activeRequests: 2,
      completedSurveys: 3,
      routeAssigned: this.studentData?.routeName || 'Not assigned'
    };
  }
}