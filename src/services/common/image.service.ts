import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotifierService } from '../services/notifier.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Image } from 'src/shared/models/image.model';

@Injectable()
export class ImageService {
  constructor(private notifier: NotifierService, private sanitizer: DomSanitizer) {}

  private _userImageUrl: BehaviorSubject<SafeUrl> = new BehaviorSubject('');

  get userImageUrl(): any {
    return this._userImageUrl;
  }

  set userImageUrl(newValue: any) {
    this._userImageUrl.next(newValue);
  }

  async getDataFromBlobUrl(blobUrl: string): Promise<string | ArrayBuffer | null> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob); 
      });
    } catch (error) {
      this.notifier.error('Error fetching data from Blob URL:', error);
      return null;
    }
  }

  private base64ToBlob(base64: string, contentType: string = ''): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  imageToSafeUrl(image: Image){
    let blob = this.base64ToBlob(image.file, image.type);
    let objectUrl = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }
}
