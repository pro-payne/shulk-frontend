import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { SharedModule } from 'src/app/shared';
import { ProfileModule } from 'src/app/shared/profile.module';
import { LoginComponent } from './auth/login/login.component';
import { NotifierModule } from 'angular-notifier';
import { notifierOption } from 'src/app/utility/config/config.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderDetailsComponent } from './directives/order-details/order-details.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


@NgModule({
  declarations: [
    ManageOrdersComponent,
    LoginComponent,
    DashboardComponent,
    OrderDetailsComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    ProfileModule,
    NotifierModule.withConfig(notifierOption),
    BsDropdownModule.forRoot(),
  ],
  entryComponents: [
    OrderDetailsComponent
  ],
})
export class AdminModule { }
