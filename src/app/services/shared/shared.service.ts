import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private api: ApiService, private route: Router) { }

  async checkUserLoggedIn(): Promise<boolean>{
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAPI('/admin/session', []).subscribe((res:any) =>{
        if(res.statusCode == 200){
          return true;
        } else{
          return false;
        }
      }, (error) =>{
        return false;
      });
    } else{
      return false;
    }
    return false;
  }
}
