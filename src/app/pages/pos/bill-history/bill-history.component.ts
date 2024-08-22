import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bill-history',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './bill-history.component.html',
  styleUrl: './bill-history.component.scss'
})
export class BillHistoryComponent {
  current_location: any;
  role:any = 'store';
  constructor(private fb: FormBuilder, private route: Router,private api: ApiService) {
    this.role = localStorage.getItem('role');
    this.current_location = localStorage.getItem('location')
  }
  
  ngOnInit(){
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn(){
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAPI('/admin/session', []).subscribe((res:any) =>{
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
