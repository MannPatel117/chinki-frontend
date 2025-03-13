import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared/shared.service';
import { SuccessToast } from '../../../toast/success-toast/toast';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { ExcelService } from '../../../services/excel/excel.service';

declare const $: any;

@Component({
  selector: 'app-offers-master',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgFor,
    NgbDropdownModule,
    NgbPaginationModule,
    DatePipe,
    NgClass
  ],
  templateUrl: './offers-master.component.html',
  styleUrl: './offers-master.component.scss',
})
export class OffersMasterComponent {
  role: any = 'store';
  loading = false;
  page = 1;
  limit = 10;
  collectionSize = 0;

  search: FormControl = new FormControl('');

  displayData: any = [];
  currentId: any;

  rewardsData: any = [];
  rewardsEarned: Number = 0;
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

  ngOnInit() {
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
    this.setCouponForm();
  }

  init() {
    this.getOffers(false, false);
    this.getStats();
  }

  async checkUserLoggedIn() {
    let role = localStorage.getItem('role');
    const session = await this.shared.checkUserLoggedIn(role);
    if (session) {
      this.init();
    } else {
      this.route.navigateByUrl('/login');
      localStorage.clear();
    }
  }

  offerForm!: FormGroup;
  couponForm!: FormGroup;

  setFormBuilder() {
    this.offerForm = this.fb.group({
      offerName: ['', [Validators.required]],
      offerType: ['', [Validators.required]],
      minOrderValue: [],
      discountAmount: [],
      discountPerc: [],
      freeProductID: [],
      productName: [''],
      productBarcode: [''],
      isActive: [''],
      inventory: [[]],
    });
  }

  setCouponForm() {
    this.couponForm = this.fb.group({
      offerName: [''],
      offerID: ['', [Validators.required]],
      quantity: [0, [Validators.min(1)]],
    });
  }

  totalActiveOffers = 0;
  totalOffers = 0;

  getStats() {
    try {
      this.api.getAPI('/offers/stats', []).subscribe((res: any) => {
        if (res.success == false) {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          this.totalActiveOffers = res.data.activeCount;
          this.totalOffers = res.data.totalCount;
          this.loading = false;
        }
      });
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
  }

  searchProduct() {
    this.api
      .getAPI('/products/', [
        ['pagination', false],
        ['search', this.offerForm.get('productBarcode')?.value],
      ])
      .subscribe((res: any) => {
        this.loading = true;
        if (res.data == 0) {
          this.toastr.show('error', 'Product not found', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
          this.loading = false;
        } else {
          const data = res.data[0];
          this.offerForm.get('freeProductID')?.setValue(data.productID);
          this.offerForm.get('productName')?.setValue(data.productName);
          this.toastr.show('success', 'Product found', {
            toastComponent: SuccessToast,
            toastClass: 'ngx-toastr',
          });
          this.loading = false;
        }
      });
  }

  openModal(id: any) {
    $('#' + id).modal('show');
    if (id == 'add-offer') {
      this.api.getAPI('/inventorys/ids', []).subscribe((res: any) => {
        if (res.success == false) {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        }
      });
    }
    this.setFormBuilder();
  }

  couponOffers:any = []

  openGenerateCoupon(id: any) {
    this.setCouponForm();
    this.loading = true;
    try {
      this.api
        .getAPI('/offers/', [
          ['pagination', false],
          ['status', true],
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.data.length == 0) {
            this.couponOffers = res.data;
            this.loading = false;
          } else {
            this.couponOffers = res.data;
            this.loading = false;
            console.log(this.couponOffers)
          }
        }),
        (error: any) => {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        };
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
    this.loading = false;
    
    $('#' + id).modal('show');
  }

  addOffer() {
    this.closeModal('add-offer');
    this.loading = true;
    try {
      this.api.postAPI('/offers/offer', [], this.offerForm.value).subscribe(
        (res: any) => {
          this.loading = false;
          if (res.success == true) {
            this.toastr.show('success', res.message, {
              toastComponent: SuccessToast,
              toastClass: 'ngx-toastr',
            });
            this.init();
          } else {
            this.toastr.show('error', res.data, {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          }
        },
        (err: any) => {
          this.loading = false;
          this.toastr.show('error', err.error.data, {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        }
      );
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
  }

  couponsData:any = [];

  generateCoupons(){
    this.closeModal('generate-coupons');
    this.loading = true;
    try {
      this.api.postAPI('/offers/coupons', [], this.couponForm.value).subscribe(
        (res: any) => {
          this.loading = false;
          if (res.success == true) {
            this.toastr.show('success', res.message, {
              toastComponent: SuccessToast,
              toastClass: 'ngx-toastr',
            });
            this.couponsData = res.data
          } else {
            this.toastr.show('error', res.data, {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          }
        },
        (err: any) => {
          this.loading = false;
          this.toastr.show('error', err.error.data, {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        }
      );
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
    $('#generated-coupons').modal('show');
  }

  copyAllCoupons() {
    const allCoupons = this.couponsData.map((c:any) => c.couponID).join(', ');
    navigator.clipboard.writeText(allCoupons).then(() => {
      this.toastr.show('success', "Coupons copied", {
        toastComponent: SuccessToast,
        toastClass: 'ngx-toastr',
      });
    }).catch(err => {
      this.toastr.show('error', "Coupons could not copy", {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    });
    
  }

  getOffers(filter: boolean, reset: boolean) {
    this.loading = true;
    try {
      if (filter == true) {
        this.page = 1;
      }
      if (reset == true) {
        this.search.setValue('');
        this.status.setValue('');
        this.offerType.setValue('');
      }
      this.api
        .getAPI('/offers/', [
          ['pagination', true],
          ['search', this.search.value],
          ['status', this.status.value],
          ['offerType', this.offerType.value],
          ['limit', this.limit],
          ['page', this.page],
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.data.data.length == 0) {
            this.displayData = res.data.data;
            this.loading = false;
          } else {
            this.displayData = res.data.data;
            this.collectionSize = res.data.pagination.totalRecords;
            this.loading = false;
          }
        }),
        (error: any) => {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        };
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
    this.loading = false;
  }

  status: FormControl = new FormControl('');
  offerType: FormControl = new FormControl('');

  onCheckboxChange(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (value == 'true' || value == 'false') {
        this.status.setValue(value);
      }
      if (value == 'free_product' || value == 'flat_discount') {
        this.offerType.setValue(value);
      }
    } else {
      if (value == 'true' || value == 'false') {
        this.status.setValue('');
      }
      if (value == 'free_product' || value == 'flat_discount') {
        this.offerType.setValue('');
      }
    }
  }

  printExcel() {
    this.loading = true;
    this.api
      .getAPI('/offers/', [
        ['pagination', false],
        ['search', this.search.value],
        ['status', this.status.value],
        ['offerType', this.offerType.value],
      ])
      .subscribe((res: any) => {
        if (res.data.length == 0) {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          const data = res.data;
          data.forEach((element: any) => {
            delete element.updatedAt;
            delete element.offerID;
            delete element.inventory;
            element.productName = '';
            if (element.FreeProduct) {
              element.productName = element.FreeProduct.productName;
              element.barcode = element.FreeProduct.barcode;
              delete element.FreeProduct; // Remove FreeProduct object
            }
            delete element.createdAt;
            delete element.freeProductID;
            delete element.FreeProduct;
          });
          this.excel.exportAsExcelFile(data, 'Offer List', ' Offer List ');
          this.loading = false;
        }
      });
  }

  printPdf() {
    this.loading = true;
    this.api
      .getAPI('/offers/', [
        ['pagination', false],
        ['search', this.search.value],
        ['status', this.status.value],
        ['offerType', this.offerType.value],
      ])
      .subscribe((res: any) => {
        if (res.data.length == 0) {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          const data = res.data;
          data.forEach((element: any) => {
            delete element.updatedAt;
            delete element.offerID;
            delete element.inventory;
            element.productName = '';
            if (element.FreeProduct) {
              element.productName = element.FreeProduct.productName;
              element.barcode = element.FreeProduct.barcode;
              delete element.FreeProduct; // Remove FreeProduct object
            }
            delete element.createdAt;
            delete element.freeProductID;
            delete element.FreeProduct;
          });
          this.excel.exportAsPdfFile(data, 'Offers List', ' Offers List ');
          this.loading = false;
        }
      });
  }

  openViewModal(data: any) {
    this.currentId = data.offerID;
    this.setFormValues(data, this.offerForm);
    this.offerForm.get('offerType')?.disable();
    $('#view-offer').modal('show');
  }

  setFormValues(currentProd: any, form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      if (key === 'productName' || key === 'productBarcode') {
        form
          .get('productName')
          ?.setValue(currentProd.FreeProduct?.productName || '');
        form
          .get('productBarcode')
          ?.setValue(currentProd.FreeProduct?.barcode || '');
      } else if (key === 'inventory') {
        // Ensure inventory is stored as an array of numbers
        const inventoryArray = (currentProd.inventory || []).map(Number);
        form.get('inventory')?.setValue(inventoryArray);
      } else {
        form
          .get(key)
          ?.setValue(currentProd[key] !== undefined ? currentProd[key] : '');
      }
    });
  }

  openEditModal(data: any) {
    this.currentId = data.offerID;
    this.setFormValues(data, this.offerForm);
    this.offerForm.get('offerType')?.disable();
    $('#edit-offer').modal('show');
  }

  closeModal(id: any) {
    $('#' + id).modal('hide');
  }

  editOffer() {
    this.closeModal('edit-offer');
    this.closeModal('manage-offerInventory');
    this.loading = true;
    try {
      this.api
        .patchAPI(`/offers/offer/${this.currentId}`, [], this.offerForm.value)
        .subscribe((res: any) => {
          this.loading = false;
          if (res.success == false) {
            this.toastr.show('error', 'Something went wrong', {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          } else {
            this.init();
            this.toastr.show('success', res.message, {
              toastComponent: SuccessToast,
              toastClass: 'ngx-toastr',
            });
          }
        });
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
  }

  inventoryName: any = [];

  async fetchFilterInfo() {
    this.loading = true;
    let inventory: any = [];
    this.api.getAPI('/inventorys/ids', []).subscribe((res: any) => {
      if (!res.success) {
        this.loading = false;
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      } else {
        inventory = res.data.map(Number); // Convert IDs to numbers
        this.loading = false;
      }
    });

    try {
      this.api
        .getAPI('/inventorys', [
          ['pagination', false],
          ['inventory', JSON.stringify(inventory)],
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.success) {
            this.inventoryName = res.data.map((inv: any) => ({
              ...inv,
              inventoryID: Number(inv.inventoryID), // Convert ID to number
            }));

            console.log('Filtered Inventory:', this.inventoryName);
            console.log('Offer Form Data:', this.offerForm.value);
            $('#manage-offerInventory').modal('show');

            this.loading = false;
          } else {
            this.loading = false;
            this.toastr.show('error', 'Something went wrong', {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          }
        }),
        (error: any) => {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
          return false;
        };
    } catch (error) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
  }

  async manageInventory(data: any) {
    this.loading = true;
    this.currentId = data.offerID;
    this.setFormValues(data, this.offerForm);
    await this.fetchFilterInfo();
  }

  onCheckboxChangeInventory(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    let selectedValues = [...this.offerForm.get('inventory')?.value];

    if (checkbox.checked) {
      // Add the value if it's checked
      if (!selectedValues.includes(value)) {
        selectedValues.push(value);
      }
    } else {
      // Remove the value if unchecked
      selectedValues = selectedValues.filter((item) => item !== value);
    }

    this.offerForm.get('inventory')?.setValue(selectedValues);
  }

  couponsViewData:any = [];
  couponsViewName:string = ""
  openCoupons(data:any){
    this.loading = true;
    this.couponsViewName = data.offerName;
    try {
      this.api
        .getAPI('/offers/coupons/'+data.offerID, [
          
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.data.length == 0) {
            this.couponsViewData = res.data;
            this.loading = false;
          } else {
            this.couponsViewData = res.data;
            this.loading = false;
          }
        }),
        (error: any) => {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        };
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
    this.loading = false;
    $('#generated-coupons').modal('show')
  }

  getRedeemed(data:Boolean):String{
    if(data == true){
      return "Redeemed"
    } else{
      return "Pending"
    }
  }
 
}
