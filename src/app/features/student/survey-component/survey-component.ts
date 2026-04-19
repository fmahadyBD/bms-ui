import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse } from '../survey';
import { StudentService, StudentResponse } from '../student';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-component.html',
  styleUrls: ['./survey-component.css']
})
export class SurveyComponent implements OnInit {
  surveys: SurveyResponse[] = [];
  selectedSurvey: SurveyResponse | null = null;
  studentData: StudentResponse | null = null;
  
  responses: { [key: number]: any } = {};
  loading = false;
  submitting = false;
  showSurveyForm = false;
  errorMessage = '';
  
  // Additional fields for bus service survey
  boardingPoint: string = '';
  dropPoint: string = '';
  pickupTime: string = '';
  additionalNotes: string = '';

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
          this.studentData = student;
          console.log('Student loaded:', student);
        },
        error: (error) => {
          console.error('Error loading student info:', error);
          const storedStudent = localStorage.getItem('student_info');
          if (storedStudent) {
            this.studentData = JSON.parse(storedStudent);
          } else {
            this.errorMessage = 'Could not load student information. Please login again.';
          }
        }
      });
    } else {
      this.errorMessage = 'Please login to participate in surveys.';
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
    if (!this.studentData) {
      this.errorMessage = 'Please wait, loading your information...';
      return;
    }
    
    this.selectedSurvey = survey;
    this.showSurveyForm = true;
    this.responses = {};
    this.boardingPoint = '';
    this.dropPoint = '';
    this.pickupTime = '';
    this.additionalNotes = '';
  }

  closeSurvey() {
    this.showSurveyForm = false;
    this.selectedSurvey = null;
    this.responses = {};
  }

  onResponseChange(questionIndex: number, value: any) {
    this.responses[questionIndex] = value;
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

  submitSurvey() {
    if (!this.selectedSurvey) return;
    if (!this.studentData) {
      this.errorMessage = 'Student information not loaded. Please refresh the page.';
      return;
    }

    // Validate required fields for bus service survey
    if (!this.boardingPoint) {
      this.errorMessage = 'Please enter your boarding point.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    if (!this.dropPoint) {
      this.errorMessage = 'Please enter your drop point.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    if (!this.pickupTime) {
      this.errorMessage = 'Please select your preferred pickup time.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    // Validate all required questions are answered
    const questions = this.selectedSurvey.questions || [];
    const unansweredRequired = questions.some((question, index) => {
      return question.required && !this.responses[index];
    });

    if (unansweredRequired) {
      this.errorMessage = 'Please answer all required questions.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    this.submitting = true;

    // Format the response data according to backend expectations
    const responseData = {
      studentId: this.studentData.studentId,
      studentName: this.studentData.name,
      studentEmail: this.studentData.email,
      studentPhone: this.studentData.phoneNumber,
      studentDepartment: this.studentData.department,
      studentSemester: this.studentData.batch,
      boardingPoint: this.boardingPoint,
      dropPoint: this.dropPoint,
      pickupTime: this.pickupTime,
      additionalNotes: this.additionalNotes,
      responseData: JSON.stringify(this.responses)
    };

    console.log('Submitting survey response:', responseData);

    this.surveyService.submitResponse(this.selectedSurvey.id, responseData).subscribe({
      next: (response) => {
        this.submitting = false;
        console.log('Survey submitted successfully:', response);
        alert('Survey submitted successfully! Thank you for your response.');
        this.closeSurvey();
        this.loadActiveSurveys();
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error submitting survey:', error);
        
        let errorMsg = 'Failed to submit survey. ';
        if (error.error?.message) {
          errorMsg += error.error.message;
        } else if (error.message) {
          errorMsg += error.message;
        } else {
          errorMsg += 'Please try again later.';
        }
        
        this.errorMessage = errorMsg;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}