import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShopComponent } from '../shop/shop.component';
import { ManagerGuard } from 'src/app/services/auth/manager-guard/manager.guard';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';


const routes: Routes = [
  { path: 'dashboard', component: ShopComponent, canActivate: [ManagerGuard] },
  { path: 'manage-products', component: ManageProductsComponent, canActivate: [ManagerGuard] },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [ManagerGuard] },
  { path: 'shop-profile', component: UserProfileComponent, canActivate: [ManagerGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
