import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  // Custom validators for new format
  validateStudentId(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    // Accept: CSE-2021-001 OR 22002469 (numeric)
    const pattern1 = /^[A-Z]{2,10}-\d{4}-\d{3}$/;
    const pattern2 = /^\d{8,10}$/;
    return (pattern1.test(control.value) || pattern2.test(control.value)) ? null : { invalidStudentId: true };
  }

  validateBatch(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    // Accept: 221, 2021, Spring-2022
    const pattern1 = /^\d{3,4}$/;
    const pattern2 = /^(Spring|Summer|Fall)-\d{4}$/;
    return (pattern1.test(control.value) || pattern2.test(control.value)) ? null : { invalidBatch: true };
  }

  validatePhoneNumber(control: AbstractControl): ValidationErrors | null {
    const pattern = /^(?:\+880|0)1[3-9]\d{8}$/;
    if (!control.value) return null;
    return pattern.test(control.value) ? null : { invalidPhone: true };
  }

  createStudentForm(): FormGroup {
    return this.fb.group({
      studentId: ['', [Validators.required, this.validateStudentId]],
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, this.validatePhoneNumber]],
      address: ['', Validators.required],
      department: ['', Validators.required],
      batch: ['', [Validators.required, this.validateBatch]],
      gender: ['MALE', Validators.required],
      shift: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  createManagerForm(): FormGroup {
    return this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      lastname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      employeeId: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      phoneNumber: ['', [Validators.required, this.validatePhoneNumber]],
      address: ['', Validators.required]
    });
  }

  onUserTypeChange(type: 'STUDENT' | 'MANAGER'): void {
    this.userType = type;
    this.errorMessage = '';
    this.successMessage = '';
    if (type === 'STUDENT') {
      this.registerForm = this.createStudentForm();
    } else {
      this.registerForm = this.createManagerForm();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      const controls = this.registerForm.controls;
      if (controls['studentId']?.errors?.['invalidStudentId']) {
        this.errorMessage = 'Student ID must be: CSE-2021-001 or numeric (e.g., 22002469)';
      } else if (controls['batch']?.errors?.['invalidBatch']) {
        this.errorMessage = 'Batch must be: 221, 2021, or Spring-2022';
      } else if (controls['phoneNumber']?.errors?.['invalidPhone']) {
        this.errorMessage = 'Phone: +8801XXXXXXXXX or 01XXXXXXXXX';
      } else if (controls['name']?.errors?.['pattern']) {
        this.errorMessage = 'Name: letters, spaces, dots, hyphens only';
      } else {
        this.errorMessage = 'Please fill all required fields correctly';
      }
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
        this.successMessage = '✓ Registration successful! Redirecting to login...';
        this.registerForm.reset();
        if (this.userType === 'STUDENT') {
          this.registerForm = this.createStudentForm();
        } else {
          this.registerForm = this.createManagerForm();
        }
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 409) {
          this.errorMessage = 'Email, Student ID, or Phone already exists';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }
}