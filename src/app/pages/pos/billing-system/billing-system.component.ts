import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { StoreBillDataService } from '../../../services/store-bill-data.service';

@Component({
  selector: 'app-billing-system',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './billing-system.component.html',
  styleUrl: './billing-system.component.scss'
})
export class BillingSystemComponent {

  currentActiveInvoice : string = 'A'
  currentActiveInvoiceData : any;

  constructor(private fb: FormBuilder,
     private route: Router,
     private api: ApiService,
     private billData: StoreBillDataService) {
  
  }
  
  ngOnInit(){
    this.checkUserLoggedIn();
    this.invoiceSwitcher('A');
  }

  checkUserLoggedIn(){
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAdminUser().subscribe((res:any) =>{
        if(res){
        }
      }, (error) =>{
        this.route.navigateByUrl('/login')
      })
    }
    else{
        this.route.navigateByUrl('/login')
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

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }
}
