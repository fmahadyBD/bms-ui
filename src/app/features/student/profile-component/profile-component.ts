import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../student';
// import { NavbarComponent } from '../navbar-component/navbar-component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  studentData: any = {};
  isEditing = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    const userEmail = localStorage.getItem('user_email');
    
    if (userEmail) {
      this.studentService.searchByEmail(userEmail).subscribe({
        next: (data) => {
          this.studentData = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.errorMessage = 'Failed to load profile';
          this.loading = false;
        }
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile(); // Reset to original data
    }
  }

  updateProfile() {
    this.loading = true;
    const updateData = {
      name: this.studentData.name,
      email: this.studentData.email,
      phoneNumber: this.studentData.phoneNumber,
      department: this.studentData.department,
      batch: this.studentData.batch
    };
    
    this.studentService.updateStudent(this.studentData.studentId, updateData).subscribe({
      next: (response) => {
        this.studentData = response;
        this.isEditing = false;
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }
}