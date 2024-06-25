import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import {RoundProgressComponent} from 'angular-svg-round-progressbar';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-inventory-system',
  standalone: true,
  imports: [RouterModule, NgbPaginationModule, RoundProgressComponent, NgIf, NgFor],
  templateUrl: './inventory-system.component.html',
  styleUrl: './inventory-system.component.scss'
})
export class InventorySystemComponent {

  constructor(
    private fb: FormBuilder, 
    private route: Router,
    private api: ApiService
  ) {
    
  }

  currentData = 'products';
  
  lowStockCount = 0;
  totalAccountCount = 0;
  totalActiveProductCount = 0;
  totalProductCount = 0;

  lowStockPercentage = 0;
  totalActiveProductPercentage = 0;

  displayData: any;
  
  page= 1;
  pageSize = 10;
  items= [5,5,5,5,5,5,55,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
  
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
    this.api.getAPI('/inventory/inventoryStats', [['location', 'soap-center']]).subscribe((res:any) =>{
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
    switch(current){
      case 'products': console.log(current)
        
      break;

      case 'lowStocks': 
      this.api.getAPI('/inventory/lowInventory', [['location','soap-center']]).subscribe((res:any) => {
        this.displayData = res.data[0].inventoryProducts;
        this.displayData = [...this.displayData, ...this.displayData, ...this.displayData, ...this.displayData]
      });
        
      break;
      case 'accounts': console.log(current)
      break;
    }
  }

  check(){
    console.log("Hi")
  }

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }

  checker(params:any){
    this.api.getAPI('/inventory/lowInventory', params).subscribe((res:any) => {
      console.log(res)
    });
  }
  
}
