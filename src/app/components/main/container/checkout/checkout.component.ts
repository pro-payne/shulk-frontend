import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Cleave from 'cleave.js';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CheckoutService } from 'src/app/services/checkout/checkout.service';
import { TokenService } from 'src/app/services/token/token.service';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: '.app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss', './checkout-style.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []
  public shippingForm: FormGroup;
  public paymentForm: FormGroup;
  public card_type: string;
  private cvv: string;
  public cvvValide: boolean;
  public card_number: string
  public cardNumberValide: boolean;
  public cardHolder: string;
  public cardExpiryDate: string;
  public shippingFormValid: boolean;
  public loggedIn: boolean;
  public loading: boolean;
  public checkoutStep: string;
  public loadingAddress: boolean;
  public newAddress: boolean;
  public addresses: any[] = [];
  public tempData: any;
  private selectedAddress: number;

  public shipping_form_messages = {
    'first_name': [
      { type: 'minlength', message: 'Enter at least 2 characters' },
      { type: 'required', message: 'First name is required' }
    ],
    'last_name': [
      { type: 'minlength', message: 'Enter at least 2 characters' },
      { type: 'required', message: 'Last name is required' }
    ],
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
    'number': [
      { type: 'required', message: 'Phone number is required' },
      { type: 'minlength', message: 'Phone number must be 10 numbers long' },
      { type: 'maxlength', message: 'Phone number must be exactly 10 numbers long' },
      { type: 'pattern', message: 'Enter a valid phone number. E.g 0780000000' }
    ],
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' },
      { type: 'pattern', message: 'Your password must contain a minimum of 5 characters, at least one uppercase, one lowercase, and one number' }
    ],
    'street': [
      { type: 'required', message: 'Street address is required' },
      { type: 'minlength', message: 'Enter at least 2 characters' }
    ],
    'address2': [
      { type: 'minlength', message: 'Enter at least 2 characters' }
    ],
    'city': [
      { type: 'required', message: 'City is required' },
      { type: 'minlength', message: 'Enter at least 2 characters' }
    ],
    'zip': [
      { type: 'required', message: 'Zip code is required' },
      { type: 'minlength', message: 'Zip code is between 4 - 5 characters' }
    ],
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private checkService: CheckoutService,
    private token: TokenService,
    private transport: TransportorService,
    private auth: AuthService,
    private notify: NotifyService,
    private cart: CartService
  ) {
    this.card_type = 'unknown';
    this.cvv = '';
    this.cvvValide = true;
    this.card_number = '';
    this.cardNumberValide = true;
    this.cardHolder = "";
    this.cardExpiryDate = '';
    this.checkoutStep = "shipping";
    this.shippingFormValid = false;
    this.loggedIn = false;
    this.loading = false;
    this.loadingAddress = false;
    this.addresses = [];
    this.newAddress = true;
    this.tempData = null;
    this.selectedAddress = 0;

    if (this.auth.isAuthenticated()) {
      this.loggedIn = true;
      this.newAddress = false;
    }
  }

  ngOnInit() {
    this.createForm();
    this.cardEvents();
    this.routeChanges();

    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        if (data.type == 'count') {
          if (data.msg.count == 0) {
            this.router.navigate(['/'], {
              fragment: 'categories'
            })
          }
        }
      })
    )

    // Check if user has added item in cart
    this.cart.get('count')
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private routeChanges() {
    let shipping = 'shipping', payment = 'payment';
    switch (window.location.pathname) {
      case '/checkout/' + shipping:
        this.fetchAddress()
        this.checkoutStep = shipping;
        break;
      case '/checkout/' + payment:
        this.checkoutStep = payment;
        break;
      default:
        this.router.navigate(['cart'])
        break;
    }

    this.subscriptions.push(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          switch (event.url) {
            case '/checkout/' + shipping:
              this.fetchAddress()
              this.checkoutStep = shipping;
              break;
            case '/checkout/' + payment:
              this.checkoutStep = payment;
              break;
          }

        }
      })
    )

  }

  private fetchAddress() {
    if (this.loggedIn) {
      this.loadingAddress = true;
      this.checkService.getAddress().subscribe((info: any) => {
        let data = info.data;
        this.loadingAddress = false;
        this.addresses = [];
        for (let i = 0; i < data.length; i++) {
          let address2 = "";
          if (data[i].address2 != '') {
            address2 = data[i].address2 + ", ";
          }
          address2 += data[i].city + ", " + data[i].zip;

          let selected: boolean;
          if (this.selectedAddress != 0) {
            selected = (this.selectedAddress == data[i].id) ? true : false;
          } else {
            selected = (i == 0) ? true : false;
          }

          this.addresses.push({
            selected: selected,
            id: data[i].id,
            street: data[i].street,
            address2: address2
          });
        }

        if (data.length == 0) {
          this.newAddress = true;
        }
      }, (error: any) => {
        // console.log(error)
      });
    }
  }

  public addAddress(event: any, type: string) {
    event.preventDefault();

    if (type == 'add') {
      this.tempData = {
        street: this.shippingForm.value.street,
        address2: this.shippingForm.value.address2,
        city: this.shippingForm.value.city,
        zip: this.shippingForm.value.zip,
      }
      this.shippingForm.patchValue({
        street: '',
        address2: '',
        city: '',
        zip: '',
      })

      this.newAddress = true;
    } else if (type == 'cancel') {
      this.shippingForm.patchValue({
        street: this.tempData.street,
        address2: this.tempData.address2,
        city: this.tempData.city,
        zip: this.tempData.zip,
      })
      this.tempData = null
      this.newAddress = false;
    } else {
      this.loading = true;
      this.checkService.post('shipping', this.shippingForm.value, this.loggedIn).subscribe((data: any) => {
        if (data.success) {
          if (data.message == 'address_added') {
            this.addresses.forEach((value, key) => {
              value.selected = false;
            })
            setTimeout(() => {
              this.addresses.push(data.address)
            }, 500)
          } else {
            this.notify.showNotification('info', data.message)
          }

        } else {
          this.notify.showNotification('error', data.message)
        }

        this.tempData = null
        this.newAddress = false;
        this.loading = false;
      })
    }

  }

  private createForm() {

    if (!this.loggedIn) {
      this.shippingForm = this.fb.group({
        first_name: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        last_name: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        email: ['', {
          validators: Validators.compose([
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
          ]),
          updateOn: 'blur'
        }],
        number: ['', {
          validators: Validators.compose([
            Validators.minLength(10),
            Validators.maxLength(10),
            Validators.required,
            Validators.pattern('^[0-9]*$')
          ]),
          updateOn: 'blur'
        }],
        password: ['', {
          validators: Validators.compose([
            Validators.minLength(5),
            Validators.required,
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
          ]),
          updateOn: 'blur'
        }],
        street: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        address2: ['', {
          validators: Validators.compose([
            Validators.minLength(2)
          ]),
          updateOn: 'blur'
        }],
        city: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        zip: ['', {
          validators: Validators.compose([
            Validators.minLength(4),
            Validators.required
          ])
        }]
      });
    } else {
      this.shippingForm = this.fb.group({
        street: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        address2: ['', {
          validators: Validators.compose([
            Validators.minLength(2)
          ]),
          updateOn: 'blur'
        }],
        city: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        zip: ['', {
          validators: Validators.compose([
            Validators.minLength(4),
            Validators.required
          ])
        }]
      });
    }

    this.paymentForm = this.fb.group({
      card_holder: ['', {
        validators: Validators.compose([
          Validators.minLength(2),
          Validators.required
        ]),
        updateOn: 'blur'
      }],
      card_number: ['', {
        validators: Validators.compose([
          Validators.required
        ]),
      }],
      expiry_date: ['', {
        validators: Validators.compose([
          Validators.required,
          Validators.minLength(5)
        ]),
      }],
      cvv: ['', {
        validators: Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
          Validators.pattern('^[0-9]*$')
        ]),
      }],
      save_card: new FormControl(false)
    })

  }

  private cardEvents() {
    let cardNumber = new Cleave('#card-number', {
      creditCard: true,
      onCreditCardTypeChanged: (type) => {
        this.card_type = type
        this._watch()
      }
    })
    let expiryDate = new Cleave('#expiry-date', {
      date: true,
      datePattern: ['m', 'y']
    })

    let data: any = localStorage.getItem('shipping');

    if (data != null) {
      data = JSON.parse(data);
      this.shippingForm.patchValue({
        first_name: data.fName,
        last_name: data.lName,
        email: data.email,
        number: data.cellNumber,
        street: data.address1,
        address2: data.address2,
        city: data.city,
        zip: data.zip,
      })

      this.selectedAddress = data.selectedAddress;

      // this.checkoutStep = data.step;
      if (this.checkoutStep == 'payment') {
        this.router.navigate(['checkout', 'payment']);
      }
    }
  }

  public changeStep(event: any, direction: string) {
    event.preventDefault();
    if (direction == 'cart') {
      this.saveData(this.shippingForm.value, 'shipping', 'shipping')
      this.router.navigate(['/', 'cart'])
    } else {
      // this.checkoutStep = false;
      this.router.navigate(['checkout', 'shipping']);
    }
  }

  public selectChange(key: any) {
    this.addresses.forEach((value: any, index: number) => {
      if (key == index) {
        value.selected = true;
        this.selectedAddress = value.id;
      } else {
        value.selected = false;
      }
    });
  }

  public submitPayment() {

    if (this.paymentForm.status != 'VALID') return;

    this.loading = true;

    this.checkService.post('payment', {
      address: this.selectedAddress,
      card_holder: this.paymentForm.value.card_holder,
      card_number: this.paymentForm.value.card_number,
      cvv: this.paymentForm.value.cvv,
      expiry_date: this.paymentForm.value.expiry_date,
      save_card: this.paymentForm.value.save_card,
    }, this.loggedIn).subscribe((data: any) => {
      if (data.success) {

        this.cart.clear();
        this.paymentForm.patchValue({
          card_holder: '',
          card_number: '',
          cvv: '',
          expiry_date: '',
          save_card: false,
        })

        this.router.navigate(['checkout', 'order-status']).finally(() => {
          window.scrollTo(0, 0);
        });

      } else {
        this.notify.showNotification('error', data.message)
      }

      this.loading = false;
    })
  }

  public submitShipping() {

    if (this.shippingForm.status != 'VALID') return;

    this.loading = true;
    // If user doesn't have an account create one
    this.checkService.post('shipping', this.shippingForm.value, this.loggedIn).subscribe((data: any) => {
      if (data.success) {
        if (!this.loggedIn) {
          data = data.data;
          this.loggedIn = true;
          this.newAddress = false;
          this.token.handle(data.session);
          this.transport.send({
            type: 'loggedin',
            msg: ''
          });
          this.shippingForm.patchValue({
            password: ''
          })
          this.addresses = [];
          this.addresses.push(data.address)
        }

        this.saveData(this.shippingForm.value, 'shipping', 'payment')

        // this.checkoutStep = true;
        this.router.navigate(['checkout', 'payment']).finally(() => {
          window.scrollTo(0, 0);
        });

      } else {
        this.notify.showNotification('error', data.message)
        if (data.type == 'email_exist') {
          console.log(this.shippingForm.value.email)
        }
      }

      this.loading = false;
    })
  }

  private saveData(inputData: any, type: string, step: string) {
    let data: any;
    if (type == 'shipping') {
      let selectedAddress = 0;
      this.addresses.forEach((value, index) => {
        if (value.selected) {
          selectedAddress = value.id;
        }
      })

      data = {
        step: step,
        selectedAddress: selectedAddress,
        fName: inputData.first_name,
        lName: inputData.last_name,
        email: inputData.email,
        cellNumber: inputData.number,
        address1: inputData.street,
        address2: inputData.address2,
        city: inputData.city,
        zip: inputData.zip,
      };
    }

    localStorage.setItem(type, JSON.stringify(data))
  }

  public openEye(element: string) {
    let target = document.getElementById(element),
      eye = document.getElementById('reveal-' + element),
      eyeIcon = eye.querySelector('i');
    if (target.getAttribute('type') == 'password') {
      target.setAttribute('type', 'text')
      eyeIcon.classList.remove('fa-eye')
      eyeIcon.classList.add('fa-eye-slash')
    } else {
      target.setAttribute('type', 'password')
      eyeIcon.classList.remove('fa-eye-slash')
      eyeIcon.classList.add('fa-eye')
    }
  }

  public cvvWatch(event: any) {
    this.cvv = event.target.value;
    this._watch()
  }

  private _watch() {
    switch (this.card_type) {
      case 'amex':
        if (this.cvv.length == 4) {
          this.cvvValide = true
        } else {
          this.cvvValide = false
        }
        break;
      case 'visa':
      case 'mastercard':
      case 'discover':
        if (this.cvv.length == 3) {
          this.cvvValide = true
        } else {
          this.cvvValide = false
        }
        break;
      default:
        this.cvvValide = true
        break;
    }
  }

  public watchInput(event: any, type: string) {
    let target = event.target,
      limit = 0;
    if (type == 'cell') {
      limit = 10;
    } else if (type == 'zip') {
      limit = 5;
    }

    if (event.which == 8 || event.which == 9) {
      return true;
    }

    if (target.value.length >= limit) {
      return false;
    }

    if (event.shiftKey) {
      if (event.which == 37) {
        return true;
      }

      return false;
    }

    if (event.ctrlKey) {
      if (event.which == 65) {
        return true;
      }

      return false;
    }

    if (event.which >= 48 && event.which <= 57) {
      return true;
    }

    if (event.which >= 96 && event.which <= 105) {
      return true;
    }

    if (event.which > 52) {
      return false;
    }

    if (event.which == 32) {
      return false;
    }

    return true;
  }

  public cardNumber(value: string) {
    this.card_number = value;
    this.cardnumberChange(value)
  }

  public card_holder(value: string) {
    this.card_number = value;
    this.cardnumberChange(value)
  }

  public cardnumberChange(value: string) {
    let str = value.replace(/\s/g, '');
    switch (this.card_type) {
      case 'amex':
        if (str.length == 15) {
          this.cardNumberValide = true
        } else {
          this.cardNumberValide = false
        }
        break;
      case 'visa':
      case 'mastercard':
      case 'discover':
        if (str.length == 16) {
          this.cardNumberValide = true
        } else {
          this.cardNumberValide = false
        }
        break;
      default:
        this.cardNumberValide = true
        break;
    }
  }

}
