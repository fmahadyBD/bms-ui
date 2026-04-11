import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, StudentSummaryResponse, UpdateStudentRequest } from '../../services/student';

@Component({
  selector: 'app-all-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-student-component.html',
  styleUrls: ['./all-student-component.css']
})
export class AllStudentComponent implements OnInit {
  loading = false;
  students: StudentSummaryResponse[] = [];
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showDetailsModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showChangePasswordModal = false;
  selectedStudent: StudentSummaryResponse | null = null;
  
  editForm: UpdateStudentRequest = {
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    batch: ''
  };

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  actionLoading = false;
  passwordLoading = false;

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
          this.showError('Failed to load students: ' + (error.error?.message || error.message));
        }
      });
    });
  }

  viewDetails(student: StudentSummaryResponse) {
    this.selectedStudent = student;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedStudent = null;
  }

  editStudent(student: StudentSummaryResponse) {
    this.selectedStudent = student;
    this.editForm = {
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber,
      department: student.department,
      batch: student.batch
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedStudent = null;
    this.editForm = {
      name: '',
      email: '',
      phoneNumber: '',
      department: '',
      batch: ''
    };
    this.actionLoading = false; // Reset loading state
  }

  saveEdit() {
    if (!this.selectedStudent) return;
    
    this.actionLoading = true;
    this.studentService.updateStudent(this.selectedStudent.studentId, this.editForm).subscribe({
      next: () => {
        this.showSuccess('Student updated successfully!');
        this.closeEditModal(); // Close modal immediately after success
        this.loadAllStudents(); // Refresh the list
        this.actionLoading = false;
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showError('Failed to update student: ' + (error.error?.message || error.message));
        this.actionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openChangePassword(student: StudentSummaryResponse) {
    this.selectedStudent = student;
    this.passwordForm = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.selectedStudent = null;
    this.passwordForm = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordLoading = false;
  }

  saveChangePassword() {
    if (!this.selectedStudent) return;

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showError('New passwords do not match!');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.showError('Password must be at least 8 characters long!');
      return;
    }

    this.passwordLoading = true;
    this.studentService.changePassword(this.selectedStudent.studentId, {
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.showSuccess('Password changed successfully!');
        this.closeChangePasswordModal(); // Close modal immediately after success
        this.passwordLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showError('Failed to change password: ' + (error.error || error.message));
        this.passwordLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(student: StudentSummaryResponse) {
    this.selectedStudent = student;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedStudent = null;
    this.actionLoading = false;
  }

  deleteStudent() {
    if (!this.selectedStudent) return;
    
    this.actionLoading = true;
    this.studentService.deleteStudent(this.selectedStudent.studentId).subscribe({
      next: () => {
        this.showSuccess('Student deleted successfully!');
        this.closeDeleteModal(); // Close modal immediately after success
        this.loadAllStudents(); // Refresh the list
        this.actionLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showError('Failed to delete student: ' + (error.error?.message || error.message));
        this.actionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleBlockStatus(student: StudentSummaryResponse) {
    const action = student.blocked ? 'unblock' : 'block';
    const confirmMessage = `Are you sure you want to ${action} ${student.name}?`;
    
    if (confirm(confirmMessage)) {
      this.actionLoading = true;
      const request = student.blocked 
        ? this.studentService.unblockStudent(student.studentId)
        : this.studentService.blockStudent(student.studentId);
      
      request.subscribe({
        next: () => {
          this.showSuccess(`Student ${action}ed successfully!`);
          this.loadAllStudents(); // Refresh the list
          this.actionLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.showError(`Failed to ${action} student: ` + (error.error?.message || error.message));
          this.actionLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
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

  private showSuccess(message: string) {
    // You can replace with a toast notification
    alert(message);
  }

  private showError(message: string) {
    alert(message);
  }
}