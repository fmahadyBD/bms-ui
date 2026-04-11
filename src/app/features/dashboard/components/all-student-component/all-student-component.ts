import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student';

@Component({
  selector: 'app-all-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-student-component.html',
  styleUrls: ['./all-student-component.css']
})
export class AllStudentComponent implements OnInit {
  loading = false;
  students: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadAllStudents();
  }

  loadAllStudents() {
    this.loading = true;
    this.ngZone.run(() => {
      this.studentService.getAllStudents(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.students = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.loading = false;
          this.cdr.detectChanges();
          alert('Failed to load students: ' + (error.error?.message || error.message));
        }
      });
    });
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadAllStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAllStudents();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAllStudents();
    }
  }

  getPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }
}