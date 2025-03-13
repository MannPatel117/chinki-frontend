import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { ExcelService } from '../../../services/excel/excel.service';
import { SharedService } from '../../../services/shared/shared.service';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { SuccessToast } from '../../../toast/success-toast/toast';
declare const $: any;

@Component({
  selector: 'app-accounts-master',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgFor,
    NgbDropdownModule,
    NgbPaginationModule,
    DatePipe
  ],
  templateUrl: './accounts-master.component.html',
  styleUrl: './accounts-master.component.scss',
})
export class AccountsMasterComponent {
  
  role: any = 'store';
  loading = false;
  page = 1;
  limit = 10;
  collectionSize = 0;
  inventory = [];

  creditorsCount = 0;
  debtorsCount = 0;
  displayData: any = [];
  currentId: any;

  accountForm!: FormGroup;
  ledgerForm!: FormGroup;
  search: FormControl = new FormControl('');
  subGroup: FormControl = new FormControl('');

  inventoryName: any = [];
  currentData: any;

  currentAction: string = 'view';
  showLedgerScreen: boolean = false;
  ledgerData: any;

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

  ngOnInit() {
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
    this.showLedgerScreen = false;
  }

  back(){
    this.showLedgerScreen = false;
    this.ledgerForm.reset();
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
    this.getAccounts(false, false);
    this.getStats();
    this.fetchFilterInfo();
  }

  setFormBuilder() {
    this.accountForm = this.fb.group({
      balanceid: [],
      accountName: ['', [Validators.required]],
      aliasName: ['', [Validators.required]],
      inventory: [],
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
      email: [''],
    });

    this.ledgerForm = this.fb.group({
      inventoryID: [],
      supplierID: [],
      fromDate: [''],
      toDate: ['']
    })
  }

  fetchFilterInfo() {
    this.loading = true;
    try {
      this.api
        .getAPI('/inventorys', [
          ['pagination', false],
          ['inventory', JSON.stringify(this.inventory)],
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.success == true) {
            this.inventoryName = res.data;
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

  getStats() {
    try {
      this.api.getAPI('/accounts/stats', []).subscribe((res: any) => {
        if (res.success == false) {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          this.creditorsCount = res.data.creditorsCount;
          this.debtorsCount = res.data.debtorsCount;
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

  getAccounts(filter: boolean, reset: boolean) {
    this.loading = true;
    try {
      if (filter == true) {
        this.page = 1;
      }
      if (reset == true) {
        this.search.setValue('');
        this.subGroup.setValue('');
      }
      this.api
        .getAPI('/accounts/', [
          ['pagination', true],
          ['search', this.search.value],
          ['subGroup', this.subGroup.value],
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
  }

  printExcel() {
    this.loading = true;
    this.api
      .getAPI('/accounts', [
        ['search', this.search.value],
        ['subGroup', this.subGroup.value],
        ['pagination', false],
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
          this.excel.exportAsExcelFile(
            data,
            'Accounts List',
            ' Acounts List ' +
              this.search.value.toUpperCase() +
              ' ' +
              this.subGroup.value.toUpperCase()
          );
          this.loading = false;
        }
      });
  }

  printPdf() {
    this.loading = true;
    this.api
      .getAPI('/accounts', [
        ['search', this.search.value],
        ['subGroup', this.subGroup.value],
        ['pagination', false],
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
          this.excel.exportAsPdfFile(
            data,
            'Accounts List',
            ' Accounts List ' +
              this.search.value.toUpperCase() +
              ' ' +
              this.subGroup.value.toUpperCase()
          );
          this.loading = false;
        }
      });
  }

  onCheckboxChange(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (value == 'Sundry Creditors' || value == 'Sundry Debtors') {
        this.subGroup.setValue(value);
      }
    } else {
      if (value == 'Sundry Creditors' || value == 'Sundry Debtors') {
        this.subGroup.setValue('');
      }
    }
  }

  addAccount() {
    this.closeModal('addAccountModal');
    this.loading = true;
    try {
      this.api
        .postAPI('/accounts/account', [], this.accountForm.value)
        .subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success == 0) {
              this.toastr.show('error', res.data, {
                toastComponent: ErrorToast,
                toastClass: 'ngx-toastr',
              });
            } else {
              this.toastr.show('success', res.message, {
                toastComponent: SuccessToast,
                toastClass: 'ngx-toastr',
              });
              this.init();
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

  editAccount(){
    this.closeModal('viewAccountDetail');
    this.loading = true;
    try {
      this.api
        .putAPI('/accounts/account/'+this.currentId, [], this.accountForm.value)
        .subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success == 0) {
              this.toastr.show('error', res.data, {
                toastComponent: ErrorToast,
                toastClass: 'ngx-toastr',
              });
            } else {
              this.toastr.show('success', res.message, {
                toastComponent: SuccessToast,
                toastClass: 'ngx-toastr',
              });
              this.init();
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

  deleteAccount() {
    this.closeModal('deleteAccountModal');
    try {
      this.api
        .deleteAPI(`/accounts/account/${this.currentId}`, [])
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

  openDeleteModal(currentAccount: any) {
    this.currentId = currentAccount.supplierID;
    $('#deleteAccountModal').modal('show');
  }

  openModal(id: any) {
    this.accountForm.reset();
    $('#' + id).modal('show');
  }

  closeModal(id: any) {
    $('#' + id).modal('hide');
  }

  inventorySelected() {
    $('#selectInventory').modal('hide');
    this.loading = true;
    const id = this.accountForm.get('inventory')?.value;
    this.setFormValues(this.currentData, this.accountForm);
    try {
      this.api
        .getAPI('/inventoryAccounts/accountBalance/', [
          ['inventoryID', id],
          ['accountID', this.currentData.supplierID],
        ])
        .subscribe((res: any) => {
          if (res.success == true) {
            const data = res.data;
            this.accountForm
              .get('openingBalanceCredit')
              ?.setValue(parseFloat(data.openingBalance));
            this.accountForm
              .get('openingBalanceDebit')
              ?.setValue(parseFloat(data.closingBalance));
              this.accountForm.get('balanceid')?.setValue(data.id);
            this.loading = false;
            if (this.currentAction == 'view') {
              this.accountForm.disable();
            }
            this.openModal('viewAccountDetail');
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

  openModalViewEditAccount(data: any, type: string) {
    this.accountForm.enable();
    this.accountForm.reset();
    this.currentData = data;
    this.currentAction = type;
    this.currentId= data.supplierID;
    if (this.inventory.length > 1) {
      $('#selectInventory').modal('show');
      this.shared.multiInventory();
    } else if (this.inventory.length == 1) {
      let inventory = this.inventory[0];
      this.accountForm.get('inventory')?.setValue(inventory);
      this.inventorySelected();
    } else {
      $('#noInventory').modal('show');
    }
  }

  setFormValues(currentItem: any, form: FormGroup) {
    Object.keys(currentItem).forEach((key) => {
      if (form.get(key)) {
        form.get(key)?.setValue(currentItem[key]);
      }
    });
  }

  openLedger(id:any){
    this.ledgerForm.get('supplierID')?.setValue(id);
    if(this.inventory.length==1){
      this.ledgerForm.get('inventoryID')?.setValue(this.inventory[0]);
    }
    $('#selectInventoryLedger').modal('show');
  }

  showLedger(){
    $('#selectInventoryLedger').modal('hide');
    const values = this.ledgerForm.value
    this.loading = true;
    try {
      this.api
        .getAPI('/inventoryAccounts/ledger', [
          ['supplierID', values.supplierID],
          ['inventoryID', values.inventoryID],
          ['fromDate', values.fromDate],
          ['toDate', values.toDate],
        ])
        .subscribe((res: any) => {
          if (res.success == true) {
            this.ledgerData = res.data;
            this.showLedgerScreen = true;
          } else {
            this.toastr.show('error', 'Something went wrong', {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
            this.loading = false;
          }
        },
        (error: any) => {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        });
    } catch (err) {
      this.loading = false;
      this.toastr.show('error', 'Something went wrong', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
    }
    this.loading = false; 
  }

  changeOpeningBalance(){
    const debitVal = this.accountForm.get('openingBalanceDebit')?.value;
      const creditVal = this.accountForm.get('openingBalanceCredit')?.value;
      console.log(debitVal, creditVal)
      if(creditVal > 0 && debitVal>0){
        if(debitVal> creditVal){
          const diff = debitVal - creditVal;
          this.accountForm.get('openingBalanceDebit')?.setValue(diff);
          this.accountForm.get('openingBalanceCredit')?.setValue(0);
        }
        else{
          const diff = creditVal - debitVal;
          this.accountForm.get('openingBalanceCredit')?.setValue(diff);
          this.accountForm.get('openingBalanceDebit')?.setValue(0);
        }
      }
    }

    getFormattedAddress(): string {
      const addressLines = [
        this.ledgerData?.inventory?.address?.addressLine1,
        this.ledgerData?.inventory?.address?.addressLine2,
        this.ledgerData?.inventory?.address?.addressLine3,
        this.ledgerData?.inventory?.address?.city,
        this.ledgerData?.inventory?.address?.state,
        this.ledgerData?.inventory?.address?.pincode,
      ];
      return addressLines.filter(line => line).join(',  '); // Remove null/undefined/empty values and join with a space
    }

    async generatePDF(){
      const byteCharacters = atob(this.ledgerData.pdf);

    // Create an array to hold the byte characters
    const byteArray = new Uint8Array(byteCharacters.length);

    // Fill the byte array with byte characters
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    // Create a Blob object from the byte array (specifying the MIME type as PDF)
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Create an Object URL for the Blob
    const blobUrl = URL.createObjectURL(blob);

    // Create an anchor (<a>) tag to simulate the download
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'document.pdf'; // Specify the file name for download
    a.click(); // Trigger the download

    // Optionally, release the Object URL after the download starts
    URL.revokeObjectURL(blobUrl);
    }

  }

