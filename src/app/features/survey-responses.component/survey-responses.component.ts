import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse, SurveyResponseData } from '../survey/survey.service';
import { RouteService } from '../route/route.service';
import { BusSlotService } from '../bus-slot/bus-slot.service';

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

interface EnhancedResponse extends SurveyResponseData {
  routeName?: string;
  slotName?: string;
  parsedAnswers?: any;
}

@Component({
  selector: 'app-survey-responses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-responses.component.html',
  styleUrls: ['./survey-responses.component.css']
})
export class SurveyResponsesComponent implements OnInit {
  surveys: SurveyResponse[] = [];
  selectedSurveyId: number | null = null;  // Fixed: Changed to number | null
  selectedSurvey: SurveyResponse | null = null;
  responses: EnhancedResponse[] = [];
  filteredResponses: EnhancedResponse[] = [];
  
  routes: Route[] = [];
  slots: Slot[] = [];
  
  searchTerm: string = '';
  selectedRouteFilter: number | null = null;
  selectedSlotFilter: number | null = null;
  dateFrom: string = '';
  dateTo: string = '';
  
  statistics = {
    totalResponses: 0,
    uniqueStudents: 0,
    routeDistribution: {} as { [key: string]: number },
    slotDistribution: {} as { [key: string]: number },
    dailySubmissions: [] as { date: string; count: number }[]
  };
  
  loading = false;
  showResponseDetails = false;
  selectedResponse: EnhancedResponse | null = null;
  exportFormat: 'csv' | 'json' = 'csv';
  errorMessage: string = '';

  constructor(
    private surveyService: SurveyService,
    private routeService: RouteService,
    private slotService: BusSlotService
  ) {}

  ngOnInit() {
    console.log('SurveyResponsesComponent initialized');
    this.loadSurveys();
    this.loadRoutes();
    this.loadSlots();
  }

  loadSurveys() {
    this.loading = true;
    this.errorMessage = '';
    console.log('Fetching surveys from API...');
    
    this.surveyService.getAllSurveys().subscribe({
      next: (surveys) => {
        console.log('Surveys received from API:', surveys);
        this.surveys = surveys;
        this.loading = false;
        
        if (surveys && surveys.length > 0 && surveys[0].id) {  // Fixed: Added null check
          console.log('Found ' + surveys.length + ' surveys');
          // Auto-select the first survey
          this.selectedSurveyId = surveys[0].id;  // Fixed: Now safe because we checked
          this.selectedSurvey = surveys[0];
          console.log('Auto-selected survey:', this.selectedSurvey);
          this.loadResponses(surveys[0].id);  // Fixed: Pass the id directly
        } else {
          this.errorMessage = 'No surveys found. Please create a survey first.';
        }
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.errorMessage = 'Failed to load surveys. Check if backend is running on port 8080';
        this.loading = false;
      }
    });
  }

  loadRoutes() {
    this.routeService.getAllRoutes().subscribe({
      next: (response: any) => {
        this.routes = response.data || response;
        console.log('Routes loaded:', this.routes.length);
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.routes = [];
      }
    });
  }

  loadSlots() {
    this.slotService.getAllSlots().subscribe({
      next: (response: any) => {
        this.slots = response.data || response;
        console.log('Slots loaded:', this.slots.length);
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.slots = [];
      }
    });
  }

  onSurveySelect(event: any) {
    const surveyId = parseInt(event.target.value);
    console.log('Survey selected from dropdown:', surveyId);
    
    if (surveyId && !isNaN(surveyId)) {  // Fixed: Added validation
      this.selectedSurveyId = surveyId;
      this.selectedSurvey = this.surveys.find(s => s.id === surveyId) || null;
      console.log('Selected survey:', this.selectedSurvey);
      this.loadResponses(surveyId);
    }
  }

  loadResponses(surveyId: number) {  // Fixed: Parameter type is number
    if (!surveyId) {  // Fixed: Added guard clause
      console.warn('Invalid survey ID');
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    console.log('Loading responses for survey ID:', surveyId);
    
    this.surveyService.getSurveyResponses(surveyId).subscribe({
      next: (responses) => {
        console.log('Responses received from API:', responses);
        
        this.responses = responses.map(response => ({
          ...response,
          routeName: this.getRouteName(response.selectedRouteId),
          slotName: this.getSlotName(response.selectedSlotId),
          parsedAnswers: this.parseAnswers(response.responseData)
        }));
        
        console.log('Enhanced responses:', this.responses);
        this.filteredResponses = [...this.responses];
        this.calculateStatistics();
        this.loading = false;
        
        if (responses.length === 0) {
          this.errorMessage = 'No responses found for this survey yet.';
        }
      },
      error: (error) => {
        console.error('Error loading responses:', error);
        this.errorMessage = 'Failed to load responses. Please try again.';
        this.loading = false;
      }
    });
  }

  getRouteName(routeId: number): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? `${route.routeName} (${route.busNo})` : `Route ${routeId}`;
  }

  getSlotName(slotId: number): string {
    const slot = this.slots.find(s => s.id === slotId);
    return slot ? `${slot.slotName} - ${slot.pickupTime}` : `Slot ${slotId}`;
  }

  parseAnswers(responseData: string): any {
    try {
      return JSON.parse(responseData);
    } catch {
      return {};
    }
  }

  calculateStatistics() {
    this.statistics.totalResponses = this.responses.length;
    const uniqueStudents = new Set(this.responses.map(r => r.studentId));
    this.statistics.uniqueStudents = uniqueStudents.size;
    
    const routeDist: { [key: string]: number } = {};
    this.responses.forEach(response => {
      const routeName = response.routeName || 'Unknown';
      routeDist[routeName] = (routeDist[routeName] || 0) + 1;
    });
    this.statistics.routeDistribution = routeDist;
    
    const slotDist: { [key: string]: number } = {};
    this.responses.forEach(response => {
      const slotName = response.slotName || 'Unknown';
      slotDist[slotName] = (slotDist[slotName] || 0) + 1;
    });
    this.statistics.slotDistribution = slotDist;
    
    const dailyMap = new Map<string, number>();
    this.responses.forEach(response => {
      const date = response.submittedAt.split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    this.statistics.dailySubmissions = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  applyFilters() {
    this.filteredResponses = this.responses.filter(response => {
      const matchesSearch = !this.searchTerm || 
        response.studentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        response.studentId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (response.studentEmail && response.studentEmail.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesRoute = !this.selectedRouteFilter || 
        response.selectedRouteId === this.selectedRouteFilter;
      
      const matchesSlot = !this.selectedSlotFilter || 
        response.selectedSlotId === this.selectedSlotFilter;
      
      const responseDate = response.submittedAt.split('T')[0];
      const matchesDateFrom = !this.dateFrom || responseDate >= this.dateFrom;
      const matchesDateTo = !this.dateTo || responseDate <= this.dateTo;
      
      return matchesSearch && matchesRoute && matchesSlot && matchesDateFrom && matchesDateTo;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRouteFilter = null;
    this.selectedSlotFilter = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredResponses = [...this.responses];
  }

  viewResponseDetails(response: EnhancedResponse) {
    this.selectedResponse = response;
    this.showResponseDetails = true;
  }

  closeResponseDetails() {
    this.showResponseDetails = false;
    this.selectedResponse = null;
  }

  exportData() {
    if (this.exportFormat === 'csv') {
      this.exportToCSV();
    } else {
      this.exportToJSON();
    }
  }

  exportToCSV() {
    const headers = ['Student ID', 'Student Name', 'Email', 'Phone', 'Route', 'Slot', 'Submitted Date'];
    const rows = this.filteredResponses.map(response => [
      response.studentId,
      response.studentName,
      response.studentEmail || '',
      response.studentPhone || '',
      response.routeName || '',
      response.slotName || '',
      new Date(response.submittedAt).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${this.selectedSurvey?.title || 'export'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToJSON() {
    const data = {
      survey: this.selectedSurvey,
      responses: this.filteredResponses,
      statistics: this.statistics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${this.selectedSurvey?.title || 'export'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getAnswerValue(questionId: number | undefined, index: number): string {
    if (!this.selectedResponse || !this.selectedResponse.parsedAnswers) {
      return 'Not answered';
    }
    
    const id = questionId !== undefined ? questionId : index;
    const answer = this.selectedResponse.parsedAnswers[id] || 
                   this.selectedResponse.parsedAnswers[index] || 
                   this.selectedResponse.parsedAnswers[id.toString()];
    
    if (!answer) return 'Not answered';
    if (typeof answer === 'string') return answer;
    if (Array.isArray(answer)) return answer.join(', ');
    return JSON.stringify(answer);
  }

  getRouteNameById(routeId: number): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.routeName : 'Unknown';
  }

  getSlotNameById(slotId: number): string {
    const slot = this.slots.find(s => s.id === slotId);
    return slot ? slot.slotName : 'Unknown';
  }

  // Helper method to safely get questions length
  getQuestionsLength(): number {
    return this.selectedSurvey?.questions ? this.selectedSurvey.questions.length : 0;
  }
}