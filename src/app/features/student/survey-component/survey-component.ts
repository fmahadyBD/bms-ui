import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse } from '../survey';
import { StudentService } from '../student';
import { NavbarComponent } from '../../student/navbar-component/navbar-component';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, FormsModule], // Remove NavbarComponent from here
  templateUrl: './survey-component.html',
  styleUrls: ['./survey-component.css']
})
export class SurveyComponent implements OnInit {
  surveys: SurveyResponse[] = [];
  selectedSurvey: SurveyResponse | null = null;
  studentId: string = '';
  responses: { [key: number]: any } = {};
  loading = false;
  submitting = false;
  showSurveyForm = false;
  errorMessage = '';

  constructor(
    private surveyService: SurveyService,
    private studentService: StudentService
  ) { }

  ngOnInit() {
    this.loadStudentInfo();
    this.loadActiveSurveys();
  }

  loadStudentInfo() {
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      this.studentService.searchByEmail(userEmail).subscribe({
        next: (student) => {
          this.studentId = student.studentId;
        },
        error: (error) => {
          console.error('Error loading student info:', error);
        }
      });
    }
  }

  loadActiveSurveys() {
    this.loading = true;
    this.surveyService.getActiveSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.errorMessage = 'Failed to load surveys. Please try again.';
        this.loading = false;
      }
    });
  }

  takeSurvey(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.showSurveyForm = true;
    this.responses = {};
  }

  closeSurvey() {
    this.showSurveyForm = false;
    this.selectedSurvey = null;
    this.responses = {};
  }

  onResponseChange(questionIndex: number, value: any) {
    this.responses[questionIndex] = value;
  }

  submitSurvey() {
    if (!this.selectedSurvey) return;

    // Validate all required questions are answered
    const unansweredRequired = this.selectedSurvey.questions.some((question, index) => {
      return question.required && !this.responses[index];
    });

    if (unansweredRequired) {
      this.errorMessage = 'Please answer all required questions.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    this.submitting = true;

    const surveyResponse = {
      studentId: this.studentId,
      responses: this.responses,
      submittedAt: new Date().toISOString()
    };

    this.surveyService.submitResponse(this.selectedSurvey.id, surveyResponse).subscribe({
      next: () => {
        this.submitting = false;
        alert('Survey submitted successfully!');
        this.closeSurvey();
        this.loadActiveSurveys();
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit survey. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
  
  parseOptions(options: string | string[] | null | undefined): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [options];
      } catch {
        return options.split(',').map(opt => opt.trim());
      }
    }
    return [];
  }

  updateCheckboxResponse(questionIndex: number, option: string, event: any) {
    if (!this.responses[questionIndex]) {
      this.responses[questionIndex] = [];
    }

    if (event.target.checked) {
      this.responses[questionIndex].push(option);
    } else {
      this.responses[questionIndex] = this.responses[questionIndex].filter((o: string) => o !== option);
    }
  }
}