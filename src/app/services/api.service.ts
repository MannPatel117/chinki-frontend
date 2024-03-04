import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpHeaderOptions:any;
  userData:any;
  header:any;
  constructor(
    public http: HttpClient
  ) { 
    this.setToken();
  }

  setToken(){
    let token: any;
    token = localStorage.getItem('userLogin');
    token = JSON.parse(token)
    if(token){
      this.header = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      }
    }
  }

  loginAdmin(data:any){
    return this.http.post(`${environment.apiUrl}/adminUser/login`, data)
  }
}
