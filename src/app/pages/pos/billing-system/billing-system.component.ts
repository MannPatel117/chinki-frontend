import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { StoreBillDataService } from '../../../services/store-bill-data.service';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CustomToast } from '../../../custom-toast/toast';
declare const $:any;

@Component({
  selector: 'app-billing-system',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterModule, ReactiveFormsModule],  
  templateUrl: './billing-system.component.html',
  styleUrl: './billing-system.component.scss'
})
export class BillingSystemComponent {
  loading = false;
  currentActiveInvoice : string = 'A'
  currentActiveInvoiceData : any;
  currentBillTableData: any[][] = [];
  current_invoiceNumber: any;
  current_billNumber: any;
  userForm!: FormGroup;
  addUserForm!: FormGroup;
  phnNumber:FormControl = new FormControl('', [Validators.minLength(10), Validators.maxLength(10), Validators.required]);

  constructor(private fb: FormBuilder,
     private route: Router,
     private api: ApiService,
     private billData: StoreBillDataService,
     private toastr: ToastrService) {

  }
  
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.invoiceSwitcher('A');
    this.initializeEmptyTable();
    this.setFormBuilder();
  }

  checkUserLoggedIn(){
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAdminUser().subscribe((res:any) =>{
        if(res){
          let location = res.data.location
          this.fetchData(location)
        }
      }, (error) =>{
        this.route.navigateByUrl('/login');
        this.loading = false;
      })
    }
    else{
        this.route.navigateByUrl('/login');
        this.loading = false;
    }
  }

  fetchData(location:any){
    this.api.getInventory(location).subscribe((res:any) =>{
      let invoiceNumber = res.data[0].invoiceNumber;
      this.userForm.get('invoiceNumber')?.setValue(invoiceNumber);
      this.loading = false;
    })
  }

  searchUser(){
    if(this.phnNumber.valid){
      let data = this.phnNumber.value;
      this.api.getUserDetail(data).subscribe((res:any) =>{
      this.loading = true;
      if(res.data.length !=0){
        const data = res.data[0]
        this.userForm.get('phnNumber')?.setValue(data.phone_Number)
        this.userForm.get('name')?.setValue(data.name)
        this.userForm.get('address')?.setValue(data.address.addressLine2)
        this.userForm.get('rewardPoints')?.setValue(data.rewardPoint)
        this.userForm.get('customerType')?.setValue("Existing Customer")
        this.closeModal('getUserModal');
        this.toastr.show('success','User found',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr",
        })
        this.loading = false;
      }
      else{
        this.closeModal('getUserModal');
        this.toastr.show('error','User not found',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr",
          })
          this.loading = false;
          this.addUserForm.get('phnNumber')?.setValue(data);
        this.openModal('addUserModal')
      }
    })
    }
  }

  addUser(){
    if(!this.addUserForm.invalid){
      this.loading = true;
      const input = this.addUserForm.value;
      const obj = {
        "name": input.name,
        "phone_Number": input.phnNumber,
        "address": {
            "addressLine1": input.addressL1,
            "addressLine2": input.addressL2,
            "addressLine3": input.addressL3,
            "city": input.city,
            "state": input.state,
            "pincode":  input.pincode
        },
        "rewardPoint": 0,
        "rewardPointsHistory":[],
        "totalTransaction": 0
      }
      this.api.addUser(obj).subscribe((res:any)=>{
        if(res){
          const data = res.data;
          this.userForm.get('phnNumber')?.setValue(data.phone_Number)
          this.userForm.get('name')?.setValue(data.name)
          if(data.address){
            this.userForm.get('address')?.setValue(data.address.addressLine2)
          }
          else{
            this.userForm.get('address')?.setValue('')
          }
          this.userForm.get('rewardPoints')?.setValue(data.rewardPoint)
          this.userForm.get('customerType')?.setValue("New Customer")
          this.closeModal('addUserModal');
          this.toastr.show('success','User created',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr",
          })
          this.loading = false;
        }
      }, (error)=>{
        console.log(error)
        this.loading = false;
        this.toastr.show('error','User not created',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr"
        })
      })
    }
  }

  invoiceSwitcher(invoiceNumer:string){
    switch(invoiceNumer){
      case 'A': 
        this.currentActiveInvoice='A';
        this.currentActiveInvoiceData = this.billData.getData('A');
      break;
      case 'B':
        this.currentActiveInvoice='B';
        this.currentActiveInvoiceData = this.billData.getData('B');
      break;
      case 'C':
        this.currentActiveInvoice='C';
        this.currentActiveInvoiceData = this.billData.getData('C');
      break;
    }
    console.log(this.currentActiveInvoiceData)
  }

  setFormBuilder(){
    this.userForm = this.fb.group({
      invoiceNumber: [''],
      name: [''],
      phnNumber: [''],
      address: [''],
      rewardPoints: [''],
      customerType: [''],
      paymentType: ['']
    });

    this.addUserForm = this.fb.group({
      name: [''],
      phnNumber: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.required]],
      addressL1: [''],
      addressL2: [''],
      addressL3: [''],
      city: [''],
      state: [''],
      pincode: [0, [Validators.minLength(6), Validators.maxLength(6)]]
    })
  }

  initializeEmptyTable(){
    const screenHeight = window.innerHeight;
    if(screenHeight <= 600){
      this.currentBillTableData = [
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
      ]
    }
    if(screenHeight> 600 && screenHeight < 700){
      this.currentBillTableData = [
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""]
      ]
    }
    if(screenHeight >=700 && screenHeight <= 900){
      this.currentBillTableData = [
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""]
      ]
    }
    if(screenHeight > 900){
      this.currentBillTableData = [
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""],
        ["","","","","","","","","",""]
      ]
    }
  }

  openModal(id:any){
    $("#"+id).modal('show');
  }

  closeModal(id:any){
    $("#"+id).modal('hide');
  }

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }
}
