import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SignupService } from 'src/app/services/auth/signup/signup.service';
import { TokenService } from 'src/app/services/token/token.service';
import { Router } from '@angular/router';
import { NotifyService } from 'src/app/services/notify/notify.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {

  public registerForm: FormGroup;
  public disableBtn: boolean;
  public registrationFail: boolean;

  public validation_messages = {
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
    ]
  }

  constructor(
    private fb: FormBuilder,
    private token: TokenService,
    private signupService: SignupService,
    private route: Router,
    private notify: NotifyService
  ) {
    this.disableBtn = false;
    this.registrationFail = false;
  }

  ngOnInit() {
    this.createForm()
  }

  private createForm() {
    this.registerForm = this.fb.group({
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
      terms: new FormControl(false, Validators.pattern('true'))
    });

    this.registerForm.statusChanges.subscribe((data) =>{
      this.registrationFail = false;
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

  public onSubmit() {
    if(this.registerForm.status != 'VALID') return;

    this.disableBtn = true;
    this.signupService.post(this.registerForm.value, 'register', 'customer').subscribe((data: any) =>{
      if(data.success){
        data = data.data
        this.token.handle(data.session);
        // Either redirect user to inteaded location or to user profile
        this.route.navigate(['/']);
      }else{
        this.registrationFail = true;
        this.disableBtn = false;
        this.notify.showNotification('error', data.error)
      }
    })

  }

}
