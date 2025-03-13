import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../services/api/api.service';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../services/shared/shared.service';
import { SuccessToast } from '../../../../toast/success-toast/toast';
import { ErrorToast } from '../../../../toast/error-toast/toast';
import { ActivatedRoute } from '@angular/router';
declare const $: any;
@Component({
  selector: 'app-reconsilation',
  standalone: true,
  imports: [   ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgFor,
    NgbDropdownModule,
    NgbPaginationModule,
    NgClass,
    FormsModule,],
  templateUrl: './reconsilation.component.html',
  styleUrl: './reconsilation.component.scss'
})
export class ReconsilationComponent {
  role: any = 'store';
    loading = false;
  
    transactionForm!: FormGroup;
    transactionDetailForm!: FormGroup;
  
    inventoryData: any;
    inventoryID: any;
    accountsName: any = [];
    deleteIndex = -1;
    products: any;
    productsFilter: any;
  
    barcode: FormControl = new FormControl('');
  
    constructor(
      private fb: FormBuilder,
      private route: Router,
      private api: ApiService,
      private toastr: ToastrService,
      private shared: SharedService,
      private router: ActivatedRoute
    ) {
      this.role = localStorage.getItem('role');
    }
  
    ngOnInit() {
      this.loading = true;
      this.router.paramMap.subscribe((params) => {
        this.inventoryID = params.get('inventory') || '';
        if (this.inventoryID == '') {
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
          this.route.navigateByUrl('/pos/inventory-system');
        }
      });
      this.checkUserLoggedIn();
      this.setFormBuilder();
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
  
    init() {
      this.getInventoryDetail();
      this.getProducts();
      this.fetchFilterInfo();
    }
  
    fetchFilterInfo() {
      this.loading = true;
      try {
        this.api.getAPI('/accounts/accounts', []).subscribe((res: any) => {
          if (res.success == true) {
            this.accountsName = res.data;
            this.loading = false;
          } else {
            this.loading = false;
            this.toastr.show('error', 'Something went wrong', {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          }
        });
      } catch (error) {
        this.loading = false;
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      }
    }
    setFormBuilder() {
      this.transactionForm = this.fb.group({
        inventory: [0, [Validators.min(1)]],
        remark: [null],
      });
      this.transactionForm.get('inventory')?.setValue(this.inventoryID);
      this.transactionDetailForm = this.fb.group({
        rows: this.fb.array([]),
      });
      this.calculateRows();
    }
  
    get rows(): FormArray {
      return this.transactionDetailForm.get('rows') as FormArray;
    }
  
    newRow(): FormGroup {
      return this.fb.group({
        productID:[0],
        inventoryID:[0],
        productName: [''],
        quantityLost: [0],
        quantityFound: [0],
        remark: ['']
      });
    }
  
    clear() {
      this.transactionForm.reset();
      this.transactionDetailForm.reset();
      this.init();
      this.closeModal('clearItemModal');
    }
  
    totalRows = 0;
    maxHeight = '';
    currentRow = 0;
  
    @ViewChild('tablebody') tableBody!: ElementRef;
    calculateRows() {
      this.rows.clear();
      setTimeout(() => {
        const divElement = this.tableBody.nativeElement as HTMLElement;
        const height = divElement.clientHeight;
        let rows = Math.floor(height / 26);
        rows = rows - 2;
        this.totalRows = rows;
        let calculatedHeight = rows * 31;
        this.maxHeight = `${calculatedHeight}px`;
        this.initializeEmptyTable(rows);
      }, 50);
    }
  
    initializeEmptyTable(row: any) {
      this.transactionDetailForm.reset();
      for (let i = 0; i < row; i++) {
        this.rows.push(this.newRow());
      }
    }
  
    getInventoryDetail() {
      try {
        this.api
          .getAPI('/inventorys/inventory/' + this.inventoryID, [
            ['details', false],
          ])
          .subscribe((res: any) => {
            if (res.success == true) {
              const data = res.data;
              this.transactionForm.get('transactionType')?.setValue('purchase');
              this.transactionForm
                .get('documentNumber')
                ?.setValue(data.goodsReceiptDocNo);
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
          };
      } catch (error) {
        this.loading = false;
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      }
    }
  
    getProducts() {
      try {
        this.api
          .getAPI('/products/', [['pagination', false]])
          .subscribe((res: any) => {
            if (res.success == true) {
              const data = res.data;
              this.products = data;
              this.productsFilter = data;
              console.log(this.products);
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
          };
      } catch (error) {
        this.loading = false;
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      }
    }
  
    async scanBarcode() {
      const index = this.products.findIndex(
        (product: { barcode: any }) => product.barcode === this.barcode.value
      );
      let currentRowString = String(this.currentRow);
      if (index < 0 || index == undefined) {
        this.toastr.show('error', 'Product not found', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      } else {
        const existingItemRow = Object.entries(this.rows.controls).find(
          ([rowIndex, rowControl]) => {
            const itemNameControl = rowControl.get('productID');
            return (
              itemNameControl &&
              itemNameControl.value === this.products[index].productID
            );
          }
        );
        
        if (existingItemRow) {
          this.toastr.show('error', 'Product already added', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          this.rows
            .get(currentRowString)
            ?.get('inventoryID')
            ?.setValue(Number(this.inventoryID));
          this.rows
            .get(currentRowString)
            ?.get('productID')
            ?.setValue(this.products[index].productID);
          this.rows
            .get(currentRowString)
            ?.get('productName')
            ?.setValue(this.products[index].productName);
          this.rows
            .get(currentRowString)
            ?.get('quantityLost')
            ?.setValue(0);
          this.rows
            .get(currentRowString)
            ?.get('quantityFound')
            ?.setValue(0);
          this.currentRow = this.currentRow + 1;
          if (this.currentRow >= this.totalRows) {
            this.rows.push(this.newRow());
          }
        }
      }
      this.barcode.reset();
      this.focusBarcode();
      this.selectedProduct = ''; // Default selected
      this.searchTerm = '';
    }

    changedQuantity(lost:boolean, found:boolean, index:number){
      let stringIndex = String(index);
      if(lost == true){
        let newLostQty = this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.value;
        let FoundQty = this.rows
        .get(stringIndex)
        ?.get('quantityFound')
        ?.value;
        if(FoundQty > 0){
          if(FoundQty > newLostQty){
            let newFoundQty = FoundQty - newLostQty;
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(0);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(newFoundQty);
          } else if(newLostQty > FoundQty){
            let newCalcLostQty = newLostQty - FoundQty;
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(newCalcLostQty);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(0);
          } else{
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(0);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(0);
          }
        }
      } else if(found==true){
        let LostQty = this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.value;
        let newFoundQty = this.rows
        .get(stringIndex)
        ?.get('quantityFound')
        ?.value;
        if(LostQty > 0){
          if(LostQty > newFoundQty){
            let newLostQty = LostQty - newFoundQty;
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(newLostQty);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(0);
          } else if(newFoundQty > LostQty){
            let newCalcFoundQty = newFoundQty - LostQty;
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(0);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(newCalcFoundQty);
          } else{
            this.rows
            .get(stringIndex)
            ?.get('quantityLost')
            ?.setValue(0);
          this.rows
            .get(stringIndex)
            ?.get('quantityFound')
            ?.setValue(0);
          }
        }
      }
    }

    changeRemark(){
      const remark = this.transactionForm?.get('remark')?.value;
      this.rows.controls.forEach(row => {
        row.get('remark')?.setValue(remark);
      });
    }
  
    removeItem(index: any) {
      this.currentRow = this.currentRow - 1;
      this.rows.removeAt(index);
      if (this.currentRow < this.totalRows) {
        this.rows.push(this.newRow());
      }
      this.deleteIndex = -1;
      this.closeModal('deleteItemModal');
    }
  
    openItemModal(id: any, index: number) {
      this.deleteIndex = index;
      $('#' + id).modal('show');
    }
  
    openModal(id: any) {
      $('#' + id).modal('show');
      // this.focusBarcode();
    }
  
    closeModal(id: any) {
      $('#' + id).modal('hide');
      // this.focusBarcode();
    }
  
    @ViewChild('barcodeInput') barcodeInput!: ElementRef;
  
    focusBarcode() {
      this.barcodeInput.nativeElement.focus();
    }
  
    selectedProduct: any; // Default selected
    searchTerm = ''; // Search input
    dropdownOpen = false; // Dropdown visibility
  
    // Filter function
    get filteredProduct() {
      return this.searchTerm === ''
        ? this.products // Show all products when search is empty
        : this.products.filter((product: { productName: string }) =>
            product.productName
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          );
    }
  
    // Toggle dropdown
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }
  
    // Set selected value and close dropdown
    selectProduct(selectedBarcode: any) {
      this.selectedProduct = selectedBarcode;
      this.searchTerm = ''; // Clear search after selecting
      this.dropdownOpen = false; // Close dropdown
      this.barcode.setValue(selectedBarcode);
      this.scanBarcode();
    }
  
    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    closeDropdown(event: Event) {
      if (!(event.target as HTMLElement).closest('.combobox-container')) {
        this.dropdownOpen = false;
      }
    }
  
    addTransaction() {
      const transactionDetail = this.rows.value.filter(
        (row: { productName: string }) => row.productName.trim() !== ''
      );
      const hasInvalidRow = transactionDetail.some(
        (row: { quantityFound: number; quantityLost: number }) =>
          row.quantityFound <= 0 && row.quantityLost <= 0
      );
    
      if (hasInvalidRow) {
        this.toastr.show('error', 'Each row must have at least one quantity (Found or Lost) greater than 0.', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
        return; // Stop execution if validation fails
      }
      const transaction =  { transactionDetail }
      this.loading = true;
      try {
        this.api
          .postAPI(
            '/inventoryDetails/reconciliation',
            [],
            transaction
          )
          .subscribe(
            (res: any) => {
              this.loading = false;
              if (res.success == false) {
                this.toastr.show('error', res.message, {
                  toastComponent: ErrorToast,
                  toastClass: 'ngx-toastr',
                });
              } else {
                this.toastr.show('success', res.message, {
                  toastComponent: SuccessToast,
                  toastClass: 'ngx-toastr',
                });
                this.route.navigateByUrl('/pos/inventory-master/')
              }
            },
            (err: any) => {
              this.loading = false;
              console.log(err)
              this.toastr.show('error', err.error.message, {
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
}
