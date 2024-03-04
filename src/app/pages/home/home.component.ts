import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  datavisible:boolean = false;
  expanded: boolean= false;
  count= 1;
  constructor() {}
  onNavClick(){
    if(this.count == 0){
      if (this.datavisible === false) {
        this.datavisible=true
        this.expanded = true
      } else {
        this.datavisible=false
        this.expanded = false
      }
      this.count++;
    }
    else{
      this.count=0
    }
  }
}
