import { Injectable } from '@angular/core';
import { ApiService } from 'src/services/api/api.service';
import { LogIn } from '../../models/logIn.model';
import { User } from '../../models/user.model';
import { Image } from '../../models/image.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService{
  userId: number = 0;
  constructor(private apiService: ApiService, private authService: AuthService){
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.userId = user.id;
        }
      }
    })
  }

  public logIn(logIn : LogIn){
    return this.apiService.post('user/login', logIn)
  }

  public signUp(user : User){
    return this.apiService.post('user/signup', user)
  }

  public exists(username : string, email : string){
    return this.apiService
      .get(`user/${this.userId}/exists?username=${username}&email=${email}`)
  }

  public get(){
    return this.apiService.get(`user/${this.userId}`)
  }

  public update(user : User){
    return this.apiService.put(`user/${this.userId}`, user)
  }

  public getCurrencies() {
    return this.apiService.get(`currency/${this.userId}`);
  }

  public updateImage(image: Image) {
    return this.apiService.post(`user/${this.userId}/image`, image);
  }

  public getImage() {
    return this.apiService.get(`user/${this.userId}/image`);
  }

  public getUserImage(userId: number) {
    return this.apiService.get(`user/${userId}/image`);
  }
}

