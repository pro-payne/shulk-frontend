import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared';

import { NotFoundComponent } from './components/not-found/not-found.component';
import { TransportorService } from './utility/transportor/transportor.service';
import { QuickLookComponent } from './utility/quick-look/quick-look.component';

export function jwtOptionsFactory() {
  return {
    tokenGetter: () => {
      return (localStorage.getItem('share_token') != 'undefined') ? localStorage.getItem('share_token') : null;
    },
    skipWhenExpired: true
  }
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    QuickLookComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,

    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      }
    }),
  ],
  providers: [
    TransportorService,
  ],
  entryComponents: [
    QuickLookComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
