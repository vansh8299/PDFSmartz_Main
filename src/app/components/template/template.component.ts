import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    NgStyle,
    NgClass,
    MatCheckboxModule,
    NgIf,
    RouterModule,
    DatePipe
  ],
  templateUrl: './template.component.html',
  styleUrl: './template.component.css',
})
export class TemplateComponent {
  constructor(private data: DataService) {}
  displayedColumns: string[] = [
    'select',
    'name',
    'type',
    'createdOn',
    'status',
    'action',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: any;
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }
  ngOnInit() {
    this.data.getPdfForms().subscribe({
      next: (data: any) => {
        this.dataSource = new MatTableDataSource(data);
      },
    });
  }
  selection = new SelectionModel<FormData>(true, []);
  isAllSelected() {
    if (!this.dataSource || !this.dataSource.data) {
      return false;
    }
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: FormData): string {
    if (!this.dataSource || !this.dataSource.data) {
      return '';
    }
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      this.dataSource.data.indexOf(row) + 1
    }`;
  }
}
