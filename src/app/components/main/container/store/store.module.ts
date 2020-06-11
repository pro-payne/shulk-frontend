import { NgModule } from '@angular/core';

import { StoreRoutingModule } from './store-routing.module';
import { SharedModule } from 'src/app/shared';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { ProfileModule } from 'src/app/shared/profile.module';


@NgModule({
  declarations: [
    ManageProductsComponent
  ],
  imports: [
    SharedModule,
    StoreRoutingModule,
    ProfileModule
  ]
})
export class StoreModule { }
