import { Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NgbDropdownModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import {RoundProgressComponent} from 'angular-svg-round-progressbar';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { ExcelService } from '../../../services/excel/excel.service';
declare const $:any;

@Component({
  selector: 'app-inventory-system',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgbPaginationModule, RoundProgressComponent, NgIf, NgFor, NgbDropdownModule],
  templateUrl: './inventory-system.component.html',
  styleUrl: './inventory-system.component.scss'
})
export class InventorySystemComponent {

  constructor(
    private fb: FormBuilder, 
    private route: Router,
    private api: ApiService,
    private excel: ExcelService
  ) {
    
  }

  currentLocation = localStorage.getItem('location')
  currentData = 'lowStocks';

  isOpen = false;
  
  lowStockCount = 0;
  totalAccountCount = 0;
  totalActiveProductCount = 0;
  totalProductCount = 0;

  lowStockPercentage = 0;
  totalActiveProductPercentage = 0;

  displayData: any;
  originalData:any;

  temp_selectedId:any;

  displayAccounts: any;
  page= 1;
  pageLimit= 10;
  pageSize = 0;

  searchBar: FormControl = new FormControl ('');
  selectedAccount: FormControl = new FormControl('');
  lowStockEdit: FormControl = new FormControl (0);
  
  ngOnInit(){
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn(){
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAPI('/adminUser/user', []).subscribe((res:any) =>{
        if(res.statusCode == 200){
          this.initAll();
        }
        else{
          this.route.navigateByUrl('/login')
        }
      }, (error) =>{
        this.route.navigateByUrl('/login')
      })
    }
    else{
      this.route.navigateByUrl('/login')
    }
  }

  initAll(){
    this.getStats();
    this.getData(this.currentData);
  }

  getStats(){
    this.api.getAPI('/inventory/inventoryStats', [['location', this.currentLocation]]).subscribe((res:any) =>{
      const data = res.data;
      this.lowStockCount = data.lowStockCount;
      this.totalAccountCount = data.totalAccountCount;
      this.totalActiveProductCount = data.totalActiveProductCount;
      this.totalProductCount = data.totalProductCount;
      this.lowStockPercentage = Math.round((this.lowStockCount/this.totalActiveProductCount)*100);
      this.totalActiveProductPercentage = Math.round((this.totalActiveProductCount/this.totalProductCount)*100);
    })
  }

  getData(current:any){
    this.currentData = current;
    let searchValue = this.searchBar.value;
    switch(current){
      case 'products': console.log(current)
        
      break;

      case 'lowStocks': 
      this.api.getAPI('/inventory/lowInventory', [['location', this.currentLocation], ['search', searchValue], ['page', this.page], ['limit', this.pageSize]]).subscribe((res:any) => {
        if(res.data.length == 0){
          this.pageSize = this.originalData.length;
          this.displayData = []
          this.originalData = []
        }else{
          this.originalData = res.data[0].inventoryProducts;
          this.pageSize = this.originalData.length;
          this.applyPagination()
        }
      });
      this.api.getAPI('/accounts/getAccounts', []).subscribe((res:any) => {
        this.displayAccounts = res.data;
      });
        
      break;
      case 'accounts': console.log(current)
      break;
    }
  }

  print(type:any){
    if(this.selectedAccount.value == ''){
      let data = this.originalData;
        data.forEach((item: { _id: any; supplierId: any; }) => {
          delete item._id;
          delete item.supplierId;
      });
      if(type == 'sheet'){
        this.excel.exportAsExcelFile(data, 'Low Stock')
      }else if(type == 'pdf'){
        this.excel.exportAsPdfFile(data, 'Low Stock')
      }else{
        console.log("ERROR")
      }
    } else{
      let data = this.originalData.filter((prod:any) => prod.supplierId === this.selectedAccount.value);
      data.forEach((item: { _id: any; supplierId: any; }) => {
        delete item._id;
        delete item.supplierId;
      });
      if(type == 'sheet'){
        this.excel.exportAsExcelFile(data, 'Low Stock')
      }else if(type == 'pdf'){
        this.excel.exportAsPdfFile(data, 'Low Stock')
      }else{
        console.log("ERROR")
      }
    }
  }

  onCheckboxChange(value: string) {
    if(value == this.selectedAccount.value){
      this.selectedAccount.setValue('');
    } else{
      this.selectedAccount.setValue(value);
    }
  }

  applyAccountFilter(){
    if(this.selectedAccount.value == ''){
      this.page = 1;
      this.applyPagination();
    } else{
      console.log(this.originalData)
      this.page = 1;
      let data = this.originalData.filter((prod:any) => prod.supplierId === this.selectedAccount.value);
      console.log(data)
      this.pageSize = this.originalData.length;
      let startindex = (this.page-1)*this.pageLimit;
      let endIndex = (startindex + this.pageLimit)
      this.displayData = data.slice(startindex, endIndex);
    }
  }

  confirmLowStock(){
    const body = {
      "product": this.temp_selectedId,
      "lowWarning": this.lowStockEdit.value
    }
    this.api.patchAPI('/inventory/lowInventory', [['location', this.currentLocation]], body).subscribe((res:any) => {
      this.getData('lowStocks');
      this.temp_selectedId = '';
      this.closeModal('editLowStockModal');
    });
    //make api call
    //close the modal
    // reset temp variable
  }

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }

  openLowStockEditModal(id:any, lowStockNum:number, item_id:any){
    this.temp_selectedId = item_id;
    this.lowStockEdit.setValue(lowStockNum)
    $("#"+id).modal('show');
  }

  openModal(id:any){
    $("#"+id).modal('show');
  }

  closeModal(id:any){
    $("#"+id).modal('hide');
    //reset temp variable
  }

  applyPagination(){
    this.pageSize = this.originalData.length;
    let startindex = (this.page-1)*this.pageLimit;
    let endIndex = (startindex + this.pageLimit)
    this.displayData = this.originalData.slice(startindex, endIndex);
  }
}
