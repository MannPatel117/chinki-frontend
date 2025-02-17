import { NgFor, NgIf } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf, NgFor, NgbDropdownModule, NgbPaginationModule],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss'
})
export class AccountDetailsComponent {
  role:any = 'store';
    loading= false;
    page = 1;
    limit = 10;
    collectionSize= 0;

    inventory = [];
    accountId = '';
    creditorsCount = 0;
    debtorsCount = 0;
    
    supplierData:any;
  
    constructor(
        private fb: FormBuilder, 
        private route: Router,
        private api: ApiService,
        private toastr: ToastrService, 
        private shared: SharedService,
        private excel: ExcelService,
        private router: ActivatedRoute
      ) {
        this.role = localStorage.getItem('role');
        this.inventory = JSON.parse(localStorage.getItem('location') || '[]');
      }
    
    ngOnInit(){
      this.router.paramMap.subscribe(params => {
        this.accountId = params.get('id') || ''; 
        if(this.accountId == ''){
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
          this.route.navigateByUrl('/pos/accounts-master'); 
        }        
      });
      this.loading = false;
      this.checkUserLoggedIn();
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
  
    init(){
      this.getSupplier();
    }

    getSupplier(){
      this.loading = true;
      try{
        this.api.getAPI('/accounts/account/'+this.accountId, []).subscribe((res:any) => {
          this.loading = true;
          if(res.success == true){
            this.supplierData = res.data;
            this.loading = false;
          }else{
            this.loading = false;
            this.toastr.show('error','Something went wrong',{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
            this.route.navigateByUrl('/pos/accounts-master'); 
          }
        }
      ),(error:any)=>{
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
        this.route.navigateByUrl('/pos/accounts-master');
      };
      }
      catch(err){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
        this.route.navigateByUrl('/pos/accounts-master');
      }
    }
}
