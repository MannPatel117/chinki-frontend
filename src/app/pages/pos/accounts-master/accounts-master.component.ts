import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../services/excel/excel.service';
import { SharedService } from '../../../services/shared/shared.service';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { SuccessToast } from '../../../toast/success-toast/toast';
declare const $:any;

@Component({
  selector: 'app-accounts-master',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf, NgFor, NgbDropdownModule, NgbPaginationModule],
  templateUrl: './accounts-master.component.html',
  styleUrl: './accounts-master.component.scss'
})
export class AccountsMasterComponent {

  role:any = 'store';
  loading= false;
  page = 1;
  limit = 10;
  collectionSize= 0;
  inventory = [];

  creditorsCount = 0;
  debtorsCount = 0;
  displayData:any = [];
  currentId:any;

  accountForm!:FormGroup;
  search: FormControl = new FormControl ('');
  subGroup: FormControl = new FormControl ('');


  constructor(
      private fb: FormBuilder, 
      private route: Router,
      private api: ApiService,
      private toastr: ToastrService, 
      private shared: SharedService,
      private excel: ExcelService
    ) {
      this.role = localStorage.getItem('role');
      this.inventory = JSON.parse(localStorage.getItem('location') || '[]');
    }
  
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
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
    this.getAccounts(false, false);
    this.getStats();
  }

  setFormBuilder(){
      this.accountForm = this.fb.group({
        accountName: ['', [Validators.required]],
        aliasName: ['', [Validators.required]],
        phone_Number: [''],
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        pincode: [0],
        subGroup: ['Sundry Creditors', [Validators.required]],
        underGroup: [''],
        paymentTerm: [0],
        gstNumber: [''],
        openingBalanceCredit: [0],
        openingBalanceDebit: [0],
        email: ['']
      })
    }


    getStats(){
        try{
          this.api.getAPI('/accounts/stats', []).subscribe((res:any) => {
            if(res.success == false){
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            }else{
              this.creditorsCount = res.data.creditorsCount;
              this.debtorsCount = res.data.debtorsCount;
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

    getAccounts(filter: boolean, reset:boolean){
      this.loading = true;
      try{
        if(filter == true){
          this.page = 1;
        }
        if(reset == true){
          this.search.setValue("");
          this.subGroup.setValue("");
        }
        this.api.getAPI('/accounts/', [["pagination", true],["search",  this.search.value],["subGroup", this.subGroup.value],["limit", this.limit],["page", this.page]]).subscribe((res:any) => {
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
    }

    printExcel(){
      this.loading = true
      this.api.getAPI('/accounts', [["search",  this.search.value],["subGroup", this.subGroup.value],["pagination", false]]).subscribe((res:any) => {
        if(res.data.length == 0){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }else{
          const data = res.data;
          data.forEach((element:any) => {
            delete element.supplierID;
            delete element.addressLine1;
            delete element.addressLine2;
            delete element.city;
            delete element.state;
            delete element.pincode;
            delete element.openingBalanceCredit;
            delete element.openingBalanceDebit;
            delete element.createdAt;
            delete element.deletedAt;
            delete element.updatedAt;
          });
          this.excel.exportAsExcelFile(data, 'Accounts List', ' Acounts List '+ ((this.search.value).toUpperCase())+ " " + ((this.subGroup.value).toUpperCase()))
          this.loading = false;
        }
      });
    }
  
    printPdf(){
      this.loading = true
      this.api.getAPI('/accounts', [["search",  this.search.value],["subGroup", this.subGroup.value],["pagination", false]]).subscribe((res:any) => {
        if(res.data.length == 0){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }else{
          const data = res.data;
          data.forEach((element:any) => {
            delete element.supplierID;
            delete element.addressLine1;
            delete element.addressLine2;
            delete element.city;
            delete element.state;
            delete element.pincode;
            delete element.openingBalanceCredit;
            delete element.openingBalanceDebit;
            delete element.createdAt;
            delete element.deletedAt;
            delete element.updatedAt;
          });
          this.excel.exportAsPdfFile(data, 'Accounts List', ' Accounts List '+((this.search.value).toUpperCase())+ " " + ((this.subGroup.value).toUpperCase()))
          this.loading = false;
        }
      });
    }

    onCheckboxChange(value: string, event: Event): void {
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked) {
        if(value == 'Sundry Creditors' || value == 'Sundry Debtors'){
          this.subGroup.setValue(value);
        }
      } else {
        if(value == 'Sundry Creditors' || value == 'Sundry Debtors'){
          this.subGroup.setValue("");
        }
      }
    }

    goToAccountDetails(accountId: string) {
      this.route.navigate(['/pos/accounts-master', accountId]); 
    }


    addAccount(){
      this.closeModal('addAccountModal');
          this.loading = true;
          try{
            this.api.postAPI('/accounts/account', [], this.accountForm.value).subscribe((res:any) => {
              this.loading = false;
              if(res.success == 0){
                this.toastr.show('error',res.data,{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
                })
              }else{
                this.toastr.show('success', res.message,{ 
                  toastComponent: SuccessToast,
                  toastClass: "ngx-toastr",
                })
                this.init();
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


    deleteAccount(){
      this.closeModal('deleteAccountModal');
      try{
        this.api.deleteAPI(`/accounts/account/${this.currentId}`, []).subscribe((res:any) => {
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

    openDeleteModal(currentAccount:any){
      this.currentId = currentAccount.supplierID;
      $("#deleteAccountModal").modal('show');
    }
  
  
    openModal(id:any){
      $("#"+id).modal('show');
    }
  
    closeModal(id:any){
      $("#"+id).modal('hide');
    }


}
