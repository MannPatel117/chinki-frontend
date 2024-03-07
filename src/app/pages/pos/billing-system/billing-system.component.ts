import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-billing-system',
  standalone: true,
  imports: [RouterModule],
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
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAdminUser().subscribe((res:any) =>{
        if(res){
        }
      }, (error) =>{
        this.route.navigateByUrl('/login')
      })
    }
    else{
        this.route.navigateByUrl('/login')
    }
  }

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }
}
