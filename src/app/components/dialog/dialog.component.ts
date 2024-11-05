import { NgClass, NgStyle } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    NgClass,
    MatProgressBarModule,
    NgStyle,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<DialogComponent>,
    private data: DataService
  ) {}

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  fileselected: boolean = false;
  progress: string = '0';

  isLoading: boolean = false;
  isDragging: boolean = false;

  // Handle drag events
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.handleFileUpload(file);
      } else {
        alert('Please upload only PDF files');
      }
    }
  }

  validateFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.validateFile(file)) {
      this.handleFileUpload(file);
    } else if (file) {
      alert('Please upload only PDF files');
    }
  }

  handleFileUpload(file: File) {
    let navigationExtras: NavigationExtras = {};
    this.fileselected = true;
    const formData = new FormData();
    formData.append('pdfFile', file, file.name);

    this.data.addpdf(formData).subscribe({
      next: (data) => {
        navigationExtras.state = { data: data, filename: file.name };
        this.isLoading = false;
        this.dialogRef.close();
        this.router.navigate(['/add'], navigationExtras);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.isLoading = false;

        alert('Upload failed. Please try again.');
      },
    });

    const interval = setInterval(() => {
      this.isLoading = true;
      clearInterval(interval);
    }, 200);
  }
}
