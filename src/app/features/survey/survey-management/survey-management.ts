import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { SurveyService } from '../../survey/survey.service'; // Import your service
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-survey-management',
  templateUrl: './survey-management.html', // Changed from manager-survey.component.html
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./survey-management.css']
})
export class SurveyManagementComponent implements OnInit {
  surveyForm!: FormGroup;
  surveys: any[] = [];

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

  addQuestion() {
    const questionForm = this.fb.group({
      questionText: ['', Validators.required],
      questionType: ['TEXT', Validators.required],
      options: [''],
      displayOrder: [this.questions.length + 1],
      required: [false]
    });
    this.questions.push(questionForm);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  createSurvey() {
    this.surveyService.createSurvey(this.surveyForm.value).subscribe({
      next: (res) => {
        alert('Survey created successfully!');
        this.loadSurveys();
        this.initForm();
      },
      error: (err) => console.error(err)
    });
  }

  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe({
      next: (res: any) => this.surveys = res,
      error: (err) => console.error(err)
    });
  }

  deleteSurvey(id: number) {
    if (confirm('Delete this survey?')) {
      this.surveyService.deleteSurvey(id).subscribe({
        next: () => this.loadSurveys(),
        error: (err) => console.error(err)
      });
    }
  }
}