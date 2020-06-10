import { NgModule } from '@angular/core';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './cart.component';
import { SharedModule } from 'src/app/shared';


@NgModule({
  declarations: [CartComponent],
  imports: [
    SharedModule,
    CartRoutingModule
  ]
})
export class CartModule { }
