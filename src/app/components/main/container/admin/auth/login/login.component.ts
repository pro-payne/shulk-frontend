import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SignupService } from 'src/app/services/auth/signup/signup.service';
import { TokenService } from 'src/app/services/token/token.service';
import { Router } from '@angular/router';
import { NotifyService } from 'src/app/services/notify/notify.service';

@Component({
  selector: '.app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../../../auth/signup/signup.component.scss', './login.component.scss']
})
export class LoginComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  public loginForm: FormGroup;
  public disableBtn: boolean;
  public loginFail: boolean;
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
    private notify: NotifyService,
  ) {
    this.disableBtn = false;
    this.loginFail = false;
  }

  ngOnInit() {
    this.createForm()
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

    this.signupService.post(this.loginForm.value, 'login', 'admin').subscribe((data: any) => {
      if (data.success) {
        this.token.handle(data);
        this.route.navigate(['/', 'admin', 'dashboard']);

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
