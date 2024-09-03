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

  getAllProducts(){
    return this.http.get(`${environment.apiUrl}/products/product?pagination=false`, this.header)
  }
  
  getUserDetail(data:any){
    let params = new HttpParams()
    .set('phone_Number', data)
    return this.http.get(`${environment.apiUrl}/users/getUserbyNumber`, {params:params, headers: this.header.headers})
  }

  addUser(data:any){
    return this.http.post(`${environment.apiUrl}/users/addUser`, data, this.header)
  }

  getAllOffers(){
    return this.http.get(`${environment.apiUrl}/offers/getAllActiveOffers`, this.header)
  }

  getAPI(route:any, params:any){
    const param = this.setParamms(params);
    return this.http.get(`${environment.apiUrl}`+`${route}`, { params:param, headers:this.header.headers })
  }

  patchAPI(route:any, params:any, body:any){
    const param = this.setParamms(params)
    return this.http.patch(`${environment.apiUrl}`+`${route}`, body, { params:param, headers:this.header.headers })
  }

  setParamms(params:any){
    let header = new HttpParams();
    for(let param of params){
      header = header.set(param[0], param[1])
    }
    return header;
  }
}
