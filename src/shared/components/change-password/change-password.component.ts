import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup,
  FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription, finalize } from 'rxjs';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { UserService } from 'src/services/components/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    UserService
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  passwordForm: FormGroup = new FormGroup({});
  subscription: Subscription;
  currentUser: User;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private notifier: NotifierService,
    private dialogRef: DynamicDialogRef<ChangePasswordComponent>,
    private mixpanel: MixpanelService,
    private formBuilder: FormBuilder,
    private userService: UserService
  ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.getCurrentUser();

    this.passwordForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        this.currentUser = user;

        if(!this.currentUser.passwordSet){
          this.passwordForm.get('oldPassword').clearValidators();
          this.passwordForm.get('oldPassword').updateValueAndValidity();
        }
      })
    );
  }
  onSubmit(){
    if (this.passwordForm.invalid){
      this.notifier.error('Form is Invalid', 'Invalid');
      return;
    }
    else{
      this.isLoading = true;
      this.subscription.add(
        this.userService.updatePassword({
          oldPassword: this.passwordForm.get('oldPassword').value,
          newPassword: this.passwordForm.get('newPassword').value
        })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (user: User) => {
            this.notifier.success('Password updated successfully', 'Password Updated');
            this.authService.loginUser(user);
            this.mixpanel.log('Password Updated', { userId : user.id });
            this.dialogRef.close(true);
          },
          error: (error) => {
            if(error.message.includes('Invalid')){
              this.passwordForm.setErrors({'invalidPassword': true});
            }
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
