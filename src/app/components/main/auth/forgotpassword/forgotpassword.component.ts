import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['../signup/signup.component.scss', './forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  public userType: string;

  constructor(
    private route: Router
  ) { }

  ngOnInit() {
    this.routeChanges()
  }

  private routeChanges() {
    let customer = 'customer', shop = 'shop', forgotRoute = 'forgot-password';
    switch (window.location.pathname) {
      case '/account/' + forgotRoute:
        this.userType = customer;
        break;
      case '/account/shop/' + forgotRoute:
        this.userType = shop;
        break;
      default:
        this.route.navigate([''])
        break;
    }

    this.subscriptions.push(
      this.route.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          switch (event.url) {
            case '/account/' + forgotRoute:
              this.userType = customer;
              break;
            case '/account/shop/' + forgotRoute:
              this.userType = shop;
              break;
          }
        }
      })
    )
  }

}
