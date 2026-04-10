import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student';
import { RouteService } from '../../services/route';
import { RoutineService } from '../../services/routine';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboardComponent implements OnInit {
  activeTab = 'students';

  // Student related
  students: any[] = [];
  selectedStudent: any = null;
  loading = false;

  // Route related
  routes: any[] = [];
  routeForm: FormGroup;
  selectedRoute: any = null;

  // Routine related
  routineForm: FormGroup;
  routines: any[] = [];

  // Search
  searchEmail = '';
  searchPhone = '';
  searchResult: any = null;

  constructor(
    private studentService: StudentService,
    private routeService: RouteService,
    private routineService: RoutineService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.routeForm = this.createRouteForm();
    this.routineForm = this.createRoutineForm();
  }

  ngOnInit() {
    this.loadStudents();
    this.loadRoutes();
  }

  // ============ TAB MANAGEMENT ============
  changeTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'students') this.loadStudents();
    if (tab === 'routes') this.loadRoutes();
  }

  // ============ STUDENT MANAGEMENT ============
  loadStudents() {
    console.log('Loading students...');
    this.loading = true;

    // Check if token exists
    const token = localStorage.getItem('jwt_token');
    console.log('Token exists:', !!token);

    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        console.log('Students data received:', data);
        console.log('Number of students:', data?.length);
        this.students = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        console.error('Error details:', error.message);
        this.loading = false;
        alert(`Failed to load students: ${error.message}`);
      }
    });
  }
  viewStudent(student: any) {
    this.selectedStudent = student;
  }

  closeStudentModal() {
    this.selectedStudent = null;
  }

  blockStudent(studentId: string) {
    if (confirm('Are you sure you want to block this student?')) {
      this.studentService.blockStudent(studentId).subscribe({
        next: () => {
          alert('Student blocked successfully');
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error blocking student:', error);
          alert('Failed to block student');
        }
      });
    }
  }

  unblockStudent(studentId: string) {
    if (confirm('Are you sure you want to unblock this student?')) {
      this.studentService.unblockStudent(studentId).subscribe({
        next: () => {
          alert('Student unblocked successfully');
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error unblocking student:', error);
          alert('Failed to unblock student');
        }
      });
    }
  }

  deleteStudent(studentId: string) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone!')) {
      this.studentService.deleteStudent(studentId).subscribe({
        next: () => {
          alert('Student deleted successfully');
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          alert('Failed to delete student');
        }
      });
    }
  }

  assignRouteToStudent(studentId: string) {
    const routeId = prompt('Enter Route ID to assign:');
    if (routeId && !isNaN(parseInt(routeId))) {
      this.studentService.assignRoute(studentId, parseInt(routeId)).subscribe({
        next: () => {
          alert('Route assigned successfully');
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error assigning route:', error);
          alert('Failed to assign route');
        }
      });
    } else if (routeId) {
      alert('Please enter a valid Route ID (number)');
    }
  }

  // ============ SEARCH STUDENTS ============
  searchByEmail() {
    if (!this.searchEmail) {
      alert('Please enter an email address');
      return;
    }
    this.studentService.searchByEmail(this.searchEmail).subscribe({
      next: (data) => {
        this.searchResult = data;
        alert(`Student found: ${data.name} (${data.studentId})`);
        this.searchEmail = '';
      },
      error: (error) => {
        console.error('Error searching student:', error);
        alert('Student not found');
      }
    });
  }

  searchByPhone() {
    if (!this.searchPhone) {
      alert('Please enter a phone number');
      return;
    }
    this.studentService.searchByPhone(this.searchPhone).subscribe({
      next: (data) => {
        this.searchResult = data;
        alert(`Student found: ${data.name} (${data.studentId})`);
        this.searchPhone = '';
      },
      error: (error) => {
        console.error('Error searching student:', error);
        alert('Student not found');
      }
    });
  }

  // ============ ROUTE MANAGEMENT ============
  createRouteForm(): FormGroup {
    return this.fb.group({
      busNo: ['', Validators.required],
      routeName: ['', Validators.required],
      routeLine: ['', Validators.required],
      operatingDays: [['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'], Validators.required],
      pickupPoints: [[]]
    });
  }

  loadRoutes() {
    this.routeService.getAllRoutes().subscribe({
      next: (data) => {
        this.routes = data;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        alert('Failed to load routes');
      }
    });
  }

  createRoute() {
    if (this.routeForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.routeService.createRoute(this.routeForm.value).subscribe({
      next: () => {
        alert('Route created successfully');
        this.routeForm.reset();
        this.loadRoutes();
      },
      error: (error) => {
        console.error('Error creating route:', error);
        alert('Failed to create route');
      }
    });
  }

  updateRouteStatus(routeId: number, status: string) {
    if (confirm(`Are you sure you want to ${status.toLowerCase()} this route?`)) {
      this.routeService.updateRouteStatus(routeId, status).subscribe({
        next: () => {
          alert(`Route ${status} successfully`);
          this.loadRoutes();
        },
        error: (error) => {
          console.error('Error updating route status:', error);
          alert('Failed to update route status');
        }
      });
    }
  }

  deleteRoute(routeId: number) {
    if (confirm('Are you sure you want to delete this route?')) {
      this.routeService.deleteRoute(routeId).subscribe({
        next: () => {
          alert('Route deleted successfully');
          this.loadRoutes();
        },
        error: (error) => {
          console.error('Error deleting route:', error);
          alert('Failed to delete route');
        }
      });
    }
  }

  // ============ ROUTINE MANAGEMENT ============
  createRoutineForm(): FormGroup {
    return this.fb.group({
      courseName: ['', Validators.required],
      courseCode: ['', Validators.required],
      teacherName: ['', Validators.required],
      day: ['MONDAY', Validators.required],
      startTime: ['09:00:00', Validators.required],
      endTime: ['10:30:00', Validators.required],
      roomNumber: ['', Validators.required],
      department: ['', Validators.required],
      batch: ['', Validators.required],
      routineType: ['CLASS', Validators.required],
      routeId: [null]
    });
  }

  createRoutine() {
    if (this.routineForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.routineService.createRoutine(this.routineForm.value).subscribe({
      next: () => {
        alert('Routine created successfully');
        this.routineForm.reset();
      },
      error: (error) => {
        console.error('Error creating routine:', error);
        alert('Failed to create routine');
      }
    });
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe();
    }
  }
}