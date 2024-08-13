import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  loginAPI(route:any, body:any){
    return this.http.post(`${environment.apiUrl}`+`${route}`, body)
  }

  getAPI(route:any, params:any){
    const param = this.setParamms(params);
    return this.http.get(`${environment.apiUrl}`+`${route}`, { params:param, headers:this.header.headers })
  }

  patchAPI(route:any, params:any, body:any){
    const param = this.setParamms(params)
    return this.http.patch(`${environment.apiUrl}`+`${route}`, body, { params:param, headers:this.header.headers })
  }

  postAPI(route:any, params:any, body:any){
    const param = this.setParamms(params)
    return this.http.post(`${environment.apiUrl}`+`${route}`, body, { params:param, headers:this.header.headers })
  }

  deleteAPI(route: any, params: any){
    const param = this.setParamms(params);
    return this.http.delete(`${environment.apiUrl}` + `${route}`, { params: param, headers: this.header.headers });
  }

  setParamms(params:any){
    let header = new HttpParams();
    for(let param of params){
      header = header.set(param[0], param[1])
    }
    return header;
  }
}
