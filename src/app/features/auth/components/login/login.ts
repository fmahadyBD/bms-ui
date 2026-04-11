// login.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log('Login successful', response);
        
        const userType = response.userType;
        
        // Navigate based on user type - NO PAGE RELOAD
        if (userType === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
        } else if (userType === 'MANAGER') {
          this.router.navigate(['/manager-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}