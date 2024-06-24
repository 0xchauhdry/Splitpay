import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { 
  FormBuilder, FormControl,
  FormGroup, FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { UserService } from 'src/services/components/user.service';
import { Subscription, finalize } from 'rxjs';
import { Image } from '../../../models/image.model';
import { ValidatorService } from 'src/services/common/validator.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { ImageService } from 'src/services/common/image.service';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/models/user.model';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CropImageComponent } from 'src/app/shared/components/crop-image/crop-image.component';
import { SafeUrl } from '@angular/platform-browser';
import { CurrencyBroadcastService } from 'src/services/broadcast/currency-broadcast.service';
import { Currency } from 'src/models/currency.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    DynamicDialogModule,
  ],
  providers:[
    DialogService
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  currencies: any[] = [];
  userImageUrl: SafeUrl;
  loggedInUser: User;
  userProfileForm: FormGroup;
  selectedFile: File | null = null;
  isUsernameError: boolean = false;
  isEmailError:boolean = false;
  ref: DynamicDialogRef;
  croppedImageUrl: string;

  @ViewChild('fileInput') fileInput: any;

  constructor(
     private userService: UserService,
     private currencyService: CurrencyBroadcastService,
     private formBuilder: FormBuilder,
     private validator: ValidatorService,
     private notifierService: NotifierService,
     private imageService: ImageService,
     private authService: AuthService,
     public dialogService: DialogService,
     private loader: LoaderService,
     private mixpanel: MixpanelService
    ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if (user){
          this.loggedInUser = user;
        }
      }
    });

    this.userProfileForm = this.formBuilder.group({
      firstName: new FormControl(this.loggedInUser.name.first, Validators.required),
      lastName: new FormControl(this.loggedInUser.name.last, Validators.required),
      username: new FormControl(this.loggedInUser.username, [Validators.required, Validators.minLength(5), Validators.maxLength(15)]),
      email: new FormControl(this.loggedInUser.email, [Validators.required, this.validator.emailValidator()]),
      currency: new FormControl('', Validators.required),
    });

    this.subscription.add(
      this.currencyService.currencies.subscribe({
        next: (currencies: Currency[]) => {
          this.currencies = currencies;
          this.userProfileForm.get('currency').setValue(this.currencies[0]);
        },
      })
    );
    
    this.subscription.add(
      this.imageService.userImageUrl.subscribe({
        next: (imageUrl: string) => {
          this.userImageUrl = imageUrl;
        },
      })
    );

    this.subscription.add(
      this.userProfileForm.get('username').valueChanges.subscribe({
        next: (username: string) => {
          if (!this.userProfileForm.get('username').invalid){
            this.isUsernameError = false;
            this.checkUserExists(username, null);
          }
        },
      })
    );

    this.subscription.add(
      this.userProfileForm.get('email').valueChanges.subscribe({
        next: (email: string) => {
          if (!this.userProfileForm.get('email').invalid){
            this.isEmailError = false;
            this.checkUserExists(null, email);
          }
        },
      })
    );
  }
  
  showErrors(string: string): boolean {
    const field = this.userProfileForm.get(string);
    return field.invalid && (field.dirty || field.touched);
  }

  onSave(){
    if (this.userProfileForm.invalid){
      this.notifierService.warning('Form is invalid')
      return;
    }
    if (this.userProfileForm.dirty){
      this.updateProfile();
    }
    if (this.selectedFile && this.croppedImageUrl){
      this.updateImage();
    }
  }

  updateImage(){
    const image =  {
      name: this.selectedFile.name || 'image',
      type: this.selectedFile.type || 'image/jpeg',
      file: this.croppedImageUrl.split('base64,')[1] || ''
    } as Image;

    this.loader.show();
    this.userService.updateImage(image)
    .pipe(
      finalize(() => {
        this.loader.hide();
      })
    )
    .subscribe({
      next: () => {
        this.mixpanel.log('Image Uploaded');
        this.notifierService.success('Image uploaded successfully');
        this.imageService.getImage();
        this.selectedFile = null;
      },
      error: (err) => {
        this.notifierService.error('Error uploading image:', err);
      }
    });
  }

  checkUserExists(username: string, email: string){
    this.userService.exists(username, email).subscribe({
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

  updateProfile(){
    let user = new User();
    user.name = {
      first: this.userProfileForm.get('firstName').value,
      last: this.userProfileForm.get('lastName').value,
      display: ""
    };
    user.username = this.userProfileForm.get('username').value;
    user.email = this.userProfileForm.get('email').value;
    user.currency = this.userProfileForm.get('currency').value;

    this.loader.show();
    this.userService.update(user)
    .pipe(
      finalize(() => {
        this.loader.hide();
      })
    )
    .subscribe({
      next: () => {
        this.mixpanel.log('Profile Updated');
        this.notifierService.success('User Profile updated successfully.')
        this.getUser();
      }
    })
  }

  getUser(){
    this.userService.get().subscribe({
      next: (res: User) => {
        this.authService.loginUser(res);
      }
    })
  }

  onFileSelected(event: any) {
    const maxSize = 1 * 1024 * 1024;
    this.selectedFile = event.target.files[0];
    if (this.selectedFile.size > maxSize){
      this.notifierService.error('Maximum image size of 1 mb is allowed.')
      return;
    }
    if (this.selectedFile) {
      this.ref = this.dialogService.open(CropImageComponent, {
        data: {
          event: event
        },
        header: 'Crop Image',
        width: '50%',
        height: '80vh'
      });

      this.ref.onClose.subscribe(async (croppedImage: string) => {
        if (croppedImage) {
          let imageUrl = await this.imageService.getDataFromBlobUrl(croppedImage)
          this.croppedImageUrl = imageUrl.toString();
        }
      });
    }
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
