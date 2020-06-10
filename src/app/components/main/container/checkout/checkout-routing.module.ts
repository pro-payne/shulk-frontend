import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { CustomerGuardService } from 'src/app/services/auth/customer-guard/customer-guard.service';
import { OrderStatusComponent } from '../order-status/order-status.component';


const routes: Routes = [
  { path: 'shipping', component: CheckoutComponent },
  { path: 'payment', component: CheckoutComponent, canActivate: [CustomerGuardService] },
  { path: 'order-status', component: OrderStatusComponent, canActivate: [CustomerGuardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
