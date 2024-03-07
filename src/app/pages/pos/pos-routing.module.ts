import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingSystemComponent } from './billing-system/billing-system.component';
import { InventorySystemComponent } from './inventory-system/inventory-system.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserHistoryComponent } from './user-history/user-history.component';
import { BillHistoryComponent } from './bill-history/bill-history.component';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosRoutingModule { }
