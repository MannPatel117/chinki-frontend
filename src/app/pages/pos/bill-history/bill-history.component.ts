import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-bill-history',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './bill-history.component.html',
  styleUrl: './bill-history.component.scss'
})
export class BillHistoryComponent {
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
