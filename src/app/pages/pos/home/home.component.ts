import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule  } from '@angular/router';
import { filter } from 'rxjs/operators'; 
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  role:any = 'store';
  firstLetter: string = 'G';
  pageHeading: string = 'Welcome!'
  currentRoute: string = '';
  constructor(private router: Router){

  }

  ngOnInit(){
    const firstName = localStorage.getItem('firstName'); // Fetch from local storage
    if (firstName) {
      this.firstLetter = firstName.charAt(0).toUpperCase(); // Extract and capitalize first letter
    }
    this.role = localStorage.getItem('role')
    this.currentRoute = this.router.url;
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.currentRoute = event.url;
      this.switchHeader(this.currentRoute);
    });

    this.switchHeader(this.currentRoute);
  }
  logout(){
    this.router.navigateByUrl('/login');
    localStorage.clear();
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarOpen = false;
  }

  switchHeader(route:string){
    switch(route){
      case '/pos/':
      case '/pos/main': this.pageHeading = "Home";
      break;
      case '/pos/billing-system': this.pageHeading = "Billing System";
      break;
      case '/pos/products-master': this.pageHeading = "Products Master";
      break;
      case '/pos/inventory-system': this.pageHeading = "Inventory System";
      break;
      case '/pos/dashboard': this.pageHeading = "Dashboard";
      break;
      case '/pos/user-history': this.pageHeading = "User History";
      break;
      case '/pos/accounts-master': this.pageHeading = "Accounts Master";
      break;
    }
  }
}
