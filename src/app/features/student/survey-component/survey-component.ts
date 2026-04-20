// survey-component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse, RouteBasicResponse, BusSlotResponse } from '../survey';
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
  
  // Route and Slot selection
  availableRoutes: RouteBasicResponse[] = [];
  availableSlots: BusSlotResponse[] = [];
  selectedRouteId: number | null = null;
  selectedSlotId: number | null = null;
  selectedRouteName: string = '';
  selectedPickupTime: string = '';
  
  responses: { [key: number]: any } = {};
  loading = false;
  submitting = false;
  showSurveyForm = false;
  errorMessage = '';
  
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
          this.errorMessage = 'Could not load student information. Please login again.';
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
      console.log('=== RAW API RESPONSE ===');
      console.log('All active surveys:', surveys);
      
      // Log each survey's details
      surveys.forEach(survey => {
        console.log(`Survey: ${survey.title}`);
        console.log(`  - ID: ${survey.id}`);
        console.log(`  - Status: ${survey.status}`);
        console.log(`  - Start Date: ${survey.startDate}`);
        console.log(`  - End Date: ${survey.endDate}`);
        console.log(`  - Available Routes:`, survey.availableRoutes);
        console.log(`  - Available Slots:`, survey.availableSlots);
      });
      
      // Filter surveys that have routes and slots
      this.surveys = surveys.filter(survey => 
        survey.status === 'PUBLISHED' &&
        survey.availableRoutes && survey.availableRoutes.length > 0 &&
        survey.availableSlots && survey.availableSlots.length > 0
      );
      
      console.log('=== FILTERED SURVEYS ===');
      console.log('Surveys to display:', this.surveys);
      
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
    
    // Check if survey has routes and slots
    if (!survey.availableRoutes || survey.availableRoutes.length === 0) {
      this.errorMessage = 'This survey has no routes available.';
      return;
    }
    
    if (!survey.availableSlots || survey.availableSlots.length === 0) {
      this.errorMessage = 'This survey has no time slots available.';
      return;
    }
    
    this.selectedSurvey = survey;
    this.availableRoutes = survey.availableRoutes;
    this.availableSlots = survey.availableSlots;
    this.selectedRouteId = null;
    this.selectedSlotId = null;
    this.selectedRouteName = '';
    this.selectedPickupTime = '';
    this.showSurveyForm = true;
    this.responses = {};
    this.additionalNotes = '';
    this.errorMessage = '';
  }

  onRouteChange() {
    const selectedRoute = this.availableRoutes.find(r => r.id === this.selectedRouteId);
    this.selectedRouteName = selectedRoute ? selectedRoute.routeName : '';
  }

  onSlotChange() {
    const selectedSlot = this.availableSlots.find(s => s.id === this.selectedSlotId);
    if (selectedSlot) {
      this.selectedPickupTime = selectedSlot.pickupTime;
    }
  }

  closeSurvey() {
    this.showSurveyForm = false;
    this.selectedSurvey = null;
    this.responses = {};
    this.errorMessage = '';
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

    // Validate route selection
    if (!this.selectedRouteId) {
      this.errorMessage = 'Please select a route.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    // Validate slot selection
    if (!this.selectedSlotId) {
      this.errorMessage = 'Please select a time slot.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    // Validate all required questions are answered
    const questions = this.selectedSurvey.questions || [];
    const unansweredRequired = questions.some((question, index) => {
      return question.required && (this.responses[index] === undefined || this.responses[index] === '');
    });

    if (unansweredRequired) {
      this.errorMessage = 'Please answer all required questions.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }

    this.submitting = true;

    // Format the response data
    const responseData = {
      studentId: this.studentData.studentId,
      studentName: this.studentData.name,
      studentEmail: this.studentData.email,
      studentPhone: this.studentData.phoneNumber,
      studentDepartment: this.studentData.department,
      studentSemester: this.studentData.batch,
      selectedRouteId: this.selectedRouteId,
      selectedSlotId: this.selectedSlotId,
      boardingPoint: this.selectedRouteName,
      dropPoint: this.selectedRouteName,
      pickupTime: this.selectedPickupTime,
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

  getStatusClass(status: string): string {
    switch(status) {
      case 'DRAFT': return 'status-draft';
      case 'PUBLISHED': return 'status-published';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}