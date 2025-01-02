import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared/shared.service';
import { CustomToast } from '../../../custom-toast/toast';
import { ExcelService } from '../../../services/excel/excel.service';
declare const $:any;

@Component({
  selector: 'app-products-master',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf, NgFor, NgbDropdownModule, NgbPaginationModule],
  templateUrl: './products-master.component.html',
  styleUrl: './products-master.component.scss'
})
export class ProductsMasterComponent {

  current_location: any;
  role:any = 'store';
  loading= false;
  page = 1;
  limit = 10;
  collectionSize= 0;

  productForm!: FormGroup;
  search: FormControl = new FormControl ('');
  productType: FormControl = new FormControl ('');
  status: FormControl = new FormControl ('');

  totalActiveProducts = 0;
  totalProducts = 0;
  displayData:any = [];
  currentId:any;

  constructor(
    private fb: FormBuilder, 
    private route: Router,
    private api: ApiService,
    private toastr: ToastrService, 
    private shared: SharedService,
    private excel: ExcelService
  ) {
    this.role = localStorage.getItem('role');
    this.current_location = localStorage.getItem('location')
  }
  
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  init(){
    this.getProducts(false, false);
    this.getStats();
  }

  async checkUserLoggedIn(){
    const session = await this.shared.checkUserLoggedIn();
    if(session){
      this.init()
    } else{
      this.route.navigateByUrl('/login');
      localStorage.clear();
    }
  }

  setFormBuilder(){
    this.productForm = this.fb.group({
      itemName: ['', [Validators.required]],
      aliasName: ['', [Validators.required]],
      barcode: ['', [Validators.required]],
      productType: ['finished'],
      mrp: [0,[Validators.min(0)]],
      discount: [0,[Validators.min(0)]],
      sellingPrice: [0,[Validators.min(0)]],
      wholeSalePrice: [0,[Validators.min(0)]],
      gst: [0,[Validators.min(0)]],
      hsnCode: [''],
      supplierId: [''],
      status: ['active']
    })
  }

  getStats(){
    try{
      this.api.getAPI('/products/stats', []).subscribe((res:any) => {
        if(res.data.length == 0){
          this.loading = false;
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr"
          })
        }else{
          this.totalActiveProducts = res.data.totalActiveProductCount;
          this.totalProducts = res.data.totalProductCount;
          this.loading = false;
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  getProducts(filter: boolean, reset:boolean){
    this.loading = true;
    try{
      if(filter == true){
        this.page = 1;
      }
      if(reset == true){
        this.search.setValue("");
        this.productType.setValue("");
        this.status.setValue("");
      }
      this.api.getAPI('/products/product', [["search",  this.search.value],["productType", this.productType.value],["status", this.status.value],["limit", this.limit],["page", this.page]]).subscribe((res:any) => {
        if(res.data.docs.length == 0){
          this.displayData = res.data.docs;
          this.loading = false;
        }else{
          this.displayData = res.data.docs;
          this.collectionSize = res.data.totalDocs;
          this.loading = false;
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  onCheckboxChange(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if(value == 'finished' || value == 'estimated'){
        this.productType.setValue(value);
      }
      if(value == 'active' || value == 'inactive'){
        this.status.setValue(value);
      }
    } else {
      if(value == 'finished' || value == 'estimated'){
        this.productType.setValue("");
      }
      if(value == 'active' || value == 'inactive'){
        this.status.setValue("");
      }
    }
  }

  calcDiscount(){
    let mrp = this.productForm.get('mrp')?.value;
    let sellingPrice = this.productForm.get('sellingPrice')?.value;
    if(mrp > 0 && sellingPrice > 0){
      let discount = (((mrp-sellingPrice)/mrp)*100);
      this.productForm.get('discount')?.setValue(parseFloat(discount.toFixed(2))) 
    }
  }

  addProduct(){
    this.closeModal('addProductModal');
    this.loading = true;
    try{
      this.api.postAPI('/products/product', [], this.productForm.value).subscribe((res:any) => {
        this.loading = false;
        if(res.data.length == 0){
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr"
          })
        }else{
          this.toastr.show('success', res.message,{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr",
          })
          this.init();
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  printExcel(){
    this.loading = true
    this.api.getAPI('/products/product', [["search",  this.search.value],["productType", this.productType.value],["status", this.status.value],["pagination", false]]).subscribe((res:any) => {
      if(res.data.length == 0){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr"
        })
      }else{
        const data = res.data;
        data.forEach((element:any) => {
          delete element._id;
          delete element.__v;
          delete element.supplierId;
          delete element.img;
          delete element.unit;
        });
        this.excel.exportAsExcelFile(data, 'Products List', ' Products List '+ ((this.search.value).toUpperCase())+ " " + ((this.status.value).toUpperCase())+ " "+ ((this.productType.value).toUpperCase()))
        this.loading = false;
      }
    });
  }

  printPdf(){
    this.loading = true
    this.api.getAPI('/products/product', [["search",  this.search.value],["productType", this.productType.value],["status", this.status.value],["pagination", false]]).subscribe((res:any) => {
      if(res.data.length == 0){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr"
        })
      }else{
        const data = res.data;
        data.forEach((element:any) => {
          delete element._id;
          delete element.__v;
          delete element.supplierId;
          delete element.img;
          delete element.unit;
        });
        this.excel.exportAsPdfFile(data, 'Products List', ' Products List '+((this.search.value).toUpperCase())+ " " + ((this.status.value).toUpperCase())+ " "+ ((this.productType.value).toUpperCase()))
        this.loading = false;
      }
    });
  }

  editProduct(){
    this.closeModal('editProductModal');
    this.loading = true;
    try{
      this.api.patchAPI('/products/product', [['id', this.currentId]], this.productForm.value).subscribe((res:any) => {
        this.loading = false;
        if(res.data.length == 0){
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr"
          })
        }else{
          this.init();
          this.toastr.show('success', res.message,{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr",
          })
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  deleteProduct(){
    this.closeModal('deleteProductModal');
    try{
      this.api.deleteAPI('/products/product', [['id', this.currentId]]).subscribe((res:any) => {
        this.loading = false;
        if(res.data.length == 0){
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr"
          })
        }else{
          this.init();
          this.toastr.show('success', res.message,{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr",
          })
        }
      });
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr"
      })
    }
  }

  openDeleteModal(currentProd:any){
    this.currentId = currentProd._id;
    $("#deleteProductModal").modal('show');
  }

  openEditModal(currentProd:any){
    this.currentId = currentProd._id;
    this.setFormValues(currentProd, this.productForm);
    $("#editProductModal").modal('show');
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

  logout(){
    this.route.navigateByUrl('/login');
    localStorage.clear();
  }
}
