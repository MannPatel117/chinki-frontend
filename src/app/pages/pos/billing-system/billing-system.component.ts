import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-billing-system',
  standalone: true,
  imports: [],
  templateUrl: './billing-system.component.html',
  styleUrl: './billing-system.component.scss'
})
export class BillingSystemComponent {

  constructor(private fb: FormBuilder, private route: Router,private api: ApiService) {
  
  }
  
  ngOnInit(){
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn(){
    this.api.getAdminUser().subscribe((res:any) =>{
    }, (error) =>{
      this.route.navigateByUrl('/login')
    })
  }
}
