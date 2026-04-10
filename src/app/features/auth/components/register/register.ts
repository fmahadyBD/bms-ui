import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  userType: 'STUDENT' | 'MANAGER' = 'STUDENT';
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.createStudentForm();
  }

  createStudentForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      department: ['', Validators.required],
      batch: ['', Validators.required],
      gender: ['MALE', Validators.required],
      shift: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  createManagerForm(): FormGroup {
    return this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      employeeId: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required]
    });
  }

  onUserTypeChange(type: 'STUDENT' | 'MANAGER'): void {
    this.userType = type;
    if (type === 'STUDENT') {
      this.registerForm = this.createStudentForm();
    } else {
      this.registerForm = this.createManagerForm();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const registerObservable = this.userType === 'STUDENT'
      ? this.authService.registerStudent(this.registerForm.value)
      : this.authService.registerManager(this.registerForm.value);

    registerObservable.subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Please login.';
        this.registerForm.reset();
        setTimeout(() => {
          // Find and update the parent landing page component
          const landingPage = this.getLandingPageComponent();
          if (landingPage) {
            landingPage.showLogin = true;
          }
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Registration failed. Please try again.';
        this.loading = false;
        console.error('Registration error:', error);
      }
    });
  }

  private getLandingPageComponent(): any {
    const appElement = document.querySelector('app-landing-page');
    if (appElement) {
      // @ts-ignore
      return appElement.__ngContext__?.[8] || null;
    }
    return null;
  }
}