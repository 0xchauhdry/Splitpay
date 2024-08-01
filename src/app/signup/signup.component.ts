import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { User } from 'src/shared/models/user.model';
import { ValidatorService } from 'src/services/common/validator.service';
import { UserService } from 'src/services/components/user.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { CommonModule } from '@angular/common';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { LoaderService } from 'src/services/services/loader.service';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { AuthService } from 'src/services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleSigninButtonModule
  ],
  providers:[
    ValidatorService,
    UserService
  ]
})
export class SignupComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup;
  isUsernameError: boolean = false;
  isEmailError:boolean = false;
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notifierService: NotifierService,
    private validator: ValidatorService,
    private loader: LoaderService,
    private mixpanel: MixpanelService,
    private authService: AuthService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.signUpForm = this.formBuilder.group({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      email: new FormControl('', [Validators.required, this.validator.emailValidator()]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        this.matchPasswordValidator(),
      ]),
    });
    this.subscribeToUsernameChanges();
    this.subscribeToEmailChanges();
  }

  subscribeToUsernameChanges(){
    this.subscription.add(
      this.signUpForm.get('username').valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged()
      )
      .subscribe({
        next: (username: string) => {
          if (!this.signUpForm.get('username').invalid){
            this.isUsernameError = false;
            this.checkUserExists(username);
          }
        },
      })
    )
  }

  subscribeToEmailChanges(){
    this.subscription.add(
      this.signUpForm.get('email').valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged()
      )
      .subscribe({
        next: (email: string) => {
          if (!this.signUpForm.get('email').invalid){
            this.isEmailError = false;
            this.checkUserExists(email);
          }
        },
      })
    )
  }

  checkUserExists(value: string){
    this.userService.checkExists(value).subscribe({
      error: (error) => {
        if(error.message.includes('username')){
          this.isUsernameError = true;
        }
        else if (error.message.includes('email')){
          this.isEmailError = true;
        }
      }
    })
  }

  SignUp() {
    if (this.signUpForm.valid) {
      const signUpInstance = new User();
      signUpInstance.name = {
        first: this.signUpForm.get('firstname').value,
        last: this.signUpForm.get('lastname').value,
        display: ""
      };
      signUpInstance.password = this.signUpForm.get('password').value;
      signUpInstance.username = this.signUpForm.get('username').value;
      signUpInstance.email = this.signUpForm.get('email').value;

      this.loader.show();
      this.subscription.add(
        this.userService.signUp(signUpInstance)
        .pipe(
          finalize(() => {
            this.loader.hide();
          })
        )
        .subscribe({
          next: (user: User) => {
            if (user) {
              this.notifierService.success('User Created Successfully', 'Signed In');
              this.authService.loginUser(user);
              this.mixpanel.log('Signed In', { userId : user.id });
              this.router.navigate(['home']);
            }
          },
          error: (err) => {
            if(err.message.includes('username')){
              this.isUsernameError = true;
            }
            else if (err.message.includes('email')){
              this.isEmailError = true;
            }
          }
        })
      );
    }
  }

  showErrors(string: string): boolean {
    const field = this.signUpForm.get(string);
    return field.invalid && (field.dirty || field.touched);
  }

  matchPasswordValidator(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const passwordControl = this.signUpForm?.get('password');
      if (passwordControl && control.value !== passwordControl.value) {
        return { matching: true };
      }
      return null;
    };
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
