import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingSystemComponent } from './billing-system/billing-system.component';
import { InventorySystemComponent } from './inventory-system/inventory-system.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserHistoryComponent } from './user-history/user-history.component';
import { BillHistoryComponent } from './bill-history/bill-history.component';
import { ProductsMasterComponent } from './products-master/products-master.component';
import { AccountsMasterComponent } from './accounts-master/accounts-master.component';

const routes: Routes = [
  {
    path: '', component: BillingSystemComponent
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosRoutingModule { }
