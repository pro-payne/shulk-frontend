import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CustomerRoutingModule } from './customer-routing.module';
import { ProfileModule } from 'src/app/shared/profile.module';
import { OrdersComponent } from './orders/orders.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    OrdersComponent,
    OrderDetailsComponent,
    WishlistComponent,
    DashboardComponent
  ],
  imports: [
    SharedModule,
    CustomerRoutingModule,
    BsDropdownModule.forRoot(),
    ProfileModule
  ]
})
export class CustomerModule { }
