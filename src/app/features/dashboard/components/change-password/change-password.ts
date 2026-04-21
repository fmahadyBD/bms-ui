import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent implements OnInit {
  @Output() passwordChanged = new EventEmitter<void>();
  
  passwordForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // No need to get studentId separately - authService will handle it
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
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

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const passwords = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    // Use AuthService's changePassword method instead
    this.authService.changePassword(passwords).subscribe({
      next: (response) => {
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        this.loading = false;
        
        setTimeout(() => {
          this.successMessage = '';
          this.passwordChanged.emit();
        }, 1500);
      },
      error: (error) => {
        if (error.status === 400) {
          if (error.error?.message?.includes('Old password') || error.error?.includes('Old password')) {
            this.errorMessage = 'Current password is incorrect';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
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