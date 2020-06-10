import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule  } from 'ngx-bootstrap/collapse';

import { HeaderComponent, FooterComponent } from '../components/common';
import { NotifierModule } from 'angular-notifier';
import { notifierOption } from '../utility/config/config.service';
import { ItemNavigatorComponent } from '../utility/item-navigator/item-navigator.component';

// Pipes
import { SafeUrlPipe } from '../utility/pipes/safeurl/safeurl.pipe';
import { NotifyService } from '../services/notify/notify.service';
import { StatscountPipe } from '../utility/pipes/statscount/statscount.pipe';


@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    ItemNavigatorComponent,
    SafeUrlPipe,
    StatscountPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    NotifierModule.withConfig(notifierOption),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
  ],
  exports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    FooterComponent,
    HeaderComponent,
    SafeUrlPipe,
    StatscountPipe,
    ItemNavigatorComponent,
  ],
  providers:[
    NotifyService
  ]
})
export class SharedModule { }
