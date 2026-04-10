
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student';
import { AuthService } from '../../../auth/services/auth'; // ADD THIS

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  loading = false;
  private studentId: string = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private authService: AuthService  // ADD THIS
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Read studentId directly from the JWT — no extra API call needed
    const id = this.authService.getStudentIdFromToken();
    if (id) {
      this.studentId = id;
      console.log('Student ID from token:', this.studentId);
    } else {
      this.errorMessage = 'Could not identify student. Please login again.';
    }
  }

  getStudentId() {
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      this.studentService.searchByEmail(userEmail).subscribe({
        next: (student) => {
          this.studentId = student.studentId;
          console.log('Student ID loaded:', this.studentId);
        },
        error: (error) => {
          console.error('Error getting student:', error);
          this.errorMessage = 'Could not identify student. Please refresh.';
        }
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    console.log('Submitting password change...');
    console.log('Student ID:', this.studentId);

    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('mismatch')) {
        this.errorMessage = 'New passwords do not match';
      } else if (this.passwordForm.get('newPassword')?.hasError('minlength')) {
        this.errorMessage = 'Password must be at least 8 characters';
      } else {
        this.errorMessage = 'Please fill all fields correctly';
      }
      return;
    }

    if (!this.studentId) {
      this.errorMessage = 'Unable to identify student. Please refresh and try again.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const passwords = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    console.log('Sending password change request:', { studentId: this.studentId, passwords });

    this.studentService.changePassword(this.studentId, passwords).subscribe({
      next: (response) => {
        console.log('Password change response:', response);
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        this.loading = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Password change error details:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);  
        console.error('Full error:', error);

        if (error.status === 400) {
          if (error.error?.includes('Old password')) {
            this.errorMessage = 'Current password is incorrect';
          } else if (error.error) {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = 'Invalid password. Password must be at least 8 characters.';
          }
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          this.errorMessage = 'Failed to change password. Please try again.';
        }
        this.loading = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
  }
}