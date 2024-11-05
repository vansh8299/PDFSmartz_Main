import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-userform',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './userform.component.html',
  styleUrl: './userform.component.css'
})
export class UserformComponent {
  Title!:string|null;
  pdf!:string;
  edit_pdf!:string;
  filename!:string
  @ViewChild('iframeElement', { static: true }) iframeElement!: ElementRef;
 constructor(private activatedRoute:ActivatedRoute,private router:Router){
    this.pdf=this.router.getCurrentNavigation()?.extras?.state?.['html_to_pdf']
    this.edit_pdf=this.router.getCurrentNavigation()?.extras?.state?.['pdf']
    this.filename=this.router.getCurrentNavigation()?.extras?.state?.['filename']
 }
 ngOnInit(){
  const element=this.iframeElement.nativeElement as HTMLElement;
  if(this.pdf){
    element.setAttribute('src',  this.pdf)
  }

  this.Title=this.activatedRoute.snapshot.paramMap.get('name');
 }
 editback(){
  let navigationExtras: NavigationExtras = {}
  navigationExtras.state={data:this.edit_pdf,filename:this.filename}
  this.router.navigate(['/add'],navigationExtras)
 }
}
