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
    if (token) {
      try {
        const res: any = await this.api.getAPI('/admin/session', []).toPromise();
        if (res.statusCode === 200) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
