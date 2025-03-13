import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared/shared.service';
import { SuccessToast } from '../../../toast/success-toast/toast';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { ExcelService } from '../../../services/excel/excel.service';
declare const $:any;

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf, NgFor, NgbDropdownModule, NgbPaginationModule, DatePipe],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.scss'
})
export class UserHistoryComponent {

  role:any = 'store';
  loading= false;
  page = 1;
  limit = 10;
  collectionSize= 0;

  userForm!: FormGroup;
  search: FormControl = new FormControl ('');
  type: FormControl = new FormControl ('');
  order: FormControl = new FormControl ('');
  customerType: FormControl = new FormControl ('');

  totalUsers = 0;
  displayData:any = [];
  currentId:any;

  historyData:any = [];
  historyName:string ='';
  historyNumber:string='';
  historySales:Number = 0;
  historyPointsRedeemed: Number = 0;

  rewardsData:any = [];
  rewardsEarned:Number = 0;
  rewardsRedeemed: Number = 0;

  constructor(
    private fb: FormBuilder, 
    private route: Router,
    private api: ApiService,
    private toastr: ToastrService, 
    private shared: SharedService,
    private excel: ExcelService
  ) {
    this.role = localStorage.getItem('role');
  }
  
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  init(){
    this.getUsers(false, false);
    this.getStats();
  }

  async checkUserLoggedIn(){
    let role = localStorage.getItem('role');
    const session = await this.shared.checkUserLoggedIn(role);
    if(session){
      this.init()
    } else{
      this.route.navigateByUrl('/login');
      localStorage.clear();
    }
  }

  setFormBuilder(){
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      addressLine1: [''],
      addressLine2: [''],
      addressLine3: [''],
      customerType: [''],
      city: [''],
      state: [''],
      pincode: [0],
      rewardPoint: [0]  
    })
  }

  getStats(){
    try{
      this.api.getAPI('/users/stats', []).subscribe((res:any) => {
        if(res.success == false){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }else{
          this.totalUsers = res.data.userCount;
          this.loading = false;
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  getUsers(filter: boolean, reset:boolean){
    this.loading = true;
    try{
      if(filter == true){
        this.page = 1;
      }
      if(reset == true){
        this.search.setValue("");
        this.type.setValue("");
        this.order.setValue("");
        this.customerType.setValue("");
      }
      this.api.getAPI('/users/', [["pagination", true],["search",  this.search.value],["sortField", this.type.value],["sortOrder", this.order.value],["customerType", this.customerType.value],["limit", this.limit],["page", this.page]]).subscribe((res:any) => {
        this.loading = true;
        if(res.data.data.length == 0){
          this.displayData = res.data.data;
          this.loading = false;
        }else{
          this.displayData = res.data.data;
          this.collectionSize = res.data.pagination.totalRecords;
          this.loading = false;
        }
      }
    ),(error:any)=>{
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    };
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    }
    this.loading= false;
  }

  onCheckboxChange(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if(value == 'rewardPoint' || value == 'createdAt'){
        this.type.setValue(value);
      }
      if(value == 'asc' || value == 'desc'){
        this.order.setValue(value);
      }
      if(value == 'new' || value == 'existing'){
        this.customerType.setValue(value)
      }
    } else {
      if(value == 'rewardPoint' || value == 'createdAt'){
        this.type.setValue("");
      }
      if(value == 'asc' || value == 'desc'){
        this.order.setValue("");
      }
      if(value == 'new' || value == 'existing'){
        this.customerType.setValue("")
      }
    }
  }

  addUser(){
      this.closeModal('addUser');
      this.loading = true;
      try{
        this.api.postAPI('/users/user', [], this.userForm.value).subscribe((res:any) => {
          this.loading = false;
          if(res.success == true){
            this.toastr.show('success', res.message,{ 
              toastComponent: SuccessToast,
              toastClass: "ngx-toastr",
            })
            this.init();
          }else{
            this.toastr.show('error',res.data,{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
          }
        }, (err:any)=>{
          this.loading = false;
          this.toastr.show('error',err.error.data,{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        });
      }
      catch(err){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      }
    }
  
    printExcel(){
      this.loading = true
      this.api.getAPI('/users', [["search",  this.search.value],["pagination", false], ["customerType", this.customerType.value]]).subscribe((res:any) => {
        if(res.data.length == 0){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }else{
          const data = res.data;
          data.forEach((element:any) => {
            delete element.updatedAt;
            if (element.createdAt) {
              const date = new Date(element.createdAt);
              element.createdAt = date.toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false // Set to true if you want AM/PM format
              });
            }
          });
          this.excel.exportAsExcelFile(data, 'Users List', ' Users List '+ ((this.search.value).toUpperCase()))
          this.loading = false;
        }
      });
    }
  
    printPdf(){
      this.loading = true
      this.api.getAPI('/users', [["search",  this.search.value],["pagination", false], ["customerType", this.customerType.value]]).subscribe((res:any) => {
        if(res.data.length == 0){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }else{
          const data = res.data;
          data.forEach((element:any) => {
            delete element.updatedAt;
            delete element.addressLine3;
            if (element.createdAt) {
              const date = new Date(element.createdAt);
              element.createdAt = date.toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false // Set to true if you want AM/PM format
              });
            }
          });
          this.excel.exportAsPdfFile(data, 'User List', ' Users List '+((this.search.value).toUpperCase()))
          this.loading = false;
        }
      });
    }
  
    editUser(){
      this.closeModal('editUser');
      this.loading = true;
      try{
        this.api.putAPI(`/users/user/${this.currentId}`, [], this.userForm.value).subscribe((res:any) => {
          this.loading = false;
          if(res.success == false){
            this.toastr.show('error','Something went wrong',{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
          }else{
            this.init();
            this.toastr.show('success', res.message,{ 
              toastComponent: SuccessToast,
              toastClass: "ngx-toastr",
            })
          }
        });
      }
      catch(err){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      }
    }
  
    confirmUser(){
      const phnNumber = this.userForm.get('phoneNumber')?.value;
      if(phnNumber.length != 10){
        this.toastr.show('error','Enter valid phone number',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      } else {
        this.closeModal('searchAddUser');
        this.loading = true;
        
        this.api.getAPI('/users/user/'+phnNumber, []).subscribe((res:any) => {
          if(res.success == true){
            const data = res.data;
            this.search.setValue(phnNumber);
            this.getUsers(true, false);
            this.loading = false;
            this.toastr.show('error','User already exists',{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
          }else{
            this.loading = false;
            $("#addUser").modal('show'); 
            this.userForm.get('phoneNumber')?.setValue(phnNumber);
          }
        });
      }
      
    }
  
    
    openEditModal(currentProd:any){
      this.currentId = currentProd.phoneNumber;
      this.setFormValues(currentProd, this.userForm);
      $("#editUser").modal('show');
    }
  
    openViewModal(data:any){
      this.currentId = data.phoneNumber;
      this.setFormValues(data, this.userForm);
      $("#viewUser").modal('show');
    }

    openViewHistoryModal(data:any){
      this.historyName = data.name;
      this.historyNumber = data.phoneNumber;
      this.api.getAPI('/users/history', [['phoneNumber', data.phoneNumber]]).subscribe((res:any) => {
        if(res.success == true){
          this.historyData = res.data.bills;
          this.historySales = res.data.totalSpent;
          this.historyPointsRedeemed = res.totalRewardPointsUsed;
          this.loading = false;
        }else{
          this.loading = false;   
          this.toastr.show('error',res.message,{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }
      });
      $("#userHistory").modal('show');
    }

    openViewRewardsModal(data:any){
      this.historyName = data.name;
      this.historyNumber = data.phoneNumber;
      this.api.getAPI('/users/rewards', [['phoneNumber', data.phoneNumber]]).subscribe((res:any) => {
        if(res.success == true){
          this.rewardsData = res.data.rewards;
          this.rewardsRedeemed = res.data.totalRedeemed;
          this.rewardsEarned = res.totalEarned;
          this.loading = false;
        }else{
          this.loading = false;   
          this.toastr.show('error',res.message,{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }
      });
      $("#userRewards").modal('show');
    }
  
    setFormValues(currentProd: any, form: FormGroup) {
      Object.keys(currentProd).forEach(key => {
        if (form.get(key)) {
          form.get(key)?.setValue(currentProd[key]);
        }
      });
    }
  
    openModal(id:any){
      $("#"+id).modal('show'); 
      this.setFormBuilder();
    }
  
    closeModal(id:any){
      $("#"+id).modal('hide');
    }
}
