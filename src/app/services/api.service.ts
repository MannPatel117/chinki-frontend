import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
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
    return this.http.get(`${environment.apiUrl}/adminUser/getUser`, this.header)
  }

  logout(){ 
    return this.http.post(`${environment.apiUrl}/adminUser/logout`, null, this.header)
  }

  getInventory(data:any){
    let params = new HttpParams()
    .set('location', data)
    return this.http.get(`${environment.apiUrl}/inventory/getInventorybyLocation`, {params:params, headers: this.header.headers})
  }
  
  getUserDetail(data:any){
    let params = new HttpParams()
    .set('phone_Number', data)
    return this.http.get(`${environment.apiUrl}/users/getUserbyNumber`, {params:params, headers: this.header.headers})
  }
}
