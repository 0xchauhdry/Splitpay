import { Component } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotifierService } from 'src/services/services/notifier.service';

@Component({
  selector: 'app-crop-image',
  standalone: true,
  imports: [
    ImageCropperComponent,
    ButtonModule
  ],
  templateUrl: './crop-image.component.html',
  styleUrl: './crop-image.component.scss'
})
export class CropImageComponent {
  imageChangedEvent: Event | null = null;
  croppedImage: string  = '';

  constructor(public ref: DynamicDialogRef<CropImageComponent>,
     public config: DynamicDialogConfig,
     private notifier: NotifierService) {
    this.imageChangedEvent = this.config.data.event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  loadImageFailed() {
    this.notifier.error('Failed to load image');
  }

  confirmCrop() {
    this.ref.close(this.croppedImage);
  }
}
