import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
    token = localStorage.getItem('token');
    if(token){
      this.header = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      }
    }
  }

  loginAdmin(data:any){
    return this.http.post(`${environment.apiUrl}/adminUser/login`, data)
  }

  getAdminUser(){
    console.log(this.header)
    return this.http.get(`${environment.apiUrl}/adminUser/getUser`, this.header)
  }

  logout(){ 
    console.log(this.header)
    return this.http.post(`${environment.apiUrl}/adminUser/logout`, null, this.header)
  }
}
