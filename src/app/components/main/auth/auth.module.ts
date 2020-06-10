import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { NotifierModule } from 'angular-notifier';
import { notifierOption } from 'src/app/utility/config/config.service';

import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './signin/signin.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    ForgotpasswordComponent
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    NotifierModule.withConfig(notifierOption),
  ]
})
export class AuthModule { }
