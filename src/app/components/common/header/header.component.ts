import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from 'src/app/services/cart/cart.service';
import { Subscription } from 'rxjs';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { TokenService } from 'src/app/services/token/token.service';
import { Router, Event, NavigationEnd } from '@angular/router';
import { NotifyService } from 'src/app/services/notify/notify.service';

@Component({
  selector: '.nav-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public inCart: number;
  public loggedIn: boolean;
  public userData: string;
  public userType: string;
  public publicUser: boolean;
  public isCollapsed = false;

  constructor(
    private cart: CartService,
    private token: TokenService,
    private auth: AuthService,
    private transport: TransportorService,
    private router: Router,
    private notify: NotifyService
  ) {
    this.inCart = 0;
    this.userType = '';
    this.loggedIn = false;
    this.publicUser = true;
    if (this.auth.isAuthenticated()) {
      this.changeState();
    }
  }

  ngOnInit() {
    this.routeChanges();
    this.scrollEvent();

    this.subscriptions.push(
      this.transport.call.subscribe((data) => {
        switch (data.type) {
          case 'count':
            this.inCart = data.msg.count;
            break;
          case 'count-update':
            this.cart.get('count');
            break;
          case 'loggedin':
            this.changeState();
            break;
        }
      })
    )
    this.cart.get('count');
  }

  private changeState() {
    this.loggedIn = true;
    this.userData = this.token.getUser().first_name;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private routeChanges() {
    let check = () => {
      if (this.token.getUser() != null) {
        this.userType = this.token.getUser().user_type;
      } else {
        this.userType = ''
      }

      this.transport.send({
        type: 'user-signal',
        msg: this.userType
      })
    }

    check()

    this.subscriptions.push(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          check()
        }
      })
    )

    let path = window.location.pathname.split('/'),
      route = '';
    if (path.length >= 2) {
      route = path[1];
    }

    switch (route) {
      case 'store':
      case 'customer':
      case 'admin':
        this.publicUser = false;
        break;
      default:
        this.publicUser = true;
        break;
    }

  }z

  private scrollEvent() {
    document.onscroll = function (e: any) {

      let pageY = (document.documentElement.scrollTop || document.body.scrollTop);
      let pageHeight = document.body.scrollHeight,
        nav = document.querySelector('.header-nav'),
        _nav = document.querySelector('.nav-header')
      if (_nav == null) return;
      if (_nav.classList.contains('fixed')) return;

      let prc = ((pageY / pageHeight) * 100);
      if (prc <= 9.5) {
        nav.classList.remove('fixed')
      }

      if (prc >= 23) {
        nav.classList.remove('remove')
        nav.classList.add('fixed')
        nav.classList.add('show')
      } else {
        if (nav.classList.contains('show')) {
          nav.classList.remove('show')
          nav.classList.add('remove')
        }
      }
    }
  }

  public signOut(event: any) {
    event.preventDefault();
    this.notify.showSpecificNotification('info', "Signing out...", "signing_out")
    this.auth.logout().subscribe(
      data => this.handleLogout(data),
      error => this.handleLogOutError(error)
    );
  }

  handleLogout(data: any) {
    this.token.removeAll();
    this.loggedIn = false;
    this.router.navigate(['/']).finally(() => {
      this.notify.hideSpecificNotification('signing_out')
      this.notify.showNotification('success', data.message)
    });
  }

  handleLogOutError(error) {
    this.notify.hideSpecificNotification('signing_out')
    this.notify.showNotification('error', "Unable to complete request, try again")
  }

}
