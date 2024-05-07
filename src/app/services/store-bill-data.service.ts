import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreBillDataService {
  invoiceData1 = {
    "totalAmount": 4,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": "",
    "CustomerType": "",
    "PaymentType": "",
    "BillDetails": [
      {
        "itemName": "",
        "quantity": 0,
        "mrp": 0,
        "discount": 0,
        "rate": 0,
        "amount": 0,
        "gst": 0,
        "gstAmount": 0,
        "finalAmount":0
      }
    ]
  }

  invoiceData2 = {
    "totalAmount": 5,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": "",
    "CustomerType": "",
    "PaymentType": "",
    "BillDetails": [
      {
        "itemName": "",
        "quantity": 0,
        "mrp": 0,
        "discount": 0,
        "rate": 0,
        "amount": 0,
        "gst": 0,
        "gstAmount": 0,
        "finalAmount":0
      }
    ]
  }

  invoiceData3 = {
    "totalAmount": 6,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": "",
    "CustomerType": "",
    "PaymentType": "",
    "BillDetails": [
      {
        "itemName": "",
        "quantity": 0,
        "mrp": 0,
        "discount": 0,
        "rate": 0,
        "amount": 0,
        "gst": 0,
        "gstAmount": 0,
        "finalAmount":0
      }
    ]
  }

  constructor() { 

  }

  storeData(currentActive:string, data:any){
    switch(currentActive){
      case 'A': 
        this.invoiceData1=data;
      break;
      case 'B':
        this.invoiceData2=data;
      break;
      case 'C':
        this.invoiceData3=data;
      break;
    }
  }

  getData(currentActive:string):any{
    if(currentActive == 'A'){
      return this.invoiceData1;
    }
    if(currentActive == 'B'){
      return this.invoiceData2;
    }
    if(currentActive == 'C'){
      return this.invoiceData3;
    }
  }

}
