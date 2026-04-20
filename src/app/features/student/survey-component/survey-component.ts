import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse } from '../../survey/survey.service';
import { RouteService } from '../../route/route.service';  // Your route service
import { BusSlotService } from '../../bus-slot/bus-slot.service';     // Your slot service

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
  
  // Student data
  studentData = {
    studentId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: ''
  };
  
  // Route and Slot data from APIs
  routes: Route[] = [];
  slots: Slot[] = [];
  
  // Selected values
  selectedRouteId: number | null = null;
  selectedSlotId: number | null = null;
  
  // Filtered slots based on selected route
  filteredSlots: Slot[] = [];
  
  // Answers storage
  answers: { [key: number]: any } = {};
  
  // UI states
  loading = false;
  loadingRoutes = false;
  loadingSlots = false;
  submitting = false;
  showSurveyForm = false;
  errorMessage = '';

  constructor(
    private surveyService: SurveyService,
    private routeService: RouteService,    // Inject route service
    private slotService: BusSlotService        // Inject slot service
  ) {}

  ngOnInit() {
    this.loadStudentData();
    this.loadRoutes();
    this.loadSlots();
    this.loadActiveSurveys();
  }

  loadStudentData() {
    this.studentData = {
      studentId: localStorage.getItem('student_id') || '',
      studentName: localStorage.getItem('user_name') || '',
      studentEmail: localStorage.getItem('user_email') || '',
      studentPhone: localStorage.getItem('user_phone') || ''
    };
    
    if (!this.studentData.studentId) {
      this.errorMessage = 'Please login to participate in surveys.';
    }
  }

  loadRoutes() {
    this.loadingRoutes = true;
    // Call your actual route service API
    this.routeService.getAllRoutes().subscribe({
      next: (response: any) => {
        console.log('Routes loaded:', response);
        // Adjust based on your API response structure
        this.routes = response.data || response;
        this.loadingRoutes = false;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        // Fallback to mock data if API fails
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
    // Call your actual slot service API
    this.slotService.getAllSlots().subscribe({
      next: (response: any) => {
        console.log('Slots loaded:', response);
        // Adjust based on your API response structure
        this.slots = response.data || response;
        this.loadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        // Fallback to mock data if API fails
        this.slots = [
          { id: 1, slotName: 'Morning Express', pickupTime: '08:00 AM', dropTime: '02:00 PM', fromLocation: 'Dhaka', toLocation: 'Chittagong' },
          { id: 2, slotName: 'Evening Express', pickupTime: '05:00 PM', dropTime: '11:00 PM', fromLocation: 'Dhaka', toLocation: 'Chittagong' },
          { id: 3, slotName: 'Night Coach', pickupTime: '10:00 PM', dropTime: '06:00 AM', fromLocation: 'Dhaka', toLocation: 'Cox\'s Bazar' }
        ];
        this.loadingSlots = false;
      }
    });
  }

  // Optional: Filter slots when route is selected
  onRouteChange() {
    if (this.selectedRouteId) {
      // Filter slots based on selected route
      const selectedRoute = this.routes.find(r => r.id === this.selectedRouteId);
      if (selectedRoute) {
        this.filteredSlots = this.slots.filter(slot => 
          slot.fromLocation === selectedRoute.startPoint || 
          slot.toLocation === selectedRoute.endPoint
        );
      }
      // Reset slot selection
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
    if (!this.studentData.studentId) {
      this.errorMessage = 'Please login to submit survey.';
      return;
    }
    
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
    if (!this.answers[questionIndex]) {
      this.answers[questionIndex] = [];
    }
    
    if (event.target.checked) {
      if (!this.answers[questionIndex].includes(option)) {
        this.answers[questionIndex].push(option);
      }
    } else {
      this.answers[questionIndex] = this.answers[questionIndex].filter((o: string) => o !== option);
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
    if (!this.selectedSurvey) return;
    
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
    
    // Validate required questions
    const questions = this.selectedSurvey.questions || [];
    const unansweredRequired = questions.some((question, index) => {
      const answer = this.answers[index];
      const isEmpty = answer === undefined || answer === null || answer === '';
      const isArrayEmpty = Array.isArray(answer) && answer.length === 0;
      return question.required && (isEmpty || isArrayEmpty);
    });
    
    if (unansweredRequired) {
      this.errorMessage = 'Please answer all required questions.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
      return;
    }
    
    this.submitting = true;
    
    // Format answers - convert arrays to JSON strings
    const formattedAnswers: { [key: number]: any } = {};
    for (const key in this.answers) {
      const value = this.answers[key];
      if (Array.isArray(value)) {
        formattedAnswers[key] = JSON.stringify(value);
      } else {
        formattedAnswers[key] = value;
      }
    }
    
    // Clean phone number
    let cleanPhone = this.studentData.studentPhone.replace(/\D/g, '');
    if (cleanPhone.length === 13 && cleanPhone.startsWith('880')) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }
    
    const submissionData = {
      studentId: this.studentData.studentId,
      studentName: this.studentData.studentName,
      studentEmail: this.studentData.studentEmail,
      studentPhone: cleanPhone,
      selectedRouteId: this.selectedRouteId,
      selectedSlotId: this.selectedSlotId,
      answers: formattedAnswers
    };
    
    console.log('Submitting survey:', submissionData);
    
    this.surveyService.submitResponse(this.selectedSurvey.id, submissionData).subscribe({
      next: () => {
        this.submitting = false;
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
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
    });
  }
}