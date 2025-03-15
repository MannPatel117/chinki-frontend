import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api/api.service';
import { ExcelService } from '../../../services/excel/excel.service';
import { SharedService } from '../../../services/shared/shared.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { SuccessToast } from '../../../toast/success-toast/toast';
declare const $:any;
@Component({
  selector: 'app-bill-history',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf, NgFor, NgbDropdownModule, NgbPaginationModule, DatePipe, NgClass],
  templateUrl: './bill-history.component.html',
  styleUrl: './bill-history.component.scss'
})
export class BillHistoryComponent {
  role:any = 'store';
    loading= false;
    page = 1;
    limit = 10;
    collectionSize= 0;
    inventory = [];
    accountsName: any = [];
    inventoryName : any = [];
    creditorsCount = 0;
    debtorsCount = 0;
    displayData:any = [];
    currentId:any;
    currentTransaction = '';
    
    transactionForm!:FormGroup;
  
    search: FormControl = new FormControl ('');
  
    transactionType: FormControl = new FormControl([]);
    accountsFilter: FormControl = new FormControl([]);
    inventoryFilter: FormControl = new FormControl([]);
    paymentFilter: FormControl = new FormControl([]);
    dateFilterFrom: FormControl = new FormControl("");
    dateFilterTo: FormControl = new FormControl("");
  
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
          this.inventoryFilter.setValue(this.inventory);
          this.shared.multiInventory();
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
          this.getAccountsTransaction(false, false);
          this.getStats();
          this.fetchFilterInfo();
        }
      
        setFormBuilder(){
            this.transactionForm = this.fb.group({
              transactionType: ['', [Validators.required]],
              challanNumber: [null],
              selectInventoryName: [''],
              challanDate: [null],
              documentNumber: [null],
              supplier: [0, [Validators.required]],
              inventory: [0, [Validators.min(1)]],
              billNumber: [null],
              billDate: [null],
              paymentType: [''],
              chequeNo: [null],
              chequeDate: [null],
              remark: [null],
              finalAmt: [0],
              actionBy: ['']
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
  
          fetchFilterInfo(){
            this.loading = true;
            try{
              this.api.getAPI('/accounts/accounts', []).subscribe((res:any)=>{
                if(res.success == true){
                  this.accountsName = res.data;
                  this.loading = false;
                } else{
                  this.loading = false;
                  this.toastr.show('error','Something went wrong',{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
              })
                }
              });
              this.api.getAPI('/inventorys', [["pagination", false], ["inventory", JSON.stringify(this.inventory)]]).subscribe((res:any) => {
                this.loading = true;
                if(res.success == true){
                  this.inventoryName = res.data;
                  this.loading = false;
                  
                }else{
                  this.loading = false;
                  this.toastr.show('error','Something went wrong',{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
              })
                  
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
            catch(error){
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            }
          }
      
          getAccountsTransaction(filter: boolean, reset:boolean){
            this.loading = true;
            try{
              if(filter == true){
                this.page = 1;
              }
              if(reset == true){
                this.search.setValue("");
                this.transactionType.setValue("");
                this.inventoryFilter.setValue(this.inventory);
                this.accountsFilter.setValue("");
                this.paymentFilter.setValue("");
                this.dateFilterFrom.setValue("");
                this.dateFilterTo.setValue("");
              }
              this.api.getAPI('/accountTransaction/', [["pagination", true],["search",  this.search.value],["transactionType", JSON.stringify(this.transactionType.value)],["limit", this.limit],["page", this.page], ["inventory", JSON.stringify(this.inventoryFilter.value)], ["supplierID", JSON.stringify(this.accountsFilter.value)], ["paymentType", JSON.stringify(this.paymentFilter.value)], ["fromDate", this.dateFilterFrom.value], ["toDate", this.dateFilterTo.value]]).subscribe((res:any) => {
                this.loading = true;
                if(res.success == false){
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
            this.api.getAPI('/accountTransaction/', [["pagination", false],["search",  this.search.value],["transactionType", JSON.stringify(this.transactionType.value)],["limit", this.limit],["page", this.page], ["inventory", JSON.stringify(this.inventoryFilter.value)], ["supplierID", JSON.stringify(this.accountsFilter.value)], ["paymentType", JSON.stringify(this.paymentFilter.value)], ["fromDate", this.dateFilterFrom.value], ["toDate", this.dateFilterTo.value]]).subscribe((res:any) => {
              if(res.data.length == 0){
                this.loading = false;
                this.toastr.show('error','Something went wrong',{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
                })
              }else{
                const data = res.data;  
                data.forEach((element: any) => {
                  // Add the supplierName and inventoryName to the top level
                  element.supplierName = element.Supplier.accountName;
                  element.inventoryName = element.Inventory.inventoryName;
                  
                  // Delete unnecessary properties
                  delete element.from;
                  delete element.to;
                  delete element.supplier;
                  delete element.transactionID;
                  delete element.deletedAt;
                  delete element.updatedAt;
                  delete element.Supplier;  // Remove the Supplier object after extracting name
                  delete element.Inventory;  // Remove the Inventory object after extracting name
                });
                this.excel.exportAsExcelFile(data, 'Accounts List', ' Accounts List')
                this.loading = false;
              }
            });
          }
        
          printPdf(){
            this.loading = true
            this.api.getAPI('/accountTransaction/', [["pagination", true],["search",  this.search.value],["transactionType", JSON.stringify(this.transactionType.value)],["limit", this.limit],["page", this.page], ["inventory", JSON.stringify(this.inventoryFilter.value)], ["supplierID", JSON.stringify(this.accountsFilter.value)], ["paymentType", JSON.stringify(this.paymentFilter.value)], ["fromDate", this.dateFilterFrom.value], ["toDate", this.dateFilterTo.value]]).subscribe((res:any) => {
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
                this.excel.exportAsPdfFile(data, 'Accounts List', ' Accounts List '+((this.search.value).toUpperCase())+ " " + ((this.transactionType.value).toUpperCase()))
                this.loading = false;
              }
            });
          }
      
          onCheckboxChange(value: string, event: Event): void {
            const checkbox = event.target as HTMLInputElement;
            let selectedValues = [...this.transactionType.value];
  
            if (checkbox.checked) {
              // Add the value if it's checked
              if (!selectedValues.includes(value)) {
                selectedValues.push(value);
              }
            } else {
              // Remove the value if unchecked
              selectedValues = selectedValues.filter(item => item !== value);
            }
  
            this.transactionType.setValue(selectedValues);
          }
  
          onCheckboxChangeAccount(value: string, event: Event): void {
            const checkbox = event.target as HTMLInputElement;
            let selectedValues = [...this.accountsFilter.value];
  
            if (checkbox.checked) {
              // Add the value if it's checked
              if (!selectedValues.includes(value)) {
                selectedValues.push(value);
              }
            } else {
              // Remove the value if unchecked
              selectedValues = selectedValues.filter(item => item !== value);
            }
  
            this.accountsFilter.setValue(selectedValues);
            console.log(this.accountsFilter.value);
          }
          
          onCheckboxChangeInventory(value: string, event: Event): void {
            const checkbox = event.target as HTMLInputElement;
            let selectedValues = [...this.inventoryFilter.value];
  
            if (checkbox.checked) {
              // Add the value if it's checked
              if (!selectedValues.includes(value)) {
                selectedValues.push(value);
              }
            } else {
              // Remove the value if unchecked
              selectedValues = selectedValues.filter(item => item !== value);
            }
  
            this.inventoryFilter.setValue(selectedValues);
            console.log(this.inventoryFilter.value);
          }
  
          onCheckboxChangePayment(value: string, event: Event): void {
            const checkbox = event.target as HTMLInputElement;
            let selectedValues = [...this.paymentFilter.value];
  
            if (checkbox.checked) {
              // Add the value if it's checked
              if (!selectedValues.includes(value)) {
                selectedValues.push(value);
              }
            } else {
              // Remove the value if unchecked
              selectedValues = selectedValues.filter(item => item !== value);
            }
  
            this.paymentFilter.setValue(selectedValues);
          }
      
          addTransaction(){
            $("#add"+this.currentTransaction).modal('hide');
                this.loading = true;
                try{
                  this.api.postAPI('/accountTransaction/accountTransaction', [], this.transactionForm.value).subscribe((res:any) => {
                    this.loading = false;
                    if(res.success == false){
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
  
          editProduct(){
            this.closeEditModal('editpaymentreceipt');
            this.loading = true;
            try{
              this.api.putAPI(`/accountTransaction/accountTransaction/${this.currentId}`, [], this.transactionForm.value).subscribe((res:any) => {
                this.loading = false;
                if(res.data.length == 0){
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
      
      
          deleteTransaction(){
            this.closeModal('deleteModal');
            try{
              this.api.deleteAPI(`/accountTransaction/accountTransaction/${this.currentId}`, []).subscribe((res:any) => {
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
      
          
          goToPurchase(inventoryID: string) {
            this.route.navigate(['/pos/accounts/transactions/goods', inventoryID]); 
          }
  
          inventorySelected(){
            $("#selectInventory").modal('hide');
            this.loading = true;
            const id = this.transactionForm.get('inventory')?.value; 
            try{
              this.api.getAPI('/inventorys/inventory/'+id, [["details", false]]).subscribe((res:any)=>{
                if(res.success == true){
                  const data = res.data;
                  if(this.currentTransaction == "purchase"){
                    this.goToPurchase(id);
                  } else if(this.currentTransaction == "receipt"){
                    this.transactionForm.get('transactionType')?.setValue("receipt");
                    this.transactionForm.get('documentNumber')?.setValue(data.receiptVoucherDocNo); 
                  } else if(this.currentTransaction == "payment"){
                    this.transactionForm.get('transactionType')?.setValue("payment");
                    this.transactionForm.get('documentNumber')?.setValue(data.paymentVoucherDocNo); 
                  }
                  $("#add"+this.currentTransaction).modal('show');
                  this.transactionForm.get('supplier')?.enable(); 
                  this.transactionForm.get('paymentType')?.enable(); 
                } else{
                  this.loading = false;
                  this.toastr.show('error','Something went wrong',{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
              })
                }
              })
            ,(error:any)=>{
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            };
            }
            catch(error){
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            }
          }
  
          getInventoryName(inventoryID: number) {
            return this.inventoryName.find((inv: { inventoryID: number; }) => inv.inventoryID === inventoryID)?.inventoryName || 'N/A';
        }
  
        openDeleteModal(currentItem:any){
          this.currentId = currentItem.transactionID;
          $("#deleteModal").modal('show');
        }
      
        openModalAddTrans(id:any){
          this.transactionForm.reset();
          this.currentTransaction=id;
          if(this.inventory.length >1){
            $("#selectInventory").modal('show');
            this.shared.multiInventory();
          } else if(this.inventory.length == 1){
            let inventory = this.inventory[0];
            this.transactionForm.get('inventory')?.setValue(inventory);
            this.transactionForm.get('selectInventoryName')?.setValue(this.getInventoryName(inventory));
            this.inventorySelected();
          } else{
            $("#noInventory").modal('show');
          }
        } 
  
  
          openModal(id:any){
            $("#"+id).modal('show');
          }
        
          closeModal(id:any){
            $("#"+id).modal('hide');
          }
  
          openViewModal(currentItem:any){
            this.currentId = currentItem.transactionID;
            if(currentItem.transactionType == 'purchase'){
              this.route.navigate([`/pos/accounts/transactions/goodsAction`, this.currentId, 'view']); 
            } else{
              this.setFormValues(currentItem, this.transactionForm);
              this.transactionForm.get('supplier')?.disable(); 
              this.transactionForm.get('paymentType')?.disable(); 
              $("#viewpaymentreceipt").modal('show');
            }
          }
  
          closeViewModal(id:any){
            this.transactionForm.get('supplier')?.enable(); 
            this.transactionForm.get('paymentType')?.enable(); 
            $("#"+id).modal('hide');
          }
  
          openEditModal(currentItem:any){
            this.currentId = currentItem.transactionID;
            if(currentItem.transactionType == 'purchase'){
              this.route.navigate([`/pos/accounts/transactions/goodsAction`, this.currentId, 'edit']); 
            } else{
              this.setFormValues(currentItem, this.transactionForm);
                this.transactionForm.get('supplier')?.disable(); 
                $("#editpaymentreceipt").modal('show');
            }
          }
  
          closeEditModal(id:any){
            this.transactionForm.get('supplier')?.enable(); 
            $("#"+id).modal('hide');
          }
  
          setFormValues(currentItem: any, form: FormGroup) {
            Object.keys(currentItem).forEach(key => {
              if (form.get(key)) {
                form.get(key)?.setValue(currentItem[key]);
              }
            });
          }
}
