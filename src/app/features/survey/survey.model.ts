export interface Question {
  id?: number;
  questionText: string;
  questionType: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options?: string;
  displayOrder: number;
  required: boolean;
}

export interface Survey {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  questions: Question[];
}

export interface SurveyResponse {
  id?: number;
  surveyId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  selectedRouteId: number;
  selectedSlotId: number;
  answers: { [key: string]: any };
}