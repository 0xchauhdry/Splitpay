import { Component, OnInit } from '@angular/core';
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
import { finalize } from 'rxjs';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
  ],
})
export class AddFriendComponent implements OnInit {
  addFriendForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: FriendService,
    private notificationService: NotifierService,
    private validator: ValidatorService,
    private dialogRef:DynamicDialogRef<AddFriendComponent>,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ) {}

  ngOnInit(): void {
    this.addFriendForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, this.validator.emailValidator()]),
    });
  }

  AddFriend() {
    if (this.addFriendForm.valid) {
      let email = this.addFriendForm.get('email')?.value ?? '';

      this.loader.show();
      this.userService.AddFriend(email)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res[0].hasOwnProperty('FriendshipStatus')) {
            this.notificationService.info(res[0].FriendshipStatus);
            this.dialogRef.close(false);
          } else {
            this.notificationService.success('Request Sent to ' + email,'Request Sent');
            this.mixpanel.log('Request Sent', { email })
            this.dialogRef.close(true);
          }
        },
      });
    }
  }
}
