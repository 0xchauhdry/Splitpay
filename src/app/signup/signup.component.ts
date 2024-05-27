import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/services/components/user.service';
import { NotifierService } from 'src/services/services/notifier.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup = new FormGroup({});
  isUsernameError: boolean = false;
  isEmailError:boolean = false;
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notifierService: NotifierService
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
      email: new FormControl('', [Validators.required, this.emailValidator()]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        this.matchPasswordValidator(),
      ]),
    });

    this.signUpForm.get('username').valueChanges.subscribe(() => {
      this.isUsernameError = false;
    })

    this.signUpForm.get('email').valueChanges.subscribe(() => {
      this.isEmailError = false;
    })
  }

  SignUp() {
    if (this.signUpForm.valid) {
      const signUpInstance = new User();
      signUpInstance.name = {
        first: this.signUpForm.get('firstname').value,
        last: this.signUpForm.get('lastname').value,
      };
      signUpInstance.password = this.signUpForm.get('password').value;
      signUpInstance.username = this.signUpForm.get('username').value;
      signUpInstance.email = this.signUpForm.get('email').value;

      this.userService.signUp(signUpInstance).subscribe({
        next: async (res) => {
          if (res) {
            this.notifierService.success('User Created Successfully', 'Signed In')
            this.router.navigate(['/login']);
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
      });
    }
  }

  showErrors(string: string): boolean {
    const field = this.signUpForm.get(string);
    return field.invalid && (field.dirty || field.touched);
  }

  emailValidator(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);

      return isValid ? null : { 'invalidEmail': { value: control.value } };
    };
  }

  matchPasswordValidator(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const passwordControl = this.signUpForm.get('password');
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
