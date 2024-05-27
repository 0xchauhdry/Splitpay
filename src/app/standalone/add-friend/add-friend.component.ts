import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextModule } from 'primeng/inputtext';
import { NotifierService } from 'src/services/services/notifier.service';
import { FriendService } from 'src/services/components/friend.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule,
    InputTextModule,
  ],
})
export class AddFriendComponent implements OnInit {
  addFriendForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddFriendComponent>,
    private userService: FriendService,
    private notificationService: NotifierService
  ) {}

  ngOnInit(): void {
    this.addFriendForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  AddFriend() {
    if (this.addFriendForm.valid) {
      let email = this.addFriendForm.get('email')?.value ?? '';
      this.userService.AddFriend(email).subscribe({
        next: (res: any) => {
          if (res[0].hasOwnProperty('FriendshipStatus')) {
            this.notificationService.info(res[0].FriendshipStatus);
            this.dialogRef.close(false);
          } else {
            this.notificationService.success('Request Sent to ' + email,'Request Sent');
            this.dialogRef.close(true);
          }
        },
      });
    }
  }
}
