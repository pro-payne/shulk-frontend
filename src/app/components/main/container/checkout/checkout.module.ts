import { NgModule } from '@angular/core';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';
import { SharedModule } from 'src/app/shared';
import { OrderStatusComponent } from '../order-status/order-status.component';


@NgModule({
  declarations: [CheckoutComponent, OrderStatusComponent],
  imports: [
    SharedModule,
    CheckoutRoutingModule
  ]
})
export class CheckoutModule { }
