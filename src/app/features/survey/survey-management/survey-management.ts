// survey-management.component.ts
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
  errorMessage: string = '';

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
    academicYear: '',
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
  academicYears: string[] = [];

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
    this.generateAcademicYears();
    this.loadSurveys();
  }

  generateAcademicYears() {
    const currentYear = new Date().getFullYear();
    this.academicYears = [];
    for (let i = -3; i <= 3; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      this.academicYears.push(`${startYear}-${endYear}`);
    }
  }

  getOptionsArray(options: string | string[] | null | undefined): string[] {
    if (!options) {
      return [];
    }
    
    if (Array.isArray(options)) {
      return options;
    }
    
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
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
    this.errorMessage = '';
    console.log('Loading surveys...');
    
    this.surveyService.getAllSurveys().subscribe({
      next: (data) => {
        console.log('Surveys loaded:', data);
        this.surveys = data;
        this.loading = false;
        
        if (data.length === 0) {
          console.log('No surveys found');
        }
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.errorMessage = `Failed to load surveys: ${error.error?.message || error.message || 'Unknown error'}`;
        this.loading = false;
        alert(this.errorMessage);
      }
    });
  }

  openAddModal() {
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
    
    this.surveyForm = {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      academicYear: defaultAcademicYear,
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

    if (!this.surveyForm.startDate) {
      alert('Start date is required');
      return;
    }

    if (!this.surveyForm.endDate) {
      alert('End date is required');
      return;
    }

    const formattedStartDate = new Date(this.surveyForm.startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(this.surveyForm.endDate).toISOString().split('T')[0];

    const processedQuestions = this.surveyForm.questions.map((q, index) => {
      const processedQuestion: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder || index + 1,
        required: q.required
      };
      
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        processedQuestion.options = JSON.stringify(q.options);
      } else {
        processedQuestion.options = null;
      }
      
      return processedQuestion;
    });

    const surveyData: any = {
      title: this.surveyForm.title,
      description: this.surveyForm.description || '',
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      academicYear: this.surveyForm.academicYear,
      semester: this.surveyForm.semester,
      targetResponses: this.surveyForm.targetResponses || 100,
      status: this.surveyForm.status,
      questions: processedQuestions
    };

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
        let errorMsg = 'Failed to create survey: ';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg += error.error;
          } else if (error.error.message) {
            errorMsg += error.error.message;
          } else if (error.error.errors) {
            errorMsg += JSON.stringify(error.error.errors);
          }
        } else {
          errorMsg += error.message;
        }
        alert(errorMsg);
        this.actionLoading = false;
      }
    });
  }

  editSurvey(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    
    // FIXED: Add null check for survey.questions
    const questions = (survey.questions || []).map(q => {
      const question: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder,
        required: q.required,
        options: []
      };
      
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
    
    if (!this.surveyForm.title) {
      alert('Survey title is required');
      return;
    }

    const formattedStartDate = new Date(this.surveyForm.startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(this.surveyForm.endDate).toISOString().split('T')[0];

    const processedQuestions = this.surveyForm.questions.map((q, index) => {
      const processedQuestion: any = {
        questionText: q.questionText,
        questionType: q.questionType,
        displayOrder: q.displayOrder || index + 1,
        required: q.required
      };
      
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        processedQuestion.options = JSON.stringify(q.options);
      } else {
        processedQuestion.options = null;
      }
      
      return processedQuestion;
    });

    const surveyData: any = {
      title: this.surveyForm.title,
      description: this.surveyForm.description || '',
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      academicYear: this.surveyForm.academicYear,
      semester: this.surveyForm.semester,
      targetResponses: this.surveyForm.targetResponses || 100,
      status: this.surveyForm.status,
      questions: processedQuestions
    };

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
        error: (error) => {
          console.error('Error updating status:', error);
          alert('Failed to update status: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  viewDetails(survey: SurveyResponse) {
    // FIXED: Add null check for survey.questions
    const questions = (survey.questions || []).map(q => {
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
        alert('Failed to delete survey: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  addQuestion() {
    if (!this.newQuestion.questionText) {
      alert('Please enter question text');
      return;
    }

    const question = {
      questionText: this.newQuestion.questionText,
      questionType: this.newQuestion.questionType,
      required: this.newQuestion.required,
      options: [...this.newQuestion.options],
      displayOrder: this.surveyForm.questions.length + 1
    };
    
    this.surveyForm.questions.push(question);
    this.resetNewQuestion();
    alert('Question added successfully!');
  }

  removeQuestion(index: number) {
    if (confirm('Remove this question?')) {
      this.surveyForm.questions.splice(index, 1);
      this.surveyForm.questions.forEach((q, i) => {
        q.displayOrder = i + 1;
      });
    }
  }

  moveQuestionUp(index: number) {
    if (index > 0) {
      const temp = this.surveyForm.questions[index];
      this.surveyForm.questions[index] = this.surveyForm.questions[index - 1];
      this.surveyForm.questions[index - 1] = temp;
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
        alert('Failed to load responses: ' + (error.error?.message || error.message));
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
          alert('Failed to update response status: ' + (error.error?.message || error.message));
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
        alert('Failed to load statistics: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  closeStatisticsModal() {
    this.showStatisticsModal = false;
    this.surveyStatistics = null;
    this.selectedSurvey = null;
  }

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

  exportSurvey(survey: SurveyResponse) {
    this.surveyService.exportSurveyResponses(survey.id).subscribe({
      next: (data: any) => {
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
        alert('Failed to export survey responses: ' + (error.error?.message || error.message));
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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}