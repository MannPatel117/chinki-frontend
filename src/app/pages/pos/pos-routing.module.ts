import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingSystemComponent } from './billing-system/billing-system.component';
import { InventorySystemComponent } from './inventory-system/inventory-system.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserHistoryComponent } from './user-history/user-history.component';
import { BillHistoryComponent } from './bill-history/bill-history.component';
import { ProductsMasterComponent } from './products-master/products-master.component';
import { AccountsMasterComponent } from './accounts-master/accounts-master.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { GoodsComponent } from './accounts-master/goods/goods.component';
import { TransactionsComponent } from './accounts-master/transactions/transactions.component';
import { ViewEditGoodsComponent } from './accounts-master/view-edit-goods/view-edit-goods.component';
import { ReconsilationComponent } from './inventory-system/reconsilation/reconsilation.component';
import { OffersMasterComponent } from './offers-master/offers-master.component';
import { ViewBillComponent } from './view-bill/view-bill.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent, // Use HomeComponent as layout
    children: [
      {
        path: 'main', component: MainComponent
      },
      {
        path: '', redirectTo: 'main', pathMatch: 'full' 
      },
      {
        path: 'billing-system', component: BillingSystemComponent
      },
      {
        path: 'inventory-system', component: InventorySystemComponent
      },
      {
        path: 'dashboard', component: DashboardComponent
      },
      {
        path: 'user-history', component: UserHistoryComponent
      },
      {
        path: 'bill-history', component: BillHistoryComponent
      },
      {
        path: 'products-master', component: ProductsMasterComponent
      },
      {
        path: 'accounts-master', component: AccountsMasterComponent
      },
      {
        path: 'accounts-master/:id', component: AccountDetailsComponent
      },
      {
        path: 'accounts/transactions', component: TransactionsComponent
      },
      {
        path: 'accounts/transactions/goods/:inventory', component: GoodsComponent
      },
      {
        path: 'accounts/transactions/goodsAction/:transactionID/:type', component: ViewEditGoodsComponent
      },
      {
        path: 'inventory-system/reconsilation/:inventory', component: ReconsilationComponent
      },
      {
        path: 'offers-master', component: OffersMasterComponent
      },
      {
        path: 'bill-history/bill/:billID/:type', component: ViewBillComponent
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosRoutingModule { }
