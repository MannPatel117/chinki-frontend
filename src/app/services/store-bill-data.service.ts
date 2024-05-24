import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreBillDataService {
  invoiceData = {
    "totalAmount": 0,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": 0,
    "RedeemPoints": 0,
    "RewardsHistory": [],
    "CustomerType": "",
    "PaymentType": "cash",
    "currentOffer":{ 
      "_id": "",
      "offerName": "",
      "minimumPrice": 0,
      "product": "",
      "location": [],
      "__v": 0,
      "mrp": 0 
    },
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
        "finalAmount":0,
        "_id": "",
        "productType": ""
      }
    ],
    "currentRow": 0
  }

  invoiceDataEmpty = {
    "totalAmount": 0,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": 0,
    "RedeemPoints": 0,
    "RewardsHistory": [],
    "CustomerType": "",
    "PaymentType": "cash",
    "currentOffer": { 
      "_id": "",
      "offerName": "",
      "minimumPrice": 0,
      "product": "",
      "location": [],
      "__v": 0,
      "mrp": 0 
    },
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
        "finalAmount":0,
        "_id": "",
        "productType": ""
      }
    ],
    "currentRow": 0
  }

  constructor() { 
    let dataString = JSON.stringify(this.invoiceDataEmpty)
    localStorage.setItem('emptyInvoice', dataString)
  }

  storeData(currentActive:string, data:any){
    let dataString = JSON.stringify(data);
    switch(currentActive){
      case 'A':   
        localStorage.setItem('invoiceData1', dataString )
      break;
      case 'B':
        localStorage.setItem('invoiceData2', dataString )
      break;
      case 'C':
        localStorage.setItem('invoiceData3', dataString )
      break;
    }
  }

  getData(currentActive:string):any{
    let parseObj:any;
    if(currentActive == 'A'){
      parseObj = localStorage.getItem('invoiceData1');
    }
    else if(currentActive == 'B'){
      parseObj = localStorage.getItem('invoiceData2');
    }
    else if(currentActive == 'C'){
      parseObj = localStorage.getItem('invoiceData3');
    }
    if(parseObj){
      this.invoiceData = JSON.parse(parseObj);
      return this.invoiceData;
    }
    else{
      let parseObj:any = localStorage.getItem('emptyInvoice');
      this.invoiceDataEmpty = JSON.parse(parseObj)
      return this.invoiceDataEmpty;
    }
  }

  deleteData(currentActive:string):any{
    if(currentActive == 'A'){
      localStorage.removeItem('invoiceData1');
    }
    if(currentActive == 'B'){
      localStorage.removeItem('invoiceData2');
    }
    if(currentActive == 'C'){
      localStorage.removeItem('invoiceData3');
    }
    let parseObj:any = localStorage.getItem('emptyInvoice');
    this.invoiceDataEmpty = JSON.parse(parseObj)
    return this.invoiceDataEmpty;
  }
  
}
