import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { Subscription } from 'rxjs';
import { TransportorService } from 'src/app/utility/transportor/transportor.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: [
    '../store/manage-products/manage-products.component.scss',
    './user-profile.component.scss'
  ]
})
export class UserProfileComponent implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions: Subscription[] = [];
  public newAddress: boolean;
  public addresses: any[];
  private selectedAddress: number;
  public disableAccountBtn: boolean;
  public accountLoading: boolean;
  public addressLoading: boolean;
  public disableShippingBtn: boolean;
  public shippingLoading: boolean;
  public shippingForm: FormGroup;
  public accountForm: FormGroup;
  public shopForm: FormGroup;
  public userType: string;
  private valueChange: number;
  private keepAccount: any;
  public publicUser: string;
  private requestType: string;
  private addressId: number;
  private fragment: string;

  public account_messages = {
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
    ]
  }

  public shop_messages = {
    'shop_name': [
      { type: 'minlength', message: 'Enter at least 2 characters' },
      { type: 'required', message: 'Shop name is required' }
    ],
    'description': [
      { type: 'minlength', message: 'Enter at least 2 characters' },
      { type: 'required', message: 'Shop description is required' }
    ],
    'location': [
      { type: 'required', message: 'Shop location is required' },
      { type: 'pattern', message: 'Shop location is required' }
    ],
    'number': [
      { type: 'required', message: 'Contact number is required' },
      { type: 'minlength', message: 'Contact number must be 10 numbers long' },
      { type: 'maxlength', message: 'Contact number must be exactly 10 numbers long' },
      { type: 'pattern', message: 'Enter a valid phone number. E.g 0780000000' }
    ]
  }

  public shipping_messages = {
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
    private fb: FormBuilder,
    private profileService: UserProfileService,
    private transport: TransportorService,
    private notify: NotifyService,
    private route: ActivatedRoute
  ) {
    this.newAddress = false;
    this.addresses = [];
    this.selectedAddress = 0;
    this.disableAccountBtn = true;
    this.accountLoading = false;
    this.addressLoading = true;
    this.disableShippingBtn = false;
    this.userType = '';
    this.valueChange = 0;
    this.keepAccount = null;
    this.requestType = 'add'
    this.publicUser = '';
  }

  ngOnInit() {

    switch (window.location.pathname) {
      case '/store/shop-profile':
        this.publicUser = 'shop';
        break;
      default:
        this.publicUser = '';
        break;
    }

    let call = () => {
      this.createForm();
      if (this.publicUser == 'shop') {
        this.subscriptions.push(
          this.profileService.get('shop').subscribe((data: any) => {
            if (data.shop.length != 0) {
              data = data.shop
              this.keepAccount = data
              this.shopForm.patchValue({
                shop_name: data.name,
                description: data.description,
                location: data.location,
                number: data.number
              })
            }
          })
        )
      } else {
        this.subscriptions.push(
          this.profileService.get(this.userType).subscribe((data: any) => {
            if (data.success) {
              data = data.data
              this.keepAccount = data
              this.accountForm.patchValue({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                number: data.number
              })
            }
          })
        )

        if (this.userType == 'customer') {
          this.addressLoading = true;
          this.subscriptions.push(
            this.profileService.get('shipping').subscribe((data: any) => {
              data = data.data
              this.addresses = data
              this.addressLoading = false;
            }, (e: any) => {
              this.addressLoading = false
            })
          )
        }
      }
    }

    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });

    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        switch (data.type) {
          case 'user-signal':
            this.userType = data.msg
            call()
            break;
        }
      })
    )

  }

  ngAfterViewInit(): void {
    try {
      document.querySelector('#' + this.fragment).scrollIntoView();
    } catch (e) { }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
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

  public addAddress(event: any, type: string) {
    event.preventDefault();

    if (type == 'add') {
      this.newAddress = true;
    } else {
      this.newAddress = false;
      this.valueChange = 0
      this.shippingForm.reset()
    }
  }

  private createForm() {

    if (this.publicUser == 'shop') {
      this.shopForm = this.fb.group({
        shop_name: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        description: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
          ]),
          updateOn: 'blur'
        }],
        location: ['', {
          validators: Validators.compose([
            Validators.minLength(2),
            Validators.required
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
        }]
      });
      this.shopForm.valueChanges.subscribe((data: any) => {
        this.valueChange++;
        if (this.valueChange == 2) {
          this.disableAccountBtn = false;
          this.valueChange = 0;
        }
      })
    } else {
      this.accountForm = this.fb.group({
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
        }]
      });

      this.accountForm.valueChanges.subscribe((data: any) => {
        this.valueChange++;
        if (this.valueChange == 2) {
          this.disableAccountBtn = false;
          this.valueChange = 0;
        }
      })

      if (this.userType == 'customer') {
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
        this.shippingForm.valueChanges.subscribe((data: any) => {
          this.valueChange++;
          if (this.valueChange == 2) {
            this.disableAccountBtn = false;
            this.valueChange = 0;
          }
        })
      }

    }

  }

  public accountCancel(event: any) {
    event.preventDefault();

    if (this.disableAccountBtn) return;

    if (this.publicUser == 'shop') {
      this.shopForm.patchValue({
        shop_name: this.keepAccount.name,
        description: this.keepAccount.description,
        location: this.keepAccount.location,
        number: this.keepAccount.number,
      })
    } else {
      this.accountForm.patchValue({
        first_name: this.keepAccount.first_name,
        last_name: this.keepAccount.last_name,
        email: this.keepAccount.email,
        number: this.keepAccount.number,
      })
      this.valueChange = 0
    }
  }

  public onSubmit() {
    this.accountLoading = true;
    this.disableAccountBtn = true;
    let formData = null, routePath = '';
    if (this.publicUser == 'shop') {
      formData = this.shopForm.value
      routePath = 'shop'
    } else {
      formData = this.accountForm.value
      routePath = this.userType
    }


    this.profileService.updateProfile(routePath, formData).subscribe((data: any) => {
      if (data.success) {
        this.notify.showNotification('success', 'Changes saved')
        this.disableAccountBtn = true;
        this.valueChange = 0;
        this.keepAccount = formData
      } else {
        this.notify.showNotification('error', 'Unable to save changes, please try again')
      }
      this.accountLoading = false;
    }, (error: any) => {
      this.notify.showNotification('error', 'Something went wrong, please try again')
      this.accountLoading = false;
      this.disableAccountBtn = false;
    })

  }

  public submitShipping() {
    this.shippingLoading = true;
    this.disableShippingBtn = true;

    if (this.requestType == 'add') {
      this.profileService.newAddress(this.shippingForm.value).subscribe((data: any) => {
        if (data.success) {
          this.addresses.forEach((value, key) => {
            value.selected = false;
          })
          setTimeout(() => {
            this.addresses.push(data.address)
          }, 500)
          this.newAddress = false;
          this.shippingForm.patchValue({
            street: '',
            address2: '',
            zip: '',
            city: ''
          })
          this.shippingForm.reset()
          this.notify.showNotification('success', 'Address saved')
          this.disableShippingBtn = false;
          this.requestType = 'add';
          this.valueChange = 0;
        } else {
          this.notify.showNotification('error', 'Unable to save changes, please try again')
        }
        this.shippingLoading = false;
      }, (error: any) => {
        this.notify.showNotification('error', 'Something went wrong, please try again')
        this.shippingLoading = false;
        this.disableShippingBtn = false;
      })
    } else if (this.requestType == 'edit') {
      this.profileService.address(this.shippingForm.value, this.addresses[this.addressId].id, 'edit').subscribe((data: any) => {
        if (data.success) {
          this.addresses.forEach((value, key) => {
            value.selected = false;
          })
          setTimeout(() => {
            this.addresses[this.addressId].selected = true
          }, 500)
          this.newAddress = false;

          let lastAddress2 = "", address = this.shippingForm.value.address2;
          if (address != '') {
            lastAddress2 = address + ", ";
          }

          lastAddress2 += this.shippingForm.value.city + ", " + this.shippingForm.value.zip;
          this.addresses[this.addressId].street = this.shippingForm.value.street;
          this.addresses[this.addressId].address = address;
          this.addresses[this.addressId].address2 = lastAddress2;
          this.addresses[this.addressId].zip = this.shippingForm.value.zip;
          this.addresses[this.addressId].city = this.shippingForm.value.city;
          this.shippingForm.patchValue({
            street: '',
            address2: '',
            zip: '',
            city: ''
          })
          this.shippingForm.reset()
          this.notify.showNotification('success', 'Address changes saved')
          this.disableShippingBtn = false;
          this.requestType = 'add';
          this.valueChange = 0;
        } else {
          this.notify.showNotification('error', data.message);
        }
        this.shippingLoading = false;
      })
    }
  }

  public addressEdit(event: any, type: string, index: number) {
    event.preventDefault();
    let address = this.addresses[index]
    this.addressId = index;
    if (type == 'edit') {
      this.shippingForm.patchValue({
        street: address.street,
        address2: address.address,
        zip: address.zip,
        city: address.city
      })
      this.newAddress = true;
      this.requestType = 'edit';
    } else if (type == 'delete') {
      this.profileService.address(null, address.id, 'delete').subscribe((data: any) => {
        if (data.success) {
          this.addresses.splice(index, 1)
          this.notify.showNotification('success', 'Address deleted');
          this.valueChange = 0
        } else {
          this.notify.showNotification('error', data.message);
        }
      })
    }
  }

}
