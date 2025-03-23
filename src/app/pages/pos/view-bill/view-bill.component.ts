import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SuccessToast } from '../../../toast/success-toast/toast';
import { ErrorToast } from '../../../toast/error-toast/toast';
import { DatePipe } from '@angular/common';
import { SharedService } from '../../../services/shared/shared.service';
import { StoreBillService } from '../../../services/store-bill/store-bill.service';
declare const $:any;


@Component({
  selector: 'app-view-bill',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterModule, NgFor, NgClass, 
    FormsModule, DatePipe
  ],  
  providers: [DatePipe],
  templateUrl: './view-bill.component.html',
  styleUrl: './view-bill.component.scss'
})
export class ViewBillComponent {
  loading = false;
  @ViewChild('barcode')barcode!: ElementRef;
  @ViewChild('tablebody')tableBody!: ElementRef;
  currentActiveInvoice : string = 'D';
  currentActiveInvoiceData = {
    "totalAmount": 0,
    "totalAmountF": 0,
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
      "couponID": "",
      "isCoupon": false,
      "offerID": "",
      "offerName": "",
      "minOrderValue": 0,
      "discountPerc": 0,
      "discountAmount": 0,
      "actualDiscountAmount": 0,
      "offerType": "",
      "FreeProduct": {
        "productName":"",
        "productID":"",
        "barcode":"",
        "mrp":0
      },
      "inventory": [],
    },
    "BillDetails": [
      {
        "productName": "",
        "quantity": 0,
        "mrp": 0,
        "discount": 0,
        "rate": 0,
        "amount": 0,
        "gst": 0,
        "gstAmount": 0,
        "finalAmount":0,
        "productID":"",
        "productType": ""
      }
    ],
    "BillFinished": [
      {
        "productName": "",
        "quantity": 0,
        "mrp": 0,
        "discount": 0,
        "rate": 0,
        "amount": 0,
        "gst": 0,
        "gstAmount": 0,
        "finalAmount":0,
        "productID":"",
        "productType": ""
      }
    ],
    "currentRow": 0,
    "currentRowFinished": 0
  }

  allProductsList:any

  currentBillTableData: any[][] = [];
  current_billNumber: any;
  totalRows = 0;
  maxHeight = "";
  currentRow = 0;
  currentRowFinished = 0;

  inventoryData :any;

  currentRewardsTab = 'Redeem';
  currentRewardsHistory:any;
  confirmRedeemFlag = false;
  pointsEarned = 0;
  pointsUsed = 0;

  offers: any;
  selectedOffer = {
    "couponID": "",
    "isCoupon": false,
    "offerID": "",
    "offerName": "",
    "minOrderValue": 0,
    "discountPerc": 0,
    "discountAmount": 0,
    "actualDiscountAmount": 0,
    "offerType": "",
    "inventory": [],
    "FreeProduct": {
      "productName":"",
      "productID":"",
      "barcode":"",
      "mrp":0
    }};

  deleteIndex = -1;

  role:any = 'store';

  inventory:any =[];
  selectedInventoryValue = ''
  inventorySelected: FormControl = new FormControl ('');

  inventoryName: any = [];

  userForm!: FormGroup;
  addUserForm!: FormGroup;
  billDataForm!: FormGroup;
  location:any;
  
  barcodeScan: FormControl = new FormControl ('');
  couponSearch: FormControl = new FormControl ('');
  redeemPoints:FormControl = new FormControl(0, [Validators.min(0)]);

  constructor(private fb: FormBuilder,
     private route: Router,
     private api: ApiService,
     private billData: StoreBillService,
     private toastr: ToastrService,
     private datepipe: DatePipe,
     private shared: SharedService,
     private router: ActivatedRoute,
    private cdr: ChangeDetectorRef) {
      this.role = localStorage.getItem('role');
     
  }

  confirmInventory(){
    $('#selectInventoryBill').modal('hide');
    localStorage.setItem('selectedLocation', this.inventorySelected.value)
    this.init();
  }
  billID= '';
  actionType='';
  ngOnInit(){
    this.loading = true;
    this.checkUserLoggedIn();
    this.setFormBuilder();
    this.invoiceSwitcher('D');
    this.router.paramMap.subscribe((params) => {
      this.billID = params.get('billID') || '';
      if (this.billID == '') {
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
        this.route.navigateByUrl('/pos/bill-history');
      }
      this.actionType = params.get('type') || '';
      if (this.actionType == '') {
        this.toastr.show('error', 'Something went wrong', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
        this.route.navigateByUrl('/pos/bill-history');
      }
    });
    this.init();
  }
  
  init(){
    this.getBillDetails();
    this.getAllOffers();
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

  async checkUserLoggedIn(){
    let role = localStorage.getItem('role');
    const session = await this.shared.checkUserLoggedIn(role);
    if(session){
      
    } else{
      this.route.navigateByUrl('/login');
      this.loading = false;
      localStorage.clear();
    }
  }


  async getBillDetails(){
    this.loading = true;
    try {
      this.api.getAPI('/bills/bill/'+this.billID, []).subscribe(async (res: any) => {
        if (res.success == true) {
          const data = res.data;
          let current_location = data.inventoryID;
          this.location = data.inventoryID;
          this.getAllProducts(current_location).then(()=>{
            if(data.offerID != null){
              this.currentActiveInvoiceData.currentOffer.offerName = data.Offer.offerName;
              this.currentActiveInvoiceData.currentOffer.offerID = data.Offer.offerID;
              this.currentActiveInvoiceData.currentOffer.offerID = data.Offer.offerID;
              this.currentActiveInvoiceData.currentOffer.minOrderValue = data.Offer.minOrderValue;
              this.currentActiveInvoiceData.currentOffer.offerType = data.Offer.offerType;
              if(data.Offer.offerType == 'free_product'){
                this.currentActiveInvoiceData.currentOffer.FreeProduct.mrp = this.getMRP(data.Offer.freeProductID)
                console.log(this.getMRP(data.Offer.freeProductID))
              } 
              else if(data.Offer.offerType == 'flat_discount'){
                this.currentActiveInvoiceData.currentOffer.discountPerc = data.Offer.discountPerc;
                let amount = this.currentActiveInvoiceData.totalAmount * ((data.Offer.discountPerc)/100);
                let finalAmount = parseFloat(amount.toFixed(2));
                if(amount >= data.Offer.discountAmount){
                  this.currentActiveInvoiceData.currentOffer.actualDiscountAmount = data.Offer.discountAmount;
                  data.Offer.actualDiscountAmount = data.Offer.discountAmount;
                } else{
                  data.Offer.actualDiscountAmount = finalAmount;
                  this.currentActiveInvoiceData.currentOffer.actualDiscountAmount = data.Offer.actualDiscountAmount;
                }}
            }
          });
          this.api.getAPI('/inventorys/inventory/'+current_location, [["details", true]]).subscribe((res:any) => {
            this.inventoryData = res.data;
              let inventoryName = res.data.inventoryName;
              this.userForm.get('inventoryName')?.setValue(inventoryName);
              this.loading = false;
          }
        )
        this.userForm.get('invoiceNumber')?.setValue(data.billNumber);
        if(data.phoneNumber != null){
          this.currentActiveInvoiceData.UserPhnNumber = data.phoneNumber;
          this.currentActiveInvoiceData.UserName = data.User.name;
          this.currentActiveInvoiceData.UserAddress = data.User.addressLine1;
          this.currentActiveInvoiceData.RewardPoints = data.User.rewardPoint;
          this.currentActiveInvoiceData.CustomerType = data.customerType;
          this.currentActiveInvoiceData.PaymentType = data.paymentType;
        }
        this.currentActiveInvoiceData.totalAmount = data.finalAmount;
        this.currentActiveInvoiceData.RedeemPoints = data.rewardPointsUsed;
        
        this.currentActiveInvoiceData.BillDetails = data.billDetails.map((detail: any) => ({
          productName: detail.productName || "",
          quantity: detail.quantity || 0,
          mrp: detail.mrp || 0,
          discount: detail.discountPerc || 0,
          rate: detail.rate || 0,
          amount: detail.amount || 0,
          gst: detail.gstPerc || 0,
          gstAmount: (detail.cgstAmount || 0) + (detail.sgstAmount || 0),
          finalAmount: detail.netAmount || 0,
          productID: detail.productID || "",
          productType: detail.productType || "",
        }));
        this.currentActiveInvoiceData.currentRow = this.currentActiveInvoiceData.BillDetails.length
        console.log(this.currentActiveInvoiceData.BillDetails)
        await this.calculateRows().then(
          ()=>{
            this.setData();
          }
        );
          // this.transactionData = res.data;
          // this.transactionDetailData = this.transactionData.transactionDetail;
          // this.setFormValues(this.transactionData, this.transactionForm)
          // this.setFormArrayValues(this.transactionDetailData, this.transactionDetailForm)
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

  getAllProducts(location:any){
    this.loading = true;
    return new Promise((resolve) => {
      try{
        this.api.getAPI('/inventoryDetails/billing', [["status",  "active"], ["inventory", JSON.stringify([location])]]).subscribe((res:any) => {
          this.loading = true;
          if(res.data.length == 0){
            this.allProductsList = res.data;
            console.log(this.allProductsList)
            this.loading = false;
          }else{
            this.allProductsList = res.data;
            console.log(this.allProductsList)
            resolve(true)
            this.loading = false;
          }
        }
      ),(error:any)=>{
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      };
      }
      catch(err){
        this.loading = false;
        this.toastr.show('error','Something went wrong',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      }
      this.loading= false;
      
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
      this.loading = false; 
    }, 50);
    if(this.actionType == 'view'){
      this.billDataForm.disable();
    }
  }

  scanBarcode() {
    const index = this.allProductsList.findIndex((product: { MasterProduct: any; }) => product.MasterProduct.barcode === this.barcodeScan.value);
    let currentRowString = String(this.currentRow);
    let prdid:any=-1;
    const existingItemRow = Object.entries(this.rows.controls).find(([rowIndex, rowControl]) => {
        const itemNameControl = rowControl.get('productID');
        prdid = itemNameControl?.value || -1;
        return itemNameControl && itemNameControl.value === this.allProductsList[index].MasterProduct.productID;
    });

    if (existingItemRow) {
        const existingRowIndex = existingItemRow[0];
        const quantityControl = this.rows.get(existingRowIndex)?.get('quantity');
        if (quantityControl) {
            const currentQuantity = quantityControl.value || 0;
            let rowCount = +existingRowIndex;
            quantityControl.setValue(currentQuantity + 1);
            this.rows.get(existingRowIndex)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[index].MasterProduct.sellingPrice, this.rows.get(existingRowIndex)?.get('quantity')?.value));
            this.currentActiveInvoiceData.BillDetails[rowCount] = this.rows.get(existingRowIndex)?.value;
            this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData);
        }
    } else {
        this.rows.get(currentRowString)?.get('productName')?.setValue(this.allProductsList[index].MasterProduct.productName);
        this.rows.get(currentRowString)?.get('quantity')?.setValue(1);
        this.rows.get(currentRowString)?.get('mrp')?.setValue(this.allProductsList[index].MasterProduct.mrp);
        this.rows.get(currentRowString)?.get('discount')?.setValue(this.calcDiscount(this.allProductsList[index].MasterProduct.mrp,this.allProductsList[index].MasterProduct.sellingPrice));
        this.rows.get(currentRowString)?.get('rate')?.setValue(this.allProductsList[index].MasterProduct.sellingPrice);
        this.rows.get(currentRowString)?.get('amount')?.setValue(this.calcAmount(this.allProductsList[index].MasterProduct.sellingPrice,this.allProductsList[index].MasterProduct.gst));
        this.rows.get(currentRowString)?.get('gst')?.setValue(this.allProductsList[index].MasterProduct.gst);
        this.rows.get(currentRowString)?.get('gstAmount')?.setValue(this.calcGSTAmount(this.allProductsList[index].MasterProduct.sellingPrice,this.allProductsList[index].MasterProduct.gst));
        this.rows.get(currentRowString)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[index].MasterProduct.sellingPrice, this.rows.get(currentRowString)?.get('quantity')?.value));
        this.rows.get(currentRowString)?.get('productID')?.setValue(this.allProductsList[index].productID)
        this.rows.get(currentRowString)?.get('productType')?.setValue(this.allProductsList[index].MasterProduct.productType)
        this.currentActiveInvoiceData.BillDetails[this.currentRow] = this.rows.get(currentRowString)?.value;
        this.currentRow = this.currentRow + 1;
        this.currentActiveInvoiceData.currentRow = this.currentRow;
        this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
        if(this.rows.length==this.currentRow){
          this.rows.push(this.newRow());
        }
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
        this.rows.get(row)?.get('finalAmount')?.setValue(this.calcFinalAmount(this.allProductsList[currentRow].MasterProduct.sellingPrice, this.rows.get(row)?.get('quantity')?.value));
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
    return parseFloat(amount.toFixed(2));
  }

  calcGSTAmount(rate:number, gst:number){
    let gstAmt = (rate*gst/(gst+100))
    return parseFloat(gstAmt.toFixed(2));
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

  calcTotalAmountFinished(){
    this.currentActiveInvoiceData.totalAmountF = 0
    for(let i = 0; i < this.currentActiveInvoiceData.BillFinished.length; i++){
      let row = String(i)
      this.currentActiveInvoiceData.totalAmountF = this.currentActiveInvoiceData.totalAmountF + this.currentActiveInvoiceData.BillFinished[i].finalAmount;
    }
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  getMRP(id:string){
    console.log(this.allProductsList)
    let product = this.allProductsList.find((product: { productID: string; }) => product.productID === id);
    return product.MasterProduct.mrp
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
        toastComponent: ErrorToast,
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
    try {
      this.api
        .getAPI('/offers/', [
          ['pagination', false],
          ['status', true],
          ['isCoupon', false],
        ])
        .subscribe((res: any) => {
          this.loading = true;
          if (res.data.length == 0) {
            this.offers = res.data;
            this.loading = false;
          } else {
            this.offers = res.data;
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

  convertOfferData(offer: any): any {
    return {
      ...offer,
      minOrderValue: parseFloat(offer.minOrderValue as string),
      discountPerc: offer.discountPerc ? parseFloat(offer.discountPerc as string) : null,
      discountAmount: offer.discountAmount ? parseFloat(offer.discountAmount as string) : null,
      actualDiscountAmount: offer.actualDiscountAmount ? parseFloat(offer.actualDiscountAmount as string) : null,
    };
  }

  checkOfferLocation(offer:any){
    let locationCheck = offer.inventory.includes(this.inventorySelected.value)
    return locationCheck;
  }

  offerApplied(offer:any, isCoupon: boolean){
    if(this.selectedOffer.offerID!=''){
      this.offerUnApply();
    }
    if(isCoupon == false){
      this.currentActiveInvoiceData.currentOffer.couponID =  '';
      this.currentActiveInvoiceData.currentOffer.isCoupon = false;
      this.selectedOffer.couponID = '';
      this.selectedOffer.isCoupon = false;
    }
    this.selectedOffer = this.convertOfferData(offer);
    this.currentActiveInvoiceData.currentOffer.offerID = this.selectedOffer.offerID;
    this.currentActiveInvoiceData.currentOffer.offerName = this.selectedOffer.offerName;
    this.currentActiveInvoiceData.currentOffer.minOrderValue = this.selectedOffer.minOrderValue;
    this.currentActiveInvoiceData.currentOffer.offerType = this.selectedOffer.offerType;
    if(this.selectedOffer.offerType == 'free_product'){
      this.currentActiveInvoiceData.currentOffer.FreeProduct.productName = this.selectedOffer.FreeProduct.productName;
      this.currentActiveInvoiceData.currentOffer.FreeProduct.productID = this.selectedOffer.FreeProduct.productID;
      this.currentActiveInvoiceData.currentOffer.FreeProduct.barcode = this.selectedOffer.FreeProduct.barcode;
      this.currentActiveInvoiceData.currentOffer.FreeProduct.mrp = this.getMRP(this.selectedOffer.FreeProduct.productID)
      this.selectedOffer.FreeProduct.mrp = this.getMRP(this.selectedOffer.FreeProduct.productID)
    } else if(this.selectedOffer.offerType == 'flat_discount'){
      this.currentActiveInvoiceData.currentOffer.discountPerc = this.selectedOffer.discountPerc;
      let amount = this.currentActiveInvoiceData.totalAmount * ((this.selectedOffer.discountPerc)/100);
      let finalAmount = parseFloat(amount.toFixed(2));
      if(amount >= this.selectedOffer.discountAmount){
        this.currentActiveInvoiceData.currentOffer.actualDiscountAmount = this.selectedOffer.discountAmount;
        this.selectedOffer.actualDiscountAmount = this.selectedOffer.discountAmount;
      } else{
        this.selectedOffer.actualDiscountAmount = finalAmount;
        this.currentActiveInvoiceData.currentOffer.actualDiscountAmount = this.selectedOffer.actualDiscountAmount;
      }
      this.currentActiveInvoiceData.currentOffer.discountAmount = this.selectedOffer.discountAmount;
      this.currentActiveInvoiceData.totalAmount = this.currentActiveInvoiceData.totalAmount - this.selectedOffer.actualDiscountAmount;
    }
    
    this.currentActiveInvoiceData.currentOffer.inventory = this.selectedOffer.inventory;
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData);
    this.closeModal('offersModal');
  }

  offerUnApply(){
    this.selectedOffer = {
      "couponID": "",
      "isCoupon": false,
      "offerID": "",
      "offerName": "",
      "minOrderValue": 0,
      "discountPerc": 0,
      "discountAmount": 0,
      "actualDiscountAmount": 0,
      "offerType": "",
      "inventory": [],
      "FreeProduct": {
        "productName":"",
        "productID":"",
        "barcode":"",
        "mrp":0
      }};
    this.currentActiveInvoiceData.currentOffer.offerID = "";
    this.currentActiveInvoiceData.currentOffer.offerName = "";
    this.currentActiveInvoiceData.currentOffer.minOrderValue = 0;
    
    if(this.currentActiveInvoiceData.currentOffer.offerType == 'free_product'){
      this.currentActiveInvoiceData.currentOffer.FreeProduct.productName = "";
      this.currentActiveInvoiceData.currentOffer.FreeProduct.productID = "";
      this.currentActiveInvoiceData.currentOffer.FreeProduct.barcode = "";
      this.currentActiveInvoiceData.currentOffer.FreeProduct.mrp = 0
      this.currentActiveInvoiceData.currentOffer.FreeProduct.mrp = 0;
    } else if(this.currentActiveInvoiceData.currentOffer.offerType == 'flat_discount'){
      this.currentActiveInvoiceData.totalAmount = this.currentActiveInvoiceData.totalAmount + this.currentActiveInvoiceData.currentOffer.actualDiscountAmount;
      this.currentActiveInvoiceData.currentOffer.discountPerc = 0;
      this.currentActiveInvoiceData.currentOffer.actualDiscountAmount = 0;
      this.currentActiveInvoiceData.currentOffer.discountAmount = 0;
    }
    this.currentActiveInvoiceData.currentOffer.inventory = [];
    this.currentActiveInvoiceData.currentOffer.offerType = "";
    this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }

  applyCoupon(){
    this.offerUnApply();
    try{
      this.api.getAPI('/offers/couponRedeem/'+ this.couponSearch.value, []).subscribe((res:any) => {
        if(res.success == true){
          if(res.data.length== 0){
            this.toastr.show('error','Already used',{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
          }else{
            let id = res.data[0].offerID
            try{
              this.api.getAPI('/offers/offer/'+ id, []).subscribe((res:any) => {
                if(res.success == true){
                  this.currentActiveInvoiceData.currentOffer.couponID =  this.couponSearch.value;
                  this.currentActiveInvoiceData.currentOffer.isCoupon = true;
                  this.selectedOffer.couponID = this.couponSearch.value;
                  this.selectedOffer.isCoupon = true;
                  this.couponSearch.setValue('');
                  this.offerApplied(res.data, true)
                }else{
                  this.toastr.show('error','Something went wrong',{ 
                    toastComponent: ErrorToast,
                    toastClass: "ngx-toastr"
                  })
                }
              }
            ),(error:any)=>{
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            };
            }
            catch(err){
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            }
            this.toastr.show('success','Coupon Applied',{ 
              toastComponent: SuccessToast,
              toastClass: "ngx-toastr"
            })
          }
          
        }else{
          this.toastr.show('error','Something went wrong',{ 
            toastComponent: ErrorToast,
            toastClass: "ngx-toastr"
          })
        }
      }
    ),(error:any)=>{
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    };
    }
    catch(err){
      this.loading = false;
      this.toastr.show('error','Something went wrong',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    }
    this.selectedOffer.isCoupon = true
  }

  paymentType(){
    setTimeout(() => {
      this.currentActiveInvoiceData.PaymentType = this.userForm.get('paymentType')?.value;
      this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
  }, 10);
  }

  async filterFinished() {
    return new Promise((resolve) => {
        this.currentActiveInvoiceData.BillFinished = this.currentActiveInvoiceData.BillDetails.filter(
            (item) => item.productType === 'finished'
        );
        this.calcTotalAmountFinished();
        resolve(true);
    });
}



  async saveBill(print:boolean){
    this.closeModal('bill-saveModal');
    await this.filterFinished();
    const body = this.currentActiveInvoiceData;
    delete (body as any).RewardPoints;
    delete (body as any).RewardsHistory;
    delete (body as any).UserAddress;
    delete (body as any).UserName;
    delete (body as any).currentRow;
    (body as any).location = this.location;
    try {
      this.api
        .putAPI('/bills/bill/'+this.billID, [], body)
        .subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success == false) {
              this.toastr.show('error', res.data, {
                toastComponent: ErrorToast,
                toastClass: 'ngx-toastr',
              });
            } else {
              this.toastr.show('success', res.message, {
                toastComponent: SuccessToast,
                toastClass: 'ngx-toastr',
              });
              this.route.navigateByUrl('/pos/bill-history');
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
    if(print == true){
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
    
  }

  printBill(){
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

  async invoiceSwitcher(invoiceNumer:string){
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
      case 'D':
        this.currentActiveInvoice='D';
        this.currentActiveInvoiceData = this.billData.getData('D');
      break;
    }

    this.barcodeScan.reset();    
  }

  setFormBuilder(){
    this.userForm = this.fb.group({
      invoiceNumber: [''],
      inventoryName: [''],
      name: [''],
      phnNumber: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      address: [''],
      rewardPoints: [''],
      customerType: [''],
      paymentType: ['']
    });

    this.addUserForm = this.fb.group({
      name: [''],
      phoneNumber: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.required]],
      addressLine1: [''],
      addressLine2: [''],
      addressLine3: [''],
      city: [''],
      state: [''],
      pincode: [0, [Validators.minLength(6), Validators.maxLength(6)]],
      customerType: [''],
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
      productName: [''],
        quantity: [0],
        mrp: [0],
        discount: [0],
        rate: [0],
        amount: [0],
        gst: [0],
        gstAmount: [0],
        finalAmount: [0],
        productID: [''],
        productType: ['']
    });
  }

  async calculateRows(){
    return new Promise((resolve) => {
      this.rows.clear();
    setTimeout(async () => {
      const divElement = this.tableBody.nativeElement as HTMLElement;
      const height = divElement.clientHeight;
      let rows = Math.floor(height/30)
      rows = rows - 3;
      let calculatedHeight = (rows-2) * 30.8;
      this.maxHeight = `${calculatedHeight}px`
      await this.initializeEmptyTable(rows).then(()=>{
        this.totalRows = rows;
      if(this.currentActiveInvoiceData.BillDetails.length > 0){
        for(let index=0; index < this.currentActiveInvoiceData.currentRow; index++){
          let currentRowString = String(index)
          this.rows.get(currentRowString)?.get('productName')?.setValue(this.currentActiveInvoiceData.BillDetails[index].productName);
          this.rows.get(currentRowString)?.get('quantity')?.setValue(this.currentActiveInvoiceData.BillDetails[index].quantity);
          this.rows.get(currentRowString)?.get('mrp')?.setValue(this.currentActiveInvoiceData.BillDetails[index].mrp);
          this.rows.get(currentRowString)?.get('discount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].discount);
          this.rows.get(currentRowString)?.get('rate')?.setValue(this.currentActiveInvoiceData.BillDetails[index].rate);
          this.rows.get(currentRowString)?.get('amount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].amount);
          this.rows.get(currentRowString)?.get('gst')?.setValue(this.currentActiveInvoiceData.BillDetails[index].gst);
          this.rows.get(currentRowString)?.get('gstAmount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].gstAmount);
          this.rows.get(currentRowString)?.get('finalAmount')?.setValue(this.currentActiveInvoiceData.BillDetails[index].finalAmount);
          this.rows.get(currentRowString)?.get('productID')?.setValue(this.currentActiveInvoiceData.BillDetails[index].productID)
          this.rows.get(currentRowString)?.get('productType')?.setValue(this.currentActiveInvoiceData.BillDetails[index].productType)
        }
      }
      this.currentRow = this.currentActiveInvoiceData.currentRow;
      })
      console.log("DOEN ")
      resolve(true);
    }, 50);
  });
  }

  initializeEmptyTable(row: any){
    return new Promise((resolve) => {
      this.billDataForm.reset();
      for (let i = 0; i < row-2; i++) {
        this.rows.push(this.newRow());
      }
      resolve(true);
  });
    
  }

  openModal(id:any){
    if(id == 'rewardsModal'){
      const phn = this.userForm.get('phnNumber')?.value;
      if(phn == ''){
        this.toastr.show('error','No User Selected',{ 
          toastComponent: ErrorToast,
          toastClass: "ngx-toastr"
        })
      } else {
        this.getRewardsHistory(phn)
        $("#"+id).modal('show');
      }
    } else{
      $("#"+id).modal('show');
    }
  }

  openModalSave(){
    console.log(this.currentActiveInvoiceData)
    if(this.currentActiveInvoiceData.currentRow == 0){
      this.toastr.show('error','Add items to bill',{ 
        toastComponent: ErrorToast,
        toastClass: "ngx-toastr"
      })
    } else{
      $('#bill-saveModal').modal('show');
    }
  }

  openItemModal(id:any, index:number){
    this.deleteIndex = index;
    $("#"+id).modal('show');
  }

  closeModal(id:any){
    $("#"+id).modal('hide');
  }

  formatDate(dateString: string): string {
    const formattedDate = this.datepipe.transform(dateString, 'dd-MM-yyyy');
    return formattedDate || ''; // Handle null or undefined result
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'b') {
      event.preventDefault(); // Prevent default browser behavior (if needed)
      this.openModalSave();
    }
  }


  hoverselectedProduct: any; // Default selected
  searchTerm = ''; // Search input
  dropdownOpen = false; // Dropdown visibility

  // Filter function
  get filteredProduct() {
    return this.searchTerm === ''
      ? this.allProductsList // Show all products when search is empty
      : this.allProductsList.filter((product: { MasterProduct: { productName: string; barcode: string; aliasName: string } }) =>
          [product.MasterProduct?.productName, product.MasterProduct?.barcode, product.MasterProduct?.aliasName]
            .some(field => field?.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
  }

  // Toggle dropdown
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.hoverselectedProduct = '';
    this.hoverselectedIndex = -1;
  }

  // Set selected value and close dropdown
  selectProduct(selectedBarcode: any) {
    this.hoverselectedProduct = selectedBarcode;
    this.searchTerm = ''; // Clear search after selecting
    this.dropdownOpen = false; // Close dropdown
    this.barcodeScan.setValue(selectedBarcode);
    this.scanBarcode();
  }

  hoverselectedIndex = -1; // Track the currently highlighted item

  onKeydown(event: KeyboardEvent) {
    if (!this.dropdownOpen || this.filteredProduct.length === 0) return;
  
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.hoverselectedIndex = (this.hoverselectedIndex + 1) % this.filteredProduct.length;
    } 
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.hoverselectedIndex = (this.hoverselectedIndex - 1 + this.filteredProduct.length) % this.filteredProduct.length;
    } 
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.hoverselectedIndex >= 0) {
        this.selectProduct(this.filteredProduct[this.hoverselectedIndex].MasterProduct.barcode);
      }
    } 
    else if (event.key === 'Escape') {
      this.dropdownOpen = false;
    }
  
    this.cdr.detectChanges();  // ✅ Ensure UI updates instantly
  
    // ✅ Auto-scroll to the selected item
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-item');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 10);
  }



  /*
  
    Checked Code
  
  */

    confirmUser(){
          const phnNumber = this.userForm.get('phnNumber')?.value;
          if(phnNumber.length != 10){
            this.toastr.show('error','Enter valid phone number',{ 
              toastComponent: ErrorToast,
              toastClass: "ngx-toastr"
            })
          } else {
            this.closeModal('bill-searchAddUserModal');
            this.loading = true;
            
            this.api.getAPI('/users/user/'+phnNumber, []).subscribe((res:any) => {
              if(res.success == true){
                this.setUserForm(res.data)
                this.loading = false;
                this.toastr.show('success','User found',{ 
                  toastComponent: SuccessToast,
                  toastClass: "ngx-toastr"
                })
              }else{
                this.toastr.show('error','User not found',{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
                })
                this.loading = false;
                $("#bill-addUserModal").modal('show'); 
                this.userForm.get('phnNumber')?.setValue("");
                this.addUserForm.get('phoneNumber')?.setValue(phnNumber);
              }
            });
          } 
        }


        addUser(){
          if(!this.addUserForm.invalid){
            this.loading = true;
            this.closeModal('bill-addUserModal');
            try{
              this.api.postAPI('/users/user', [], this.addUserForm.value).subscribe((res:any) => {
                this.loading = false;
                if(res.success == true){
                  this.toastr.show('success', res.message,{ 
                    toastComponent: SuccessToast,
                    toastClass: "ngx-toastr",
                  })
                  this.setUserForm(res.data);
                }else{
                  this.toastr.show('error',res.data,{ 
                    toastComponent: ErrorToast,
                    toastClass: "ngx-toastr"
                  })
                }
              }, (err:any)=>{
                this.loading = false;
                this.toastr.show('error',err.error.data,{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
                })
              });
            }
            catch(err){
              this.loading = false;
              this.toastr.show('error','Something went wrong',{ 
                toastComponent: ErrorToast,
                toastClass: "ngx-toastr"
              })
            }
          }
        }

        setUserForm(data:any){
          this.userForm.get('phnNumber')?.setValue(data.phoneNumber)
          this.currentActiveInvoiceData.UserPhnNumber = data.phoneNumber;
          this.userForm.get('name')?.setValue(data.name)
          this.currentActiveInvoiceData.UserName = data.name;
          this.userForm.get('address')?.setValue(data.addressLine1)
          this.currentActiveInvoiceData.UserAddress = data.addressLine1;
          this.userForm.get('rewardPoints')?.setValue(data.rewardPoint)
          this.currentActiveInvoiceData.RewardPoints = data.rewardPoint;
          // this.currentRewardsHistory = data.rewardPointsHistory;
          // this.currentActiveInvoiceData.RewardsHistory = data.rewardPointsHistory;
          this.userForm.get('customerType')?.setValue(data.customerType);
          this.currentActiveInvoiceData.CustomerType = data.customerType;
          this.billData.storeData(this.currentActiveInvoice, this.currentActiveInvoiceData)
        }


        rewardsData:any = [];
        rewardsEarned:Number = 0;
        rewardsRedeemed: Number = 0;

        getRewardsHistory(phone:any){
            this.api.getAPI('/users/rewards', [['phoneNumber', phone]]).subscribe((res:any) => {
              if(res.success == true){
                this.rewardsData = res.data.rewards;
                this.rewardsRedeemed = res.data.totalRedeemed;
                this.rewardsEarned = res.totalEarned;
                this.loading = false;
              }else{
                this.loading = false;   
                this.toastr.show('error',res.message,{ 
                  toastComponent: ErrorToast,
                  toastClass: "ngx-toastr"
                })
              }
            });
        }


       
  
}
