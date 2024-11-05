import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { NgClass, NgStyle } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DataService } from '../../services/data.service';
interface FormData {
  name: string;
  formtype: string;
  modified: string;
}

const FORM_DATA: FormData[] = [
  {
    name: 'Client Intake Form',
    formtype: 'Client Form',
    modified: '2024-01-15',
  },
  {
    name: 'Caregiver Assessment',
    formtype: 'Assessment Form',
    modified: '2024-01-10',
  },
  {
    name: 'Incident Report',
    formtype: 'Caregiver Form',
    modified: '2024-01-03',
  },
  { name: 'Client Feedback', formtype: 'Client Form', modified: '2024-01-02' },
  {
    name: 'Caregiver Application',
    formtype: 'Caregiver Form',
    modified: '2024-01-01',
  },
  {
    name: 'Health Assessment',
    formtype: 'Assessment Form',
    modified: '2023-12-25',
  },
  {
    name: 'Client Progress Report',
    formtype: 'Client Form',
    modified: '2023-12-10',
  },
  {
    name: 'Caregiver Evaluation',
    formtype: 'Assessment Form',
    modified: '2023-12-15',
  },
];
@Component({
  selector: 'app-template',
  standalone: true,
  imports: [MatTableModule, MatSortModule, NgStyle, NgClass, MatCheckboxModule],
  templateUrl: './template.component.html',
  styleUrl: './template.component.css',
})
export class TemplateComponent {
  constructor(private data:DataService){}
  displayedColumns: string[] = [
    'select',
    'name',
    'formtype',
    'modified',
    'status',
    'action',
  ];
  dataSource = new MatTableDataSource(FORM_DATA);

  @ViewChild(MatSort) sort!: MatSort;
 
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  selection = new SelectionModel<FormData>(true, []);
  isAllSelected() {
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
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      this.dataSource.data.indexOf(row) + 1
    }`;
  }
}
