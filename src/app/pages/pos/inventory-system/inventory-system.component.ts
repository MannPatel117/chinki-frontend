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
  selector: 'app-inventory-system',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgFor,
    NgbDropdownModule,
    NgbPaginationModule,
    DatePipe,
    NgClass,
  ],
  templateUrl: './inventory-system.component.html',
  styleUrl: './inventory-system.component.scss',
})
export class InventorySystemComponent {
  role: any = 'store';
  loading = false;
  page = 1;
  limit = 10;
  collectionSize = 0;
  inventory = [];
  displayData: any;

  productForm!: FormGroup;

  search: FormControl = new FormControl('');
  status: FormControl = new FormControl('');

  editStatus: FormControl = new FormControl('');
  editLowStock: FormControl = new FormControl(0);

  lowWarning: FormControl = new FormControl('');
  inventoryFilter: FormControl = new FormControl([]);

  totalInventory = 0;
  totalLowCount = 0;
  inventoryName: any = [];
  currentData: any;

  currentId = -1;

  statusEditFlag = false;
  lowStockEditFlag = false;
  quantityEditFlag = false;

  currentModal: any;
  currentTransactions: any;
  addTransactions: any;
  subTransactions: any;

  currentTab = 'add';

  transactionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private api: ApiService,
    private toastr: ToastrService,
    private excel: ExcelService,
    private shared: SharedService
  ) {
    this.role = localStorage.getItem('role');
    this.inventory = JSON.parse(localStorage.getItem('location') || '[]');
    this.inventoryFilter.setValue(this.inventory);
    this.shared.multiInventory();
  }

  ngOnInit() {
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  init() {
    this.getInventoryDetails(false, false);
    this.getStats();
    this.fetchFilterInfo();
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

  setFormBuilder() {
    this.transactionForm = this.fb.group({
      inventory: [0, [Validators.min(1)]],
    });
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
      this.api
        .getAPI('/inventoryDetails/stats', [
          ['inventory', JSON.stringify(this.inventoryFilter.value)],
        ])
        .subscribe((res: any) => {
          if (res.data.length == 0) {
            this.loading = false;
            this.toastr.show('error', 'Something went wrong', {
              toastComponent: ErrorToast,
              toastClass: 'ngx-toastr',
            });
          } else {
            this.totalInventory = res.data.totalCount;
            this.totalLowCount = res.data.lowCount;
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

  getInventoryDetails(filter: boolean, reset: boolean) {
    this.loading = true;
    try {
      if (filter == true) {
        this.page = 1;
      }
      if (reset == true) {
        this.lowWarning.setValue('false');
        this.inventoryFilter.setValue(this.inventory);
        this.search.setValue('');
        this.status.setValue('');
      }
      this.api
        .getAPI('/inventoryDetails/', [
          ['inventory', JSON.stringify(this.inventoryFilter.value)],
          ['search', this.search.value],
          ['lowWarning', this.lowWarning.value],
          ['status', this.status.value],
          ['limit', this.limit],
          ['page', this.page],
          ['pagination', true],
        ])
        .subscribe((res: any) => {
          if (res.sucess == false) {
            this.displayData = res.data.data;
            this.loading = false;
          } else {
            this.displayData = res.data.data;
            this.collectionSize = res.data.pagination.totalRecords;
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

  onCheckboxChange(value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (value == 'true' || value == 'false') {
        this.lowWarning.setValue(value);
      }
      if (value == 'active' || value == 'inactive') {
        this.status.setValue(value);
      }
    } else {
      if (value == 'true' || value == 'false') {
        this.lowWarning.setValue('');
      }
      if (value == 'active' || value == 'inactive') {
        this.status.setValue('');
      }
    }
  }

  printExcel() {
    this.loading = true;
    this.api
      .getAPI('/inventoryDetails/', [
        ['inventory', JSON.stringify(this.inventoryFilter.value)],
        ['search', this.search.value],
        ['lowWarning', this.lowWarning.value],
        ['status', this.status.value],
        ['limit', this.limit],
        ['page', this.page],
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
          data.forEach((element: any, index: number) => {
            // Extract productName and barcode
            const productName = element.MasterProduct?.productName;
            const barcode = element.MasterProduct?.barcode;

            // Create a new object with the desired key order
            data[index] = {
              productName,
              barcode,
              quantity: element.quantity,
              lowWarning: element.lowWarning,
              status: element.status,
            };
          });
          this.excel.exportAsExcelFile(
            data,
            'Inventory Product List',
            ' Inventory List ' +
              this.search.value.toUpperCase() +
              ' ' +
              this.status.value.toUpperCase()
          );
          this.loading = false;
        }
      });
  }

  printPdf() {
    this.loading = true;
    this.api
      .getAPI('/inventoryDetails/', [
        ['inventory', JSON.stringify(this.inventoryFilter.value)],
        ['search', this.search.value],
        ['lowWarning', this.lowWarning.value],
        ['status', this.status.value],
        ['limit', this.limit],
        ['page', this.page],
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
          data.forEach((element: any, index: number) => {
            // Extract productName and barcode
            const productName = element.MasterProduct?.productName;
            const barcode = element.MasterProduct?.barcode;

            // Create a new object with the desired key order
            data[index] = {
              productName,
              barcode,
              quantity: element.quantity,
              lowWarning: element.lowWarning,
              status: element.status,
            };
          });
          this.excel.exportAsPdfFile(
            data,
            'Inventory Products List',
            ' Inventory List ' +
              this.search.value.toUpperCase() +
              ' ' +
              this.status.value.toUpperCase()
          );
          this.loading = false;
        }
      });
  }

  editProduct() {
    this.closeModal('editInventoryModal');
    this.loading = true;
    const body = {
      "lowWarning": this.editLowStock.value,
      "status": this.editStatus.value
    }
    try {
      this.api
        .patchAPI(
          '/inventoryDetails/inventoryDetails/'+this.currentId,
          [],
          body
        )
        .subscribe((res: any) => {
          this.loading = false;
          if (res.data.length == 0) {
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

  setFormValues(currentProd: any, form: FormGroup) {
    Object.keys(currentProd).forEach((key) => {
      if (form.get(key)) {
        form.get(key)?.setValue(currentProd[key]);
      }
    });
  }

  openModal(id: any) {
    $('#' + id).modal('show');
    this.setFormBuilder();
  }

  closeModal(id: any) {
    $('#' + id).modal('hide');
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
      selectedValues = selectedValues.filter((item) => item !== value);
    }

    this.inventoryFilter.setValue(selectedValues);
    console.log(this.inventoryFilter.value);
  }

  openModalView(data: any) {
    this.currentModal = data;
    const inventoryName = this.getInventoryNameArr(
      this.inventoryName,
      data?.inventoryID
    );
    this.currentModal = {
      ...this.currentModal,
      inventoryName: inventoryName[0],
    };

    this.api
      .getAPI('/inventoryDetails/transaction', [
        ['productID', data?.productID],
        ['inventoryID', data?.inventoryID],
      ])
      .subscribe((res: any) => {
        if (res.success == 'false') {
          this.loading = false;
          this.toastr.show('error', 'Something went wrong', {
            toastComponent: ErrorToast,
            toastClass: 'ngx-toastr',
          });
        } else {
          this.currentTransactions = res.data;
          this.addTransactions = this.currentTransactions.filter(
            (item: any) => item.type === 'add'
          );
          this.subTransactions = this.currentTransactions.filter(
            (item: any) => item.type === 'subtract'
          );
        }
      });
    $('#viewTransactionHistoryModal').modal('show');
  }

  getInventoryNameArr(inventoryList: any, inventoryID: string): string[] {
    return inventoryList
      .filter((item: any) => item.inventoryID === inventoryID)
      .map((item: any) => item.inventoryName);
  }

  TabSwticher(currentTab: string) {
    this.currentTab = currentTab;
  }

  openModalAddResc() {
    this.transactionForm.reset();
    if (this.inventory.length > 1) {
      $('#selectInventory').modal('show');
      this.shared.multiInventory();
    } else if (this.inventory.length == 1) {
      let inventory = this.inventory[0];
      this.transactionForm.get('inventory')?.setValue(inventory);
      this.transactionForm
        .get('selectInventoryName')
        ?.setValue(this.getInventoryName(inventory));
      this.inventorySelected();
    } else {
      $('#noInventory').modal('show');
    }
  }

  inventorySelected() {
    $('#selectInventory').modal('hide');
    this.loading = true;
    const id = this.transactionForm.get('inventory')?.value;
    this.route.navigate(['/pos/inventory-system/reconsilation', id]);
  }

  getInventoryName(inventoryID: number) {
    return (
      this.inventoryName.find(
        (inv: { inventoryID: number }) => inv.inventoryID === inventoryID
      )?.inventoryName || 'N/A'
    );
  }

  openEditModel(data:any){
    this.currentId = data.id;
    this.editLowStock.setValue(data.lowWarning)
    this.editStatus.setValue(data.status)
    $('#editInventoryModal').modal('show');
  }
}
