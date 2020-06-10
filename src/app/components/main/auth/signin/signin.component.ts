import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TokenService } from 'src/app/services/token/token.service';
import { SignupService } from 'src/app/services/auth/signup/signup.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CartService } from 'src/app/services/cart/cart.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../signup/signup.component.scss', './signin.component.scss']
})
export class SigninComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  public loginForm: FormGroup;
  public disableBtn: boolean;
  public loginFail: boolean;
  private cartData: any[];
  public userType: string;

  public validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
    'password': [
      { type: 'required', message: 'Password is required' }
    ]
  }

  constructor(
    private fb: FormBuilder,
    private signupService: SignupService,
    private token: TokenService,
    private route: Router,
    private cart: CartService,
    private notify: NotifyService,
    private transport: TransportorService
  ) {
    this.disableBtn = false;
    this.loginFail = false;
    this.cartData = [];
  }

  ngOnInit() {
    this.routeChanges()
    this.createForm()
    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        if (data.type == 'not-in-cart') {
          for (let i = 0; i < this.cartData.length; i++) {
            if (this.cartData[i].id == data.msg) {
              this.cart.store(this.cartData[i], 'store', true);
            }
          }
        }
      })
    )

  }

  private routeChanges() {
    let customer = 'customer', shop = 'manager';
    switch (window.location.pathname) {
      case '/account/signin':
        this.userType = customer;
        break;
      case '/account/shop/login':
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
            case '/account/signin':
              this.userType = customer;
              break;
            case '/account/shop/login':
              this.userType = shop;
              break;
          }

        }
      })
    )

  }

  private createForm() {
    this.loginForm = this.fb.group({
      email: ['', {
        validators: Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]),
      }],
      password: ['', {
        validators: Validators.compose([
          Validators.required
        ]),
      }]
    });

    this.loginForm.statusChanges.subscribe((data) => {
      this.loginFail = false;
    })
  }

  public onSubmit() {
    if (this.loginForm.status != 'VALID') return;

    this.disableBtn = true;

    this.signupService.post(this.loginForm.value, 'login', this.userType).subscribe((data: any) => {
      if (data.success) {
        this.token.handle(data);

        // Either redirect user to inteaded location or to user profile
        if (this.userType == 'manager') {
          this.route.navigate(['/', 'store', 'dashboard']);
        } else {
          // Update previously saved cart and for duplicates
          this.cartData = data.cart;
          for (let i = 0; i < data.cart.length; i++) {
            this.cart.check(data.cart[i].id);
          }

          this.route.navigate(['/', 'customer', 'account']);
        }

      } else {
        this.loginFail = true
        this.disableBtn = false;
        this.notify.showNotification('error', data.error)
      }
    })

  }

  public openEye() {
    let password = document.getElementById('inputPassword'),
      eyeIcon = document.getElementById('eye');

    if (password.getAttribute('type') == 'password') {
      password.setAttribute('type', 'text')
      eyeIcon.classList.remove('fa-eye')
      eyeIcon.classList.add('fa-eye-slash')
    } else {
      password.setAttribute('type', 'password')
      eyeIcon.classList.remove('fa-eye-slash')
      eyeIcon.classList.add('fa-eye')
    }
  }

}
