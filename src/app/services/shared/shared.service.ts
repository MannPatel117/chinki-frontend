import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { SuccessToast } from '../../toast/success-toast/toast';
import {  ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private api: ApiService, private route: Router, private toastr: ToastrService) { }

  async checkUserLoggedIn(role:any): Promise<boolean>{
    const token= localStorage.getItem('token');
    if (token) {
      try {
        const res: any = await this.api.getAPI('/adminUser/session', [["role", role]]).toPromise();
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

  async multiInventory(): Promise<boolean>{
    const inventory = JSON.parse(localStorage.getItem('location') || '[]');
    if(inventory.length>1){
      this.toastr.show('success','Multiple Inventory Detected',{ toastComponent: SuccessToast,toastClass: "ngx-toastr"})
      return true;
    }
    return false;
  }
}
