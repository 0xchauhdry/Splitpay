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
import { Subscription, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { Image } from 'src/shared/models/image.model';
import { ValidatorService } from 'src/services/common/validator.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { ImageService } from 'src/services/common/image.service';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CropImageComponent } from 'src/shared/components/crop-image/crop-image.component';
import { SafeUrl } from '@angular/platform-browser';
import { Currency } from 'src/shared/models/currency.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { setImage } from 'src/store/actions';

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
    DialogService,
    ValidatorService,
    UserService
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
    this.getLoggedInUser();

    this.userProfileForm = this.formBuilder.group({
      firstName: new FormControl(this.loggedInUser.name.first, Validators.required),
      lastName: new FormControl(this.loggedInUser.name.last, Validators.required),
      username: new FormControl(this.loggedInUser.username, [
        Validators.required, 
        Validators.minLength(5), 
        Validators.maxLength(15)
      ]),
      email: new FormControl({ value: this.loggedInUser.email, disabled: true }, [
        Validators.required, 
        this.validator.emailValidator()
      ]),
      currency: new FormControl('', Validators.required),
    });

    this.subscription.add(
      this.userService.getCurrencies()
      .subscribe({
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
      this.userProfileForm.get('username').valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged()
      )
      .subscribe({
        next: (username: string) => {
          if (!this.userProfileForm.get('username').invalid){
            this.isUsernameError = false;
            this.checkUserExists(username);
          }
        },
      })
    );

    this.subscription.add(
      this.userProfileForm.get('email').valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged()
      )
      .subscribe({
        next: (email: string) => {
          if (!this.userProfileForm.get('email').invalid){
            this.isEmailError = false;
            this.checkUserExists(email);
          }
        },
      })
    );
  }

  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.loggedInUser = user;
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
    this.subscription.add(
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
          setImage({ image });
          this.selectedFile = null;
        },
        error: (err) => {
          this.notifierService.error('Error uploading image:', err);
        }
      })
    );
  }

  checkUserExists(value: string){
    this.subscription.add(
      this.userService.exists(this.loggedInUser.id, value).subscribe({
        error: (error) => {
          if(error.message.includes('username')){
            this.isUsernameError = true;
          }
          else if (error.message.includes('email')){
            this.isEmailError = true;
          }
        }
      })
    );
  }

  updateProfile(){
    let user = new User();
    user.id = this.loggedInUser.id;
    user.name = {
      first: this.userProfileForm.get('firstName').value,
      last: this.userProfileForm.get('lastName').value,
      display: this.userProfileForm.get('firstName').value + ' ' + this.userProfileForm.get('lastName').value
    };
    user.username = this.userProfileForm.get('username').value;
    user.email = this.userProfileForm.get('email').getRawValue();
    user.currency = this.userProfileForm.get('currency').value;

    this.loader.show();
    this.subscription.add(
      this.userService.update(user)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: () => {
          this.mixpanel.log('Profile Updated');
          this.notifierService.success('User Profile updated successfully.');
          this.authService.loginUser(user);
        }
      })
    );
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

      this.subscription.add(
        this.ref.onClose.subscribe(async (croppedImage: string) => {
          if (croppedImage) {
            let imageUrl = await this.imageService.getDataFromBlobUrl(croppedImage)
            this.croppedImageUrl = imageUrl.toString();
          }
        })
      );
    }
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
