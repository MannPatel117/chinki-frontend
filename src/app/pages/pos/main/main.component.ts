import { Component } from '@angular/core';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{
  firstLetter: string = 'G';
  pageHeading: string = 'Welcome!'

}
