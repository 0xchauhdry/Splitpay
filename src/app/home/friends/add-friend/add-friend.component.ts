import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { NotifierService } from 'src/services/services/notifier.service';
import { FriendService } from 'src/services/components/friend.service';
import { ValidatorService } from 'src/services/common/validator.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, finalize } from 'rxjs';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { UserService } from 'src/services/components/user.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
  ],
  providers: [
    ValidatorService,
    UserService
  ]
})
export class AddFriendComponent implements OnInit, OnDestroy {
  addFriendForm: FormGroup;
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: FriendService,
    private notificationService: NotifierService,
    private validator: ValidatorService,
    private dialogRef:DynamicDialogRef<AddFriendComponent>,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ) {
    this.subscription = new Subscription();
    this.addFriendForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, this.validator.emailValidator()]),
    });
  }

  ngOnInit(): void {}

  AddFriend() {
    if (this.addFriendForm.valid) {
      let email = this.addFriendForm.get('email').value || '';
      this.loader.show();
      this.subscription.add(
        this.userService.AddFriend(email)
        .pipe(
          finalize(() => {
            this.loader.hide();
          })
        )
        .subscribe({
          next: (res: any) => {
            if(res == 'User not found.'){
              this.notificationService.error('User not found', 'Not Found');
              this.dialogRef.close(false);
            } 
            else if (res.hasOwnProperty('status')) {
              let status = 'friends';
              if (res.status == 2){
                if (res.isRequester) status = 'friend requests';
                else status = 'pending requests';
              }
              this.notificationService.info(`User is already in ${status} lsit.`);
              this.dialogRef.close(false);
            } 
            else {
              this.notificationService.success('Request Sent to ' + email,'Request Sent');
              this.mixpanel.log('Request Sent', { email })
              this.dialogRef.close(true);
            }
          },
        })
      );
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
