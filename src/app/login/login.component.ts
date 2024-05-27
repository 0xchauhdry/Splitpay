import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { User } from 'src/assets/models/User.model';
import { UserService } from 'src/services/components/user.service';
import { LogIn } from 'src/assets/models/LogIn.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotifierService } from 'src/services/services/notifier.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  logInForm: FormGroup = new FormGroup({});
  isPasswordError: boolean = false;
  isUsernameError: boolean = false;
  subscription: Subscription;

  constructor(private formBuilder: FormBuilder,
     private loginService: UserService,
     private authService: AuthService,
     private router: Router,
     private notifierService: NotifierService){
      this.subscription = new Subscription();
     }

  ngOnInit(): void {
    this.logInForm = this.formBuilder.group({
      usernameOrEmail: new FormControl('', [Validators.required, Validators.minLength(2)]),
      password: new FormControl('', Validators.required)
    });

    this.logInForm.get('usernameOrEmail').valueChanges.subscribe(value => {
      if (value.includes('@')){
        this.logInForm.get('usernameOrEmail')
          .setValidators([Validators.required, Validators.email]);
      }
      else{
        this.logInForm.get('usernameOrEmail')
          .setValidators([Validators.required, Validators.minLength(2)]);
      }
      this.isUsernameError = false;
    })
    this.logInForm.get('password').valueChanges.subscribe(() => {
      this.isPasswordError = false;
    })
  }

  LogIn(){
    if(this.logInForm.invalid){
      this.notifierService.error('Form is invalid bitch')
      return;
    }

    const loginUser = new LogIn();
    loginUser.usernameOrEmail = this.logInForm.get('usernameOrEmail').value;
    loginUser.password = this.logInForm.get('password').value;

    this.subscription.add(
      this.loginService.logIn(loginUser).subscribe({
      next: (res: User) => {
        this.authService.loginUser(res);
        this.router.navigate(['home']);
      },
      error: (err) => {
        if (err.message.includes('password')){
          this.isPasswordError = true
        }
        else if (err.message.includes('user')){
          this.isUsernameError = true
        }
      }
    }))
  }

  showErrors(string: string){
    const field = this.logInForm.get(string);
    return field.invalid && (field.dirty || field.touched);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
