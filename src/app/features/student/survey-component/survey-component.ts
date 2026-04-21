import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse } from '../../survey/survey.service';
import { RouteService } from '../../route/route.service';
import { BusSlotService } from '../../bus-slot/bus-slot.service';

interface Route {
  id: number;
  routeName: string;
  busNo: string;
  startPoint: string;
  endPoint: string;
}

interface Slot {
  id: number;
  slotName: string;
  pickupTime: string;
  dropTime: string;
  fromLocation: string;
  toLocation: string;
}

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
  
  studentData = {
    studentId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: ''
  };
  
  routes: Route[] = [];
  slots: Slot[] = [];
  
  selectedRouteId: number | null = null;
  selectedSlotId: number | null = null;
  filteredSlots: Slot[] = [];
  
  answers: { [key: string]: any } = {}; // Changed to string key for backend
  
  loading = false;
  loadingRoutes = false;
  loadingSlots = false;
  submitting = false;
  showSurveyForm = false;
  errorMessage = '';

  constructor(
    private surveyService: SurveyService,
    private routeService: RouteService,
    private slotService: BusSlotService
  ) {}

  ngOnInit() {
    this.loadStudentData();
    this.loadRoutes();
    this.loadSlots();
    this.loadActiveSurveys();
  }

  loadStudentData() {
    this.studentData = {
      studentId: localStorage.getItem('student_id') || 'STU001', // Default for testing
      studentName: localStorage.getItem('user_name') || 'Test Student',
      studentEmail: localStorage.getItem('user_email') || 'test@example.com',
      studentPhone: localStorage.getItem('user_phone') || '01712345678'
    };
  }

  loadRoutes() {
    this.loadingRoutes = true;
    this.routeService.getAllRoutes().subscribe({
      next: (response: any) => {
        console.log('Routes loaded:', response);
        this.routes = response.data || response;
        this.loadingRoutes = false;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.routes = [
          { id: 1, routeName: 'Dhaka to Chittagong', busNo: 'BUS-001', startPoint: 'Dhaka', endPoint: 'Chittagong' },
          { id: 2, routeName: 'Dhaka to Sylhet', busNo: 'BUS-002', startPoint: 'Dhaka', endPoint: 'Sylhet' },
          { id: 3, routeName: 'Dhaka to Cox\'s Bazar', busNo: 'BUS-003', startPoint: 'Dhaka', endPoint: 'Cox\'s Bazar' }
        ];
        this.loadingRoutes = false;
      }
    });
  }

  loadSlots() {
    this.loadingSlots = true;
    this.slotService.getAllSlots().subscribe({
      next: (response: any) => {
        console.log('Slots loaded:', response);
        this.slots = response.data || response;
        this.loadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.slots = [
          { id: 1, slotName: 'Morning Express', pickupTime: '08:00 AM', dropTime: '02:00 PM', fromLocation: 'Dhaka', toLocation: 'Chittagong' },
          { id: 2, slotName: 'Evening Express', pickupTime: '05:00 PM', dropTime: '11:00 PM', fromLocation: 'Dhaka', toLocation: 'Chittagong' },
          { id: 3, slotName: 'Night Coach', pickupTime: '10:00 PM', dropTime: '06:00 AM', fromLocation: 'Dhaka', toLocation: 'Cox\'s Bazar' }
        ];
        this.loadingSlots = false;
      }
    });
  }

  onRouteChange() {
    if (this.selectedRouteId) {
      const selectedRoute = this.routes.find(r => r.id === this.selectedRouteId);
      if (selectedRoute) {
        this.filteredSlots = this.slots.filter(slot => 
          slot.fromLocation === selectedRoute.startPoint || 
          slot.toLocation === selectedRoute.endPoint
        );
      }
      this.selectedSlotId = null;
    } else {
      this.filteredSlots = [];
    }
  }

  loadActiveSurveys() {
    this.loading = true;
    this.errorMessage = '';
    
    this.surveyService.getActiveSurveys().subscribe({
      next: (surveys) => {
        console.log('Active surveys:', surveys);
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
    this.selectedRouteId = null;
    this.selectedSlotId = null;
    this.filteredSlots = [];
    this.answers = {};
    this.showSurveyForm = true;
    this.errorMessage = '';
  }

  closeSurvey() {
    this.showSurveyForm = false;
    this.selectedSurvey = null;
    this.answers = {};
    this.selectedRouteId = null;
    this.selectedSlotId = null;
  }

  onCheckboxChange(questionIndex: number, option: string, event: any) {
    const key = questionIndex.toString();
    if (!this.answers[key]) {
      this.answers[key] = [];
    }
    
    if (event.target.checked) {
      if (!this.answers[key].includes(option)) {
        this.answers[key].push(option);
      }
    } else {
      this.answers[key] = this.answers[key].filter((o: string) => o !== option);
    }
  }

  parseOptions(options: string | null | undefined): string[] {
    if (!options) return [];
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [options];
    } catch {
      return options.split(',').map(opt => opt.trim());
    }
  }

  submitSurvey() {
    console.log('=== Starting survey submission ===');
    
    // Validation checks
    if (!this.selectedSurvey) {
      this.errorMessage = 'No survey selected.';
      return;
    }
    
    if (!this.selectedSurvey.id) {
      this.errorMessage = 'Invalid survey ID.';
      return;
    }
    
    if (!this.selectedRouteId) {
      this.errorMessage = 'Please select a route.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }
    
    if (!this.selectedSlotId) {
      this.errorMessage = 'Please select a time slot.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }
    
    // Validate required questions
    const questions = this.selectedSurvey.questions || [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = this.answers[i.toString()];
      const isEmpty = answer === undefined || answer === null || answer === '';
      const isArrayEmpty = Array.isArray(answer) && answer.length === 0;
      
      if (question.required && (isEmpty || isArrayEmpty)) {
        this.errorMessage = `Please answer question ${i + 1}: ${question.questionText}`;
        setTimeout(() => { this.errorMessage = ''; }, 3000);
        return;
      }
    }
    
    this.submitting = true;
    
    // Format answers exactly as backend expects (Map<String, Object>)
    const formattedAnswers: { [key: string]: any } = {};
    
    for (let i = 0; i < questions.length; i++) {
      const answer = this.answers[i.toString()];
      if (answer !== undefined && answer !== null && answer !== '') {
        // Store answer as is - backend will handle the conversion
        formattedAnswers[i.toString()] = answer;
      } else {
        formattedAnswers[i.toString()] = '';
      }
    }
    
    // Prepare submission data matching backend SubmissionRequest
    const submissionData = {
      studentId: this.studentData.studentId || 'STU001',
      studentName: this.studentData.studentName || 'Test Student',
      studentEmail: this.studentData.studentEmail || '',
      studentPhone: this.studentData.studentPhone || '',
      selectedRouteId: Number(this.selectedRouteId), // Convert to number
      selectedSlotId: Number(this.selectedSlotId),   // Convert to number
      answers: formattedAnswers
    };
    
    console.log('Submitting to URL:', `http://localhost:8080/api/v1/surveys/${this.selectedSurvey.id}/submit`);
    console.log('Submission data:', JSON.stringify(submissionData, null, 2));
    
    const surveyId = this.selectedSurvey.id;
    
    this.surveyService.submitResponse(surveyId, submissionData).subscribe({
      next: (response) => {
        console.log('Success! Response:', response);
        this.submitting = false;
        alert('Survey submitted successfully! Thank you for your response.');
        this.closeSurvey();
        this.loadActiveSurveys();
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error details:', error);
        
        // Try to get error message from response
        if (error.error && typeof error.error === 'object') {
          console.error('Server error object:', error.error);
          if (error.error.message) {
            this.errorMessage = `Server error: ${error.error.message}`;
          } else {
            this.errorMessage = `Server error: ${error.error.error || 'Internal Server Error'}`;
          }
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to submit survey. Please try again.';
        }
        
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
    });
  }
}