import { NgModule } from '@angular/core';

import { PartnersRoutingModule } from './partners-routing.module';
import { PartnersComponent } from './partners.component';
import { SharedModule } from 'src/app/shared';


@NgModule({
  declarations: [
    PartnersComponent,
  ],
  imports: [
    PartnersRoutingModule,
    SharedModule
  ]
})
export class PartnersModule { }
