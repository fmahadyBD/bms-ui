import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { SurveyService, SurveyResponse } from '../../survey/survey.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-survey-management',
  templateUrl: './survey-management.html',
  styleUrls: ['./survey-management.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class SurveyManagementComponent implements OnInit {
  surveyForm!: FormGroup;
  surveys: SurveyResponse[] = [];
  isEditing = false;
  editingSurveyId: number | null = null;
  selectedSurvey: SurveyResponse | null = null;
  showDetailsModal = false;

  constructor(private fb: FormBuilder, private surveyService: SurveyService) {}

  ngOnInit() {
    this.initForm();
    this.loadSurveys();
  }

  initForm() {
    this.surveyForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  get questions() {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion(questionData?: any) {
    const questionForm = this.fb.group({
      questionText: [questionData?.questionText || '', Validators.required],
      questionType: [questionData?.questionType || 'TEXT', Validators.required],
      options: [questionData?.options || ''],
      displayOrder: [questionData?.displayOrder || this.questions.length + 1],
      required: [questionData?.required || false]
    });
    this.questions.push(questionForm);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  resetForm() {
    this.isEditing = false;
    this.editingSurveyId = null;
    this.initForm();
  }

  createOrUpdateSurvey() {
    if (this.isEditing && this.editingSurveyId) {
      this.updateSurvey();
    } else {
      this.createSurvey();
    }
  }

  createSurvey() {
    this.surveyService.createSurvey(this.surveyForm.value).subscribe({
      next: () => {
        alert('Survey created successfully!');
        this.loadSurveys();
        this.resetForm();
      },
      error: (err) => console.error(err)
    });
  }

  updateSurvey() {
    if (!this.editingSurveyId) return;
    
    this.surveyService.updateSurvey(this.editingSurveyId, this.surveyForm.value).subscribe({
      next: () => {
        alert('Survey updated successfully!');
        this.loadSurveys();
        this.resetForm();
      },
      error: (err) => console.error(err)
    });
  }

  editSurvey(survey: SurveyResponse) {
    if (!survey.id) return;
    
    this.isEditing = true;
    this.editingSurveyId = survey.id;
    
    this.surveyForm.patchValue({
      title: survey.title,
      description: survey.description,
      startDate: survey.startDate,
      endDate: survey.endDate
    });
    
    while (this.questions.length) {
      this.questions.removeAt(0);
    }
    
    if (survey.questions) {
      survey.questions.forEach(q => {
        this.addQuestion(q);
      });
    }
    
    document.querySelector('.card-header')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteSurvey(id: number) {
    if (confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      this.surveyService.deleteSurvey(id).subscribe({
        next: () => {
          alert('Survey deleted successfully!');
          this.loadSurveys();
          if (this.editingSurveyId === id) {
            this.resetForm();
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  viewDetails(survey: SurveyResponse) {
    this.selectedSurvey = survey;
    this.showDetailsModal = true;
  }

  closeDetails() {
    this.showDetailsModal = false;
    this.selectedSurvey = null;
  }

  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe({
      next: (res) => this.surveys = res,
      error: (err) => console.error(err)
    });
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getQuestionTypeLabel(type: string): string {
    switch(type) {
      case 'TEXT': return 'Text Answer';
      case 'SINGLE_CHOICE': return 'Single Choice';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      default: return type;
    }
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }

  getStatusText(active: boolean): string {
    return active ? 'Active' : 'Inactive';
  }
}