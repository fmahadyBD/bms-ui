import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../student';
import { NavbarComponent } from '../navbar-component/navbar-component';

@Component({
  selector: 'app-my-route',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-route-component.html',
  styleUrls: ['./my-route-component.css']
})
export class MyRouteComponent implements OnInit {
  studentData: any = null;
  loading = false;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudentRoute();
  }

  loadStudentRoute() {
    this.loading = true;
    const userEmail = localStorage.getItem('user_email');
    
    if (userEmail) {
      this.studentService.searchByEmail(userEmail).subscribe({
        next: (data) => {
          this.studentData = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading route:', error);
          this.loading = false;
        }
      });
    }
  }

  getRouteStops() {
    // Mock route stops - replace with actual API data
    return [
      { name: 'University Main Gate', time: '8:00 AM', order: 1 },
      { name: 'City Center', time: '8:15 AM', order: 2 },
      { name: 'Residential Area', time: '8:30 AM', order: 3 },
      { name: 'Student Pickup Point', time: '8:45 AM', order: 4 }
    ];
  }
}