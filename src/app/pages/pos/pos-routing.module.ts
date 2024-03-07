import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingSystemComponent } from './billing-system/billing-system.component';

const routes: Routes = [
  {
    path: 'billing-system', component: BillingSystemComponent
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosRoutingModule { }
