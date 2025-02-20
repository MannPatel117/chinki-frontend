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
  selector: 'app-goods',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgFor,
    NgbDropdownModule,
    NgbPaginationModule,
    NgClass,
    FormsModule,
  ],
  templateUrl: './goods.component.html',
  styleUrl: './goods.component.scss',
})
export class GoodsComponent {
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
        this.route.navigateByUrl('/pos/accounts/transactions');
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
      transactionType: ['', [Validators.required]],
      supplier: [0],
      inventory: [0, [Validators.min(1)]],
      selectInventoryName: [''],
      documentNumber: [null],
      challanNumber: [null],
      challanDate: [null],
      billNumber: [null],
      billDate: [null],
      remark: [null],
      finalAmt: [0],
      actionBy: [''],
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
      productName: [''],
      quantity: [0],
      wholeSalePrice: [0],
      discountPerc: [0],
      discountAmt: [0],
      amount: [0],
      gstPerc: [0],
      gstAmount: [0],
      sgstAmount: [0],
      cgstAmount: [0],
      igstAmount: [0],
      netAmount: [0],
      productID: [''],
      productType: [''],
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
        const existingRowIndex = existingItemRow[0];
        const quantityControl = this.rows
          .get(existingRowIndex)
          ?.get('quantity');
        if (quantityControl) {
          const currentQuantity = quantityControl.value || 0;
          let rowCount = +existingRowIndex;
          quantityControl.setValue(currentQuantity + 1);
          const rateControl = this.rows
            .get(existingRowIndex)
            ?.get('wholeSalePrice');
          if (rateControl) {
            const rateQuantity = rateControl.value || 0;
            const discountControl = this.rows
              .get(existingRowIndex)
              ?.get('discountAmt');
            if (discountControl) {
              const discountAmt = discountControl.value || 0;
              const discountPerc = (discountAmt / rateQuantity) * 100;
              const discountPercRounded = Math.round(
                (discountPerc * 100) / 100
              );
              const discountAmtRounded = Math.round((discountAmt * 100) / 100);
              this.rows
                .get(existingRowIndex)
                ?.get('discountPerc')
                ?.setValue(discountPercRounded);
              this.rows
                .get(existingRowIndex)
                ?.get('discountAmt')
                ?.setValue(discountAmtRounded);
              const newAmount = (rateQuantity - discountAmt) * (currentQuantity+1 );
              const newAmountRounded = Math.round((newAmount * 100) / 100);
              this.rows
                .get(existingRowIndex)
                ?.get('amount')
                ?.setValue(newAmountRounded);
              const gstControl = this.rows
                .get(existingRowIndex)
                ?.get('gstPerc');
              if (gstControl) {
                const gstPercQuantity = gstControl.value || 0;
                const gstAmount = await this.gstCalculator(
                  newAmount,
                  gstPercQuantity
                );
                const cgstAmt = gstAmount / 2;
                const sgstAmt = gstAmount / 2;
                this.rows
                  .get(existingRowIndex)
                  ?.get('gstAmount')
                  ?.setValue(gstAmount);
                this.rows
                  .get(existingRowIndex)
                  ?.get('cgstAmount')
                  ?.setValue(cgstAmt);
                this.rows
                  .get(existingRowIndex)
                  ?.get('sgstAmount')
                  ?.setValue(sgstAmt);
                this.rows
                  .get(existingRowIndex)
                  ?.get('netAmount')
                  ?.setValue(newAmount + gstAmount);
              }
            }
          }
        }
      } else {
        this.rows
          .get(currentRowString)
          ?.get('productID')
          ?.setValue(this.products[index].productID);
        this.rows
          .get(currentRowString)
          ?.get('productName')
          ?.setValue(this.products[index].productName);
        this.rows.get(currentRowString)?.get('quantity')?.setValue(1);
        this.rows
          .get(currentRowString)
          ?.get('wholeSalePrice')
          ?.setValue(this.products[index].wholeSalePrice);
        this.rows.get(currentRowString)?.get('discountPerc')?.setValue(0);
        this.rows.get(currentRowString)?.get('discountAmt')?.setValue(0);
        this.rows
          .get(currentRowString)
          ?.get('amount')
          ?.setValue(this.products[index].wholeSalePrice);
        const gstAmount = await this.gstCalculator(
          this.products[index].wholeSalePrice,
          this.products[index].gst
        );
        const cgstAmt = gstAmount / 2;
        const sgstAmt = gstAmount / 2;
        this.rows
          .get(currentRowString)
          ?.get('gstPerc')
          ?.setValue(this.products[index].gst);
        this.rows.get(currentRowString)?.get('gstAmount')?.setValue(gstAmount);
        this.rows.get(currentRowString)?.get('cgstAmount')?.setValue(cgstAmt);
        this.rows.get(currentRowString)?.get('sgstAmount')?.setValue(sgstAmt);
        this.rows
          .get(currentRowString)
          ?.get('netAmount')
          ?.setValue(this.products[index].wholeSalePrice + gstAmount);
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
    this.calcTotalAmount();
  }

  removeItem(index: any) {
    this.currentRow = this.currentRow - 1;
    this.rows.removeAt(index);
    if (this.currentRow < this.totalRows) {
      this.rows.push(this.newRow());
    }
    // this.calcTotalAmount();
    this.deleteIndex = -1;
    this.closeModal('deleteItemModal');
    this.calcTotalAmount();
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

  async gstCalculator(amount: any, gst: any) {
    const gstAmount = amount * (gst / 100);
    const roundedAmount = Math.round(gstAmount * 100) / 100;
    return roundedAmount;
  }

  calcTotalAmount() {
    let finalAmount = 0;
    for (let i = 0; i < this.currentRow; i++) {
      let row = String(i);
      finalAmount = finalAmount + this.rows.get(row)?.get('netAmount')?.value;
    }
    const roundedFinalAmount = Math.round(finalAmount * 100) / 100;
    this.transactionForm.get('finalAmt')?.setValue(roundedFinalAmount);
    this.focusBarcode();
  }

  async changedCalculation(index: any) {
    const quantityControl = this.rows.at(index)?.get('quantity');
    if (quantityControl) {
      const currentQuantity = quantityControl.value || 0;
      const rateControl = this.rows.at(index)?.get('wholeSalePrice');
      if (rateControl) {
        const rateQuantity = rateControl.value || 0;
        const discountControl = this.rows.at(index)?.get('discountAmt');
        if (discountControl) {
          const discountAmt = discountControl.value || 0;
          const discountPerc = (discountAmt / rateQuantity) * 100;
          const roundedDiscountPerc = Math.round((discountPerc*100)/100)
          this.rows.at(index)?.get('discountPerc')?.setValue(roundedDiscountPerc);
          this.rows.at(index)?.get('discountAmt')?.setValue(discountAmt);
          const newAmount = (rateQuantity - discountAmt) * currentQuantity;
          const newAmountRounded = Math.round((newAmount * 100) / 100);
          this.rows.at(index)?.get('amount')?.setValue(newAmountRounded);
          const gstControl = this.rows.at(index)?.get('gstPerc');
          if (gstControl) {
            const gstPercQuantity = gstControl.value || 0;
            const gstAmount = await this.gstCalculator(
              newAmount,
              gstPercQuantity
            );
            const cgstAmt = gstAmount / 2;
            const sgstAmt = gstAmount / 2;
            this.rows.at(index)?.get('gstAmount')?.setValue(gstAmount);
            this.rows.at(index)?.get('cgstAmount')?.setValue(cgstAmt);
            this.rows.at(index)?.get('sgstAmount')?.setValue(sgstAmt);
            this.rows
              .at(index)
              ?.get('netAmount')
              ?.setValue(newAmount + gstAmount);
          }
        }
      }
    }
    this.calcTotalAmount();
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
    console.log(this.transactionForm.invalid)
    const transactionDetail = this.rows.value.filter(
      (row: { productName: string }) => row.productName.trim() !== ''
    );
    const transaction = {
      ...this.transactionForm.value, // Spread all existing form values
      transactionDetail,
    };
    this.loading = true;
    try {
      this.api
        .postAPI(
          '/accountTransaction/accountTransaction',
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
              this.route.navigateByUrl('/pos/accounts/transactions')
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
