import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse, SurveyRequest, StudentResponse, SurveyStatistics } from '../survey';

@Component({
  selector: 'app-survey-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-management.html',
  styleUrls: ['./survey-management.css']
})
export class SurveyManagementComponent implements OnInit {
  surveys: SurveyResponse[] = [];
  selectedSurvey: SurveyResponse | null = null;
  loading = false;
  actionLoading = false;

  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showResponsesModal = false;
  showStatisticsModal = false;
  showSubmitResponseModal = false;

  surveyForm: SurveyRequest = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    academicYear: '2025-2026',
    semester: 'Spring',
    targetResponses: 100,
    status: 'DRAFT',
    questions: []
  };

  // Question management properties
  newQuestion: any = {
    questionText: '',
    questionType: 'TEXT',
    required: false,
    options: []
  };
  
  questionTypes = ['TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'RATING'];
  optionsInput = '';
  
  semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
  academicYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  // Response management properties
  surveyResponses: StudentResponse[] = [];
  responseStatuses = ['PENDING', 'CONFIRMED', 'WAITLISTED', 'REJECTED'];
  
  // Statistics properties
  surveyStatistics: SurveyStatistics | null = null;
  
  // Student response submission
  studentResponse: any = {
    studentId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentDepartment: '',
    studentSemester: '',
    boardingPoint: '',
    dropPoint: '',
    pickupTime: '',
    additionalNotes: ''
  };

  constructor(private surveyService: SurveyService) {}

  ngOnInit() {
    this.loadSurveys();
  }

  // Helper methods for type-safe template handling
  getOptionsArray(options: string | string[] | null | undefined): string[] {
    if (!options) {
      return [];
    }
    
    if (Array.isArray(options)) {
      return options;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If parsing fails, treat as single option
        return options ? [options] : [];
      }
    }
    
    return [];
  }

  getOptionsString(options: string | string[] | null | undefined): string {
    const optionsArray = this.getOptionsArray(options);
    return optionsArray.join(', ');
  }

  loadSurveys() {
    this.loading = true;
    this.surveyService.getAllSurveys().subscribe({
      next: (data) => {
        this.surveys = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.loading = false;
        alert('Failed to load surveys');
      }
    });
  }

  openAddModal() {
    this.surveyForm = {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      academicYear: '2025-2026',
      semester: 'Spring',
      targetResponses: 100,
      status: 'DRAFT',
      questions: []
    };
    this.resetNewQuestion();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveSurvey() {
    if (!this.surveyForm.title) {
      alert('Survey title is required');
      return;
    }

    // CRITICAL FIX: Convert options array to JSON string for each question
    const processedQuestions = this.surveyForm.questions.map(q => {
      const processedQuestion: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder,
        required: q.required
      };
      
      // Handle options: convert array to JSON string or set to null
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        processedQuestion.options = JSON.stringify(q.options);
      } else if (typeof q.options === 'string' && q.options) {
        // If it's already a string, keep as is
        processedQuestion.options = q.options;
      } else {
        processedQuestion.options = null;
      }
      
      return processedQuestion;
    });

    const surveyData: any = {
      title: this.surveyForm.title,
      description: this.surveyForm.description,
      startDate: this.surveyForm.startDate,
      endDate: this.surveyForm.endDate,
      academicYear: this.surveyForm.academicYear,
      semester: this.surveyForm.semester,
      targetResponses: this.surveyForm.targetResponses,
      status: this.surveyForm.status,
      questions: processedQuestions
    };

    // Debug: Log what we're sending
    console.log('Sending survey data:', JSON.stringify(surveyData, null, 2));

    this.actionLoading = true;
    this.surveyService.createSurvey(surveyData).subscribe({
      next: (response) => {
        console.log('Survey created successfully:', response);
        alert('Survey created successfully!');
        this.closeAddModal();
        this.loadSurveys();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error creating survey:', error);
        console.error('Error details:', error.error);
        alert('Failed to create survey: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  editSurvey(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    
    // Parse options from JSON string back to array for editing
    const questions = survey.questions.map(q => {
      const question: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder,
        required: q.required,
        options: []
      };
      
      // Parse options if it's a string
      if (q.options && typeof q.options === 'string') {
        try {
          question.options = JSON.parse(q.options);
        } catch (e) {
          console.error('Error parsing options:', e);
          question.options = [];
        }
      } else if (Array.isArray(q.options)) {
        question.options = q.options;
      }
      
      return question;
    });
    
    this.surveyForm = {
      title: survey.title,
      description: survey.description,
      startDate: survey.startDate,
      endDate: survey.endDate,
      academicYear: survey.academicYear,
      semester: survey.semester,
      targetResponses: survey.targetResponses,
      status: survey.status,
      questions: questions
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedSurvey = null;
  }

  updateSurvey() {
    if (!this.selectedSurvey) return;
    
    // CRITICAL FIX: Convert options array to JSON string for each question
    const processedQuestions = this.surveyForm.questions.map(q => {
      const processedQuestion: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder,
        required: q.required
      };
      
      // Handle options: convert array to JSON string or set to null
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        processedQuestion.options = JSON.stringify(q.options);
      } else if (typeof q.options === 'string' && q.options) {
        // If it's already a string, keep as is
        processedQuestion.options = q.options;
      } else {
        processedQuestion.options = null;
      }
      
      return processedQuestion;
    });

    const surveyData: any = {
      title: this.surveyForm.title,
      description: this.surveyForm.description,
      startDate: this.surveyForm.startDate,
      endDate: this.surveyForm.endDate,
      academicYear: this.surveyForm.academicYear,
      semester: this.surveyForm.semester,
      targetResponses: this.surveyForm.targetResponses,
      status: this.surveyForm.status,
      questions: processedQuestions
    };

    // Debug: Log what we're sending
    console.log('Updating survey data:', JSON.stringify(surveyData, null, 2));
    
    this.actionLoading = true;
    this.surveyService.updateSurvey(this.selectedSurvey.id, surveyData).subscribe({
      next: (response) => {
        console.log('Survey updated successfully:', response);
        alert('Survey updated successfully!');
        this.closeEditModal();
        this.loadSurveys();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error updating survey:', error);
        console.error('Error details:', error.error);
        alert('Failed to update survey: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  updateStatus(survey: SurveyResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    if (confirm(`Change status to ${newStatus}?`)) {
      this.surveyService.updateSurveyStatus(survey.id, newStatus).subscribe({
        next: () => {
          alert('Status updated!');
          this.loadSurveys();
        },
        error: () => alert('Failed to update status')
      });
    }
  }

  viewDetails(survey: SurveyResponse) {
    // Parse options from JSON string to array for display
    const questions = survey.questions.map(q => {
      const question: any = { ...q };
      if (q.options && typeof q.options === 'string') {
        try {
          question.options = JSON.parse(q.options);
        } catch (e) {
          question.options = [];
        }
      }
      return question;
    });
    
    this.selectedSurvey = {
      ...survey,
      questions: questions
    };
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedSurvey = null;
  }

  confirmDelete(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedSurvey = null;
  }

  deleteSurvey() {
    if (!this.selectedSurvey) return;
    
    this.actionLoading = true;
    this.surveyService.deleteSurvey(this.selectedSurvey.id).subscribe({
      next: () => {
        alert('Survey deleted successfully!');
        this.closeDeleteModal();
        this.loadSurveys();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey');
        this.actionLoading = false;
      }
    });
  }

  // Question management methods
  addQuestion() {
    if (!this.newQuestion.questionText) {
      alert('Please enter question text');
      return;
    }

    const question = {
      questionText: this.newQuestion.questionText,
      questionType: this.newQuestion.questionType,
      required: this.newQuestion.required,
      options: [...this.newQuestion.options], // Create a copy of the options array
      displayOrder: this.surveyForm.questions.length + 1
    };
    
    this.surveyForm.questions.push(question);
    this.resetNewQuestion();
  }

  removeQuestion(index: number) {
    this.surveyForm.questions.splice(index, 1);
    // Update display orders
    this.surveyForm.questions.forEach((q, i) => {
      q.displayOrder = i + 1;
    });
  }

  moveQuestionUp(index: number) {
    if (index > 0) {
      const temp = this.surveyForm.questions[index];
      this.surveyForm.questions[index] = this.surveyForm.questions[index - 1];
      this.surveyForm.questions[index - 1] = temp;
      // Update display orders
      this.surveyForm.questions.forEach((q, i) => {
        q.displayOrder = i + 1;
      });
    }
  }

  moveQuestionDown(index: number) {
    if (index < this.surveyForm.questions.length - 1) {
      const temp = this.surveyForm.questions[index];
      this.surveyForm.questions[index] = this.surveyForm.questions[index + 1];
      this.surveyForm.questions[index + 1] = temp;
      // Update display orders
      this.surveyForm.questions.forEach((q, i) => {
        q.displayOrder = i + 1;
      });
    }
  }

  addOption() {
    if (this.optionsInput.trim()) {
      if (!this.newQuestion.options) {
        this.newQuestion.options = [];
      }
      this.newQuestion.options.push(this.optionsInput.trim());
      this.optionsInput = '';
    }
  }

  removeOption(index: number) {
    this.newQuestion.options.splice(index, 1);
  }

  resetNewQuestion() {
    this.newQuestion = {
      questionText: '',
      questionType: 'TEXT',
      required: false,
      options: []
    };
    this.optionsInput = '';
  }

  validateAndSave() {
    if (this.showAddModal) {
      this.saveSurvey();
    } else if (this.showEditModal) {
      this.updateSurvey();
    }
  }

  // Response management methods
  viewResponses(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.actionLoading = true;
    this.surveyService.getSurveyResponses(survey.id).subscribe({
      next: (responses) => {
        this.surveyResponses = responses;
        this.showResponsesModal = true;
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error loading responses:', error);
        alert('Failed to load responses');
        this.actionLoading = false;
      }
    });
  }

  closeResponsesModal() {
    this.showResponsesModal = false;
    this.surveyResponses = [];
    this.selectedSurvey = null;
  }

  updateResponseStatus(response: StudentResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    if (confirm(`Change response status to ${newStatus}?`)) {
      this.surveyService.updateResponseStatus(response.id, newStatus).subscribe({
        next: (updatedResponse) => {
          const index = this.surveyResponses.findIndex(r => r.id === response.id);
          if (index !== -1) {
            this.surveyResponses[index] = updatedResponse;
          }
          alert('Response status updated!');
        },
        error: (error) => {
          console.error('Error updating response status:', error);
          alert('Failed to update response status');
        }
      });
    }
  }

  getResponseStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'waitlisted': return 'status-waitlisted';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  // Statistics methods
  viewStatistics(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.actionLoading = true;
    this.surveyService.getSurveyStatistics(survey.id).subscribe({
      next: (statistics) => {
        this.surveyStatistics = statistics;
        this.showStatisticsModal = true;
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        alert('Failed to load statistics');
        this.actionLoading = false;
      }
    });
  }

  closeStatisticsModal() {
    this.showStatisticsModal = false;
    this.surveyStatistics = null;
    this.selectedSurvey = null;
  }

  // Submit response methods
  openSubmitResponse(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.resetStudentResponse();
    this.showSubmitResponseModal = true;
  }

  closeSubmitResponseModal() {
    this.showSubmitResponseModal = false;
    this.selectedSurvey = null;
    this.resetStudentResponse();
  }

  submitStudentResponse() {
    if (!this.selectedSurvey) return;
    
    // Validate required fields
    if (!this.studentResponse.studentId || !this.studentResponse.studentName || 
        !this.studentResponse.studentEmail || !this.studentResponse.studentPhone ||
        !this.studentResponse.boardingPoint || !this.studentResponse.dropPoint ||
        !this.studentResponse.pickupTime) {
      alert('Please fill in all required fields');
      return;
    }

    this.actionLoading = true;
    this.surveyService.submitResponse(this.selectedSurvey.id, this.studentResponse).subscribe({
      next: () => {
        alert('Response submitted successfully!');
        this.closeSubmitResponseModal();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error submitting response:', error);
        alert('Failed to submit response: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  resetStudentResponse() {
    this.studentResponse = {
      studentId: '',
      studentName: '',
      studentEmail: '',
      studentPhone: '',
      studentDepartment: '',
      studentSemester: '',
      boardingPoint: '',
      dropPoint: '',
      pickupTime: '',
      additionalNotes: ''
    };
  }

  // Export survey
  exportSurvey(survey: SurveyResponse) {
    this.surveyService.exportSurveyResponses(survey.id).subscribe({
      next: (data: any) => {
        // Handle both blob and JSON responses
        if (data instanceof Blob) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `survey_${survey.id}_responses.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          alert('Export completed!');
        } else {
          const csv = this.convertToCSV(data);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `survey_${survey.id}_responses.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          alert('Export completed!');
        }
      },
      error: (error) => {
        console.error('Error exporting survey:', error);
        alert('Failed to export survey responses');
      }
    });
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
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
    return new Date(date).toLocaleDateString();
  }
}