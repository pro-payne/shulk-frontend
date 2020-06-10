import { NgModule } from '@angular/core';

import { CategoryRoutingModule } from './category-routing.module';
import { SharedModule } from 'src/app/shared';
import { CategoryComponent } from './category.component';


@NgModule({
  declarations: [CategoryComponent],
  imports: [
    CategoryRoutingModule,
    SharedModule
  ]
})
export class CategoryModule { }
