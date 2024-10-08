import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { StoreBillDataService } from '../../../services/store-bill-data.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CustomToast } from '../../../custom-toast/toast';
import { DatePipe } from '@angular/common';
import { SharedService } from '../../../services/shared/shared.service';
declare const $:any;

@Component({
  selector: 'app-billing-system',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterModule, NgFor, NgClass],  
  providers: [DatePipe],
  templateUrl: './billing-system.component.html',
  styleUrl: './billing-system.component.scss'
})
export class BillingSystemComponent {
  loading = false;
  @ViewChild('barcode')barcode!: ElementRef;
  @ViewChild('tablebody')tableBody!: ElementRef;
  currentActiveInvoice : string = 'A';
  currentActiveInvoiceData = {
    "totalAmount": 0,
    "UserName": "",
    "UserPhnNumber": "",
    "UserAddress": "",
    "RewardPoints": 0,
    "RedeemPoints": 0,
    "confirmRedeem": false,
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
        "_id":"",
        "productType": ""
      }
    ],
    "currentRow": 0
  }

  allProductsList:any

  currentBillTableData: any[][] = [];
  current_location: any;
  current_invoiceNumber: any;
  current_billNumber: any;
  totalRows = 0;
  maxHeight = "";
  currentRow = 0;

  currentRewardsTab = 'Redeem';
  currentRewardsHistory:any;
  confirmRedeemFlag = false;
  pointsEarned = 0;
  pointsUsed = 0;

  offers: any;
  selectedOffer:any;

  deleteIndex = -1;

  role:any = 'store';

  userForm!: FormGroup;
  addUserForm!: FormGroup;
  billDataForm!: FormGroup;
  barcodeScan: FormControl = new FormControl ('');
  phnNumber:FormControl = new FormControl('', [Validators.minLength(10), Validators.maxLength(10), Validators.required]);
  redeemPoints:FormControl = new FormControl(0, [Validators.min(0)]);

  constructor(private fb: FormBuilder,
     private route: Router,
     private api: ApiService,
     private billData: StoreBillDataService,
     private toastr: ToastrService,
     private datepipe: DatePipe,
     private shared: SharedService,) {
      this.role = localStorage.getItem('role');
      this.current_location = localStorage.getItem('location')
  }
  
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
    this.invoiceSwitcher('A');
  }
  
  init(){
    this.getAllOffers();
    this.getAllProducts();
    this.fetchData(this.current_location)
  }

  async checkUserLoggedIn(){
    const session = await this.shared.checkUserLoggedIn();
    if(session){
      this.init();
    } else{
      this.route.navigateByUrl('/login');
      this.loading = false;
      localStorage.clear();
    }
  }

  fetchData(location:any){
    this.loading = true;
    this.api.getInventory(location).subscribe((res:any) =>{
      let invoiceNumber = res.data[0].invoiceNumber;
      this.userForm.get('invoiceNumber')?.setValue(invoiceNumber);
      this.loading = false;
    })
  }

  getAllProducts(){
    this.loading = true;
    this.api.getAllProducts().subscribe((res:any) =>{
      if(res){
        this.allProductsList = res.data;
        this.loading = false;
      }
    }, (error) =>{
      this.loading = false;
    })
  }

  setData(){
    this.userForm.get('phnNumber')?.setValue(this.currentActiveInvoiceData.UserPhnNumber)
    this.userForm.get('name')?.setValue(this.currentActiveInvoiceData.UserName)
    this.userForm.get('address')?.setValue(this.currentActiveInvoiceData.UserAddress)
    this.userForm.get('rewardPoints')?.setValue(this.currentActiveInvoiceData.RewardPoints)
    this.userForm.get('customerType')?.setValue(this.currentActiveInvoiceData.CustomerType);
    this.redeemPoints.setValue(this.currentActiveInvoiceData.RedeemPoints);
    this.selectedOffer = this.currentActiveInvoiceData.currentOffer;
    this.currentRewardsHistory = this.currentActiveInvoiceData.RewardsHistory;
    this.confirmRedeemFlag = this.currentActiveInvoiceData.confirmRedeem;

    if(this.confirmRedeemFlag){
      this.redeemPoints.disable();
    }
    this.userForm.get('paymentType')?.setValue(this.currentActiveInvoiceData.PaymentType);
    setTimeout(() => {
      this.focusBarcode();
      this.loading = false; 
    }, 50);
  }

  scanBarcode() {
    const index = this.allProductsList.findIndex((product: { barcode: any; }) => product.barcode === this.barcodeScan.value);
    let currentRowString = String(this.currentRow);
    
    const existingItemRow = Object.entries(this.rows.controls).find(([rowIndex, rowControl]) => {
        const itemNameControl = rowControl.get('itemName');
        return itemNameControl && itemNameControl.value === this.allProductsList[index].itemName;
    });

    if (existingItemRow) {
        const existingRowIndex = existingItemRow[0];
        const quantityControl = this.rows.get(existingRowIndex)?.get('quantity');
        if (quantityControl) {
            const currentQuantity = quantityControl.value || 0;
            let rowCount = +existingRowIndex;
            quantityControl.setValue(currentQuantity + 1);
            this.rows.get(existingRowIndex)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[index].sellingPrice, this.rows.get(existingRowIndex)?.get('quantity')?.value));
            this.currentActiveInvoiceData.BillDetails[rowCount] = this.rows.get(existingRowIndex)?.value;
            this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
        }
    } else {
        this.rows.get(currentRowString)?.get('itemName')?.setValue(this.allProductsList[index].itemName);
        this.rows.get(currentRowString)?.get('quantity')?.setValue(1);
        this.rows.get(currentRowString)?.get('mrp')?.setValue(this.allProductsList[index].mrp);
        this.rows.get(currentRowString)?.get('discount')?.setValue(this.calcDiscount(this.allProductsList[index].mrp,this.allProductsList[index].sellingPrice));
        this.rows.get(currentRowString)?.get('rate')?.setValue(this.allProductsList[index].sellingPrice);
        this.rows.get(currentRowString)?.get('amount')?.setValue(this.calcAmount(this.allProductsList[index].sellingPrice,this.allProductsList[index].gst));
        this.rows.get(currentRowString)?.get('gst')?.setValue(this.allProductsList[index].gst);
        this.rows.get(currentRowString)?.get('gstAmount')?.setValue(this.calcGSTAmount(this.allProductsList[index].sellingPrice,this.allProductsList[index].gst));
        this.rows.get(currentRowString)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[index].sellingPrice, this.rows.get(currentRowString)?.get('quantity')?.value));
        this.rows.get(currentRowString)?.get('_id')?.setValue(this.allProductsList[index]._id)
        this.rows.get(currentRowString)?.get('productType')?.setValue(this.allProductsList[index].productType)
        this.currentActiveInvoiceData.BillDetails[this.currentRow] = this.rows.get(currentRowString)?.value;
        this.currentRow = this.currentRow + 1;
        this.currentActiveInvoiceData.currentRow = this.currentRow;
        this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
    }
    this.barcodeScan.reset();
    this.calcTotalAmount();
}

  itemChanged(changed:string, currentRow: number){
    let row = String(currentRow)
    if(changed == 'quantity'){
      if(this.rows.get(row)?.get('quantity')?.value == 0){
        this.removeItem(currentRow);
      }
      else{
        this.rows.get(row)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[currentRow].sellingPrice, this.rows.get(row)?.get('quantity')?.value));
      }
    }
    else if(changed == 'mrp'){
      let discount = this.rows.get(row)?.get('discount')?.value;
      this.rows.get(row)?.get('rate')?.setValue(this.calcRate(this.rows.get(row)?.get('mrp')?.value, discount));
      this.rows.get(row)?.get('amount')?.setValue(this.calcAmount(this.rows.get(row)?.get('rate')?.value,this.rows.get(row)?.get('gst')?.value));
      this.rows.get(row)?.get('gstAmount')?.setValue(this.calcGSTAmount(this.rows.get(row)?.get('rate')?.value,this.rows.get(row)?.get('gst')?.value));
      this.rows.get(row)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.rows.get(row)?.get('rate')?.value, this.rows.get(row)?.get('quantity')?.value))
    }
    else if(changed == 'rate'){
      this.rows.get(row)?.get('discount')?.setValue(this.calcDiscount(this.rows.get(row)?.get('mrp')?.value, this.rows.get(row)?.get('rate')?.value));
      this.rows.get(row)?.get('amount')?.setValue(this.calcAmount(this.rows.get(row)?.get('rate')?.value,this.rows.get(row)?.get('gst')?.value));
      this.rows.get(row)?.get('gstAmount')?.setValue(this.calcGSTAmount(this.rows.get(row)?.get('rate')?.value,this.rows.get(row)?.get('gst')?.value));
      this.rows.get(row)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.rows.get(row)?.get('rate')?.value, this.rows.get(row)?.get('quantity')?.value))
    }
    this.currentActiveInvoiceData.BillDetails[currentRow] = this.rows.get(row)?.value;
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
    this.calcTotalAmount();
  }

  removeItem(index:any){
    this.currentRow = this.currentRow - 1;
    this.rows.removeAt(index);
    if(this.currentRow <this.totalRows){
      this.rows.push(this.newRow())
    }
    this.calcTotalAmount();
    this.deleteIndex = -1;
    this.closeModal('deleteItemModal')
  }

  calcRate(mrp:number, discount:number){
    let rate = (mrp-(mrp * (discount/100)))
    return rate;
  }

  calcDiscount(mrp:number, rate:number){
    let discount = (((mrp-rate)/mrp)*100);
    return parseFloat(discount.toFixed(2));
  }

  calcAmount(rate:number, gst:number){
    let amount = (rate - (rate*gst/(gst+100)))
    return amount;
  }

  calcGSTAmount(rate:number, gst:number){
    let gstAmt = (rate*gst/(gst+100))
    return gstAmt;
  }

  calcFinalAmount(rate:number, quantity:number){
    let FinalAmount = (rate*quantity)
    return FinalAmount;
  }

  calcTotalAmount(){
    this.currentActiveInvoiceData.totalAmount = 0
    for(let i = 0; i < this.currentRow; i++){
      let row = String(i)
      this.currentActiveInvoiceData.totalAmount = this.currentActiveInvoiceData.totalAmount + this.rows.get(row)?.get('finalAmount')?.value;
    }
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  getMRP(id:string){
    console.log(id)
    let product = this.allProductsList.find((product: { _id: string; }) => product._id === id);
    return product.mrp
  }

  searchUser(){
    if(this.phnNumber.valid){
      let data = this.phnNumber.value;
      this.api.getUserDetail(data).subscribe((res:any) =>{
      this.loading = true;
      if(res.data.length !=0){
        const data = res.data[0]
        this.userForm.get('phnNumber')?.setValue(data.phone_Number)
        this.currentActiveInvoiceData.UserPhnNumber = data.phone_Number;
        this.userForm.get('name')?.setValue(data.name)
        this.currentActiveInvoiceData.UserName = data.name;
        this.userForm.get('address')?.setValue(data.address.addressLine2)
        this.currentActiveInvoiceData.UserAddress = data.address.addressLine2;
        this.userForm.get('rewardPoints')?.setValue(data.rewardPoint)
        this.currentActiveInvoiceData.RewardPoints = data.rewardPoint;
        this.currentRewardsHistory = data.rewardPointsHistory;
        this.currentActiveInvoiceData.RewardsHistory = data.rewardPointsHistory;
        this.userForm.get('customerType')?.setValue("Existing");
        this.currentActiveInvoiceData.CustomerType = "Existing";
        this.closeModal('getUserModal');
        this.phnNumber.reset();
        this.toastr.show('success','User found',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr",
        })
        this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
        this.loading = false;
      }
      else{
        this.closeModal('getUserModal');
        this.toastr.show('error','User not found',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr",
          })
          this.loading = false;
          this.addUserForm.get('phnNumber')?.setValue(data);
        this.openModal('addUserModal')
      }
    })
    }
  }

  addUser(){
    if(!this.addUserForm.invalid){
      this.loading = true;
      const input = this.addUserForm.value;
      const obj = {
        "name": input.name,
        "phone_Number": input.phnNumber,
        "address": {
            "addressLine1": input.addressL1,
            "addressLine2": input.addressL2,
            "addressLine3": input.addressL3,
            "city": input.city,
            "state": input.state,
            "pincode":  input.pincode
        },
        "rewardPoint": 0,
        "rewardPointsHistory":[],
        "totalTransaction": 0
      }
      this.api.addUser(obj).subscribe((res:any)=>{
        if(res){
          const data = res.data;
          this.userForm.get('phnNumber')?.setValue(data.phone_Number)
          this.currentActiveInvoiceData.UserPhnNumber = data.phone_Number;
          this.userForm.get('name')?.setValue(data.name)
          this.currentActiveInvoiceData.UserName = data.name;
          if(data.address){
            this.userForm.get('address')?.setValue(data.address.addressLine2)
            this.currentActiveInvoiceData.UserAddress = data.address.addressLine2;
          }
          else{
            this.userForm.get('address')?.setValue('')
            this.currentActiveInvoiceData.UserAddress = '';
          }  
          this.userForm.get('rewardPoints')?.setValue(data.rewardPoint)
          this.currentActiveInvoiceData.RewardPoints = data.rewardPoint;
          this.currentRewardsHistory = data.rewardPointsHistory;
          this.currentActiveInvoiceData.RewardsHistory = data.rewardPointsHistory;
          this.userForm.get('customerType')?.setValue("New")
          this.currentActiveInvoiceData.CustomerType = "New";
          this.closeModal('addUserModal');
          this.addUserForm.reset();
          this.toastr.show('success','User created',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr",
          })
          this.loading = false;
          this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
        }
      }, (error)=>{
        this.loading = false;
        this.toastr.show('error','User not created',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr"
        })
      })
    }
  }

  customerTypeChanged(){
    this.currentActiveInvoiceData.CustomerType = this.userForm.get('customerType')?.value;
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  rewardsTabSwticher(currentTab:string){
    this.currentRewardsTab = currentTab;
  }

  setReedemValue(value: number){
    this.redeemPoints.setValue(value);
    this.currentActiveInvoiceData.RedeemPoints = value;
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  applyReedemCode(){
    if(this.redeemPoints.value <= this.currentActiveInvoiceData.RewardPoints && this.redeemPoints.value >= 0){
      this.currentActiveInvoiceData.totalAmount = this.currentActiveInvoiceData.totalAmount - this.redeemPoints.value;
      this.currentActiveInvoiceData.RedeemPoints = this.redeemPoints.value
      this.confirmRedeemFlag = true;
      this.currentActiveInvoiceData.confirmRedeem = true;
      this.redeemPoints.disable();
      this.closeModal('rewardsModal');
      this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
    }
    else{
      this.redeemPoints.reset();
      this.toastr.show('error','Error Invalid Redeem Points',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr",
      })
    }
  }

  editReedemCode(){
    this.currentActiveInvoiceData.totalAmount = this.currentActiveInvoiceData.totalAmount + this.redeemPoints.value;
    this.confirmRedeemFlag = false;
    this.currentActiveInvoiceData.confirmRedeem = false;
    this.redeemPoints.enable();
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  getAllOffers(){
    this.api.getAllOffers().subscribe((res:any) =>{
      this.offers = res.data;
    })
  }

  checkOfferLocation(offer:any){
    let locationCheck = offer.location.includes(this.current_location)
    return locationCheck;
  }

  offerApplied(offer:any){
    this.selectedOffer = offer;
    this.selectedOffer.mrp = this.getMRP(this.selectedOffer.product)
    this.currentActiveInvoiceData.currentOffer._id = this.selectedOffer._id;
    this.currentActiveInvoiceData.currentOffer.offerName = this.selectedOffer.offerName;
    this.currentActiveInvoiceData.currentOffer.minimumPrice = this.selectedOffer.minimumPrice;
    this.currentActiveInvoiceData.currentOffer.product = this.selectedOffer.product;
    this.currentActiveInvoiceData.currentOffer.location = this.selectedOffer.location;
    this.currentActiveInvoiceData.currentOffer.mrp = this.selectedOffer.mrp;
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  offerUnApply(){
    this.selectedOffer = null;
    this.currentActiveInvoiceData.currentOffer._id = "";
    this.currentActiveInvoiceData.currentOffer.offerName = "";
    this.currentActiveInvoiceData.currentOffer.minimumPrice = 0
    this.currentActiveInvoiceData.currentOffer.product = "";
    this.currentActiveInvoiceData.currentOffer.location = [];
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  paymentType(){
    setTimeout(() => {
      this.currentActiveInvoiceData.PaymentType = this.userForm.get('paymentType')?.value;
      this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }, 10);
  }

  saveBill(){
    const body = this.currentActiveInvoiceData;
    delete (body as any).RewardPoints;
    delete (body as any).RewardsHistory;
    delete (body as any).UserAddress;
    delete (body as any).UserName;
    delete (body as any).currentRow;
    (body as any).location = this.current_location
    console.log(body)
    const printContents = document.getElementById('bill-content');
    if (printContents) {
      // Create a new iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                /* Add any styles you want for printing here */
                body {
                  font-family: Arial, sans-serif;
                  width:300px;
                  display: flex;
                  gap: 5px;
                  flex-direction:column;
                  justify-content:center;
                  align-items:center;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                table, th, td {
                  border: 1px solid black;
                }
                h2, p{
                  text-align: center;
                  margin: 0px
                }
              </style>
            </head>
            <body>${printContents.innerHTML}</body>
          </html>
        `);
        iframeDoc.close();

        const iframeWin = iframe.contentWindow;
        if (iframeWin) {
          iframeWin.focus();
          iframeWin.print();

          // Delay the removal to ensure the print dialog is not disrupted
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } else {
          console.error('Iframe window is null');
        }
      } else {
        console.error('Iframe document is null');
      }
    } else {
      console.error('Bill content element not found');
    }
  }

  deleteBill(){
    this.loading = true;
    this.userForm.reset();
    this.redeemPoints.reset();
    this.phnNumber.reset();
    this.confirmRedeemFlag = false;
    this.billDataForm.reset();
    this.currentRow = 0;
    this.currentActiveInvoiceData = this.billData.deleteData(this.currentActiveInvoice);
    setTimeout(() => {
      this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData);
      this.setData();
      this.closeModal('deleteModal');
    }, 500);
    
  }

  invoiceSwitcher(invoiceNumer:string){
    this.addUserForm.reset();
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
    // this.fetchData(this.current_location);
    this.barcodeScan.reset();
    this.calculateRows();
    this.setData();
  }

  setFormBuilder(){
    this.userForm = this.fb.group({
      invoiceNumber: [''],
      name: [''],
      phnNumber: [''],
      address: [''],
      rewardPoints: [''],
      customerType: [''],
      paymentType: ['']
    });

    this.addUserForm = this.fb.group({
      name: [''],
      phnNumber: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.required]],
      addressL1: [''],
      addressL2: [''],
      addressL3: [''],
      city: [''],
      state: [''],
      pincode: [0, [Validators.minLength(6), Validators.maxLength(6)]]
    })

    this.billDataForm = this.fb.group({
      rows: this.fb.array([])
    })
  }

  get rows(): FormArray {
    return this.billDataForm.get("rows") as FormArray;
  }

  newRow(): FormGroup {
    return this.fb.group({
        itemName: [''],
        quantity: [0],
        mrp: [0],
        discount: [0],
        rate: [0],
        amount: [0],
        gst: [0],
        gstAmount: [0],
        finalAmount: [0],
        _id: [''],
        productType: ['']
    });
  }

  calculateRows(){
    this.rows.clear();
    setTimeout(() => {
      const divElement = this.tableBody.nativeElement as HTMLElement;
      const height = divElement.clientHeight;
      let rows = Math.floor(height/30)
      rows = rows - 3;
      let calculatedHeight = (rows-2) * 30.8;
      this.maxHeight = `${calculatedHeight}px`
      this.initializeEmptyTable(rows)
      this.totalRows = rows;
      if(this.currentActiveInvoiceData.BillDetails.length > 0){
        for(let index=0; index < this.currentActiveInvoiceData.currentRow; index++){
          let currentRowString = String(index)
          this.rows.get(currentRowString)?.get('itemName')?.setValue(this.currentActiveInvoiceData.BillDetails[index].itemName);
          this.rows.get(currentRowString)?.get('quantity')?.setValue(this.currentActiveInvoiceData.BillDetails[index].quantity);
          this.rows.get(currentRowString)?.get('mrp')?.setValue(this.currentActiveInvoiceData.BillDetails[index].mrp);
          this.rows.get(currentRowString)?.get('discount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].discount);
          this.rows.get(currentRowString)?.get('rate')?.setValue(this.currentActiveInvoiceData.BillDetails[index].rate);
          this.rows.get(currentRowString)?.get('amount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].amount);
          this.rows.get(currentRowString)?.get('gst')?.setValue(this.currentActiveInvoiceData.BillDetails[index].gst);
          this.rows.get(currentRowString)?.get('gstAmount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].gstAmount);
          this.rows.get(currentRowString)?.get('finalAmount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].finalAmount);
        }
      }
      this.currentRow = this.currentActiveInvoiceData.currentRow;
    }, 50);
  }

  initializeEmptyTable(row: any){
    this.billDataForm.reset();
    for (let i = 0; i < row-2; i++) {
      this.rows.push(this.newRow());
    }
  }

  focusBarcode(){
    this.barcode.nativeElement.focus();
  }

  openModal(id:any){
    if(id == 'rewardsModal'){
      this.calculatePoints(this.currentRewardsHistory)
    }
    $("#"+id).modal('show');
  }

  openItemModal(id:any, index:number){
    this.deleteIndex = index;
    $("#"+id).modal('show');
  }

  closeModal(id:any){
    $("#"+id).modal('hide');
    this.focusBarcode();
  }

  formatDate(dateString: string): string {
    const formattedDate = this.datepipe.transform(dateString, 'dd-MM-yyyy');
    return formattedDate || ''; // Handle null or undefined result
  }

  getColor(value: number): string {
    if (value > 0) {
      return '#63CE61';
    } else if (value < 0) {
      return '#FF4D4D';
    } else {
      return 'black'; // Or any color for zero
    }
  }

  calculatePoints(history:any){
    this.pointsEarned = 0;
    this.pointsUsed = 0;
    for(let hist of history){
      if(hist.pointsUsed > 0){
        this.pointsEarned = this.pointsEarned + hist.pointsUsed;
      }
      else if(hist.pointsUsed < 0){
        this.pointsUsed = this.pointsUsed + hist.pointsUsed
      }
    }
  }

  logout(){
    this.api.logout().subscribe((res:any) =>{
      localStorage.removeItem('token')
      this.route.navigateByUrl('/login')
    },(error)=>{
      
    });
  }
}
