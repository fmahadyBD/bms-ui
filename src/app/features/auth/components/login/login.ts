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
        console.log('Login successful. Response:', response);
        console.log('User type:', response.userType);
        
        const userType = response.userType;
        
        // Debug: Check if router is available
        console.log('Router available:', !!this.router);
        
        // Try to navigate
        if (userType === 'STUDENT') {
          console.log('Navigating to student-dashboard');
          this.router.navigate(['/student-dashboard']).then(success => {
            console.log('Navigation success:', success);
            if (!success) {
              console.error('Navigation failed! Check if route exists');
            }
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        } else if (userType === 'MANAGER') {
          console.log('Navigating to manager-dashboard');
          this.router.navigate(['/manager-dashboard']).then(success => {
            console.log('Navigation success:', success);
            if (!success) {
              console.error('Navigation failed! Check if route exists');
            }
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        } else {
          console.log('Unknown user type, navigating to home');
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