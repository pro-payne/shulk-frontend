import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerGuardService } from 'src/app/services/auth/customer-guard/customer-guard.service';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [
  { path: 'profile', component: UserProfileComponent, canActivate: [CustomerGuardService] },
  { path: 'account', component: DashboardComponent, canActivate: [CustomerGuardService] },
  { path: 'orders', component: OrdersComponent, canActivate: [CustomerGuardService] },
  { path: 'orders/:order_number', component: OrderDetailsComponent, canActivate: [CustomerGuardService] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [CustomerGuardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
