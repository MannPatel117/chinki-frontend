import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss'
})
export class SplashComponent implements AfterViewInit {
  constructor(private route: Router){

  }
  appLoaded:boolean = false;

    // Function to hide splash screen and show app content
    hideSplash(): void {
      this.route.navigateByUrl('/login')
    }

    // When the app is fully loaded
    ngAfterViewInit(): void {
      setTimeout(() => {
        this.appLoaded = true;
        this.hideSplash();
      }, 2000);  // Ensure the splash screen shows for 2 seconds
    }
}
