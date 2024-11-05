import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(private route: ActivatedRoute) {}
  readonly dialog = inject(MatDialog);
  clientID!: string;
  formId!: string;
  token!: string;
  openDialog() {
    this.dialog.open(DialogComponent, {
      maxWidth: '80vw',
      width: '100%',
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.clientID = params['clientID'];
      this.formId = params['formId'];
      this.token = params['token'];
      console.log(params)
    });
  }
}
