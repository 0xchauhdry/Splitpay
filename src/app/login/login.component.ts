import { Component, OnDestroy, OnInit } from '@angular/core';
import { 
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { UserService } from 'src/services/components/user.service';
import { LogIn } from 'src/shared/models/logIn.model';
import { Router, RouterModule } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { NotifierService } from 'src/services/services/notifier.service';
import { ValidatorService } from 'src/services/common/validator.service';
import { CommonModule } from '@angular/common';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GoogleSigninButtonModule
  ],
  providers:[
    ValidatorService,
    UserService
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  logInForm: FormGroup;
  isPasswordError: boolean = false;
  isUsernameError: boolean = false;
  subscription: Subscription;
  accessToken: any;

  constructor(private formBuilder: FormBuilder,
     private loginService: UserService,
     private authService: AuthService,
     private router: Router,
     private notifierService: NotifierService,
     private validator: ValidatorService,
     private loader: LoaderService,
     private mixpanel: MixpanelService
  ){
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
          .setValidators([Validators.required, this.validator.emailValidator()]);
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
      this.notifierService.error('Form is invalid.')
      return;
    }

    const loginUser = new LogIn();
    loginUser.usernameOrEmail = this.logInForm.get('usernameOrEmail').value;
    loginUser.password = this.logInForm.get('password').value;

    this.loader.show()
    this.subscription.add(
      this.loginService.logIn(loginUser)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
      next: (res: User) => {
        this.authService.loginUser(res);
        this.mixpanel.log('Logged In');
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
