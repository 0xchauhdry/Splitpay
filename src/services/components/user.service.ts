import { Injectable } from '@angular/core';
import { ApiService } from 'src/services/api/api.service';
import { LogIn } from 'src/shared/models/logIn.model';
import { User } from 'src/shared/models/user.model';
import { Image } from 'src/shared/models/image.model';

@Injectable()
export class UserService{
  constructor(private apiService: ApiService){}

  public logIn(logIn : LogIn){
    return this.apiService.post('user/login', logIn)
  }

  public signUp(user : User){
    return this.apiService.post('user/signup', user)
  }

  public socialLogin (user : User){
    return this.apiService.post('user/social-login', user)
  }

  public exists(userId: number, value : string){
    return this.apiService.get(`user/${userId}/exists?value=${value}`)
  }

  public checkExists(value : string){
    return this.apiService.get(`user/exists?value=${value}`)
  }

  public get(userId: number){
    return this.apiService.get(`user/${userId}`)
  }

  public update(user : User){
    return this.apiService.put(`user`, user)
  }

  public getCurrencies() {
    return this.apiService.get(`currency`);
  }

  public updateImage(image: Image) {
    return this.apiService.post(`user/image`, image);
  }

  public updatePassword(password) {
    return this.apiService.put(`user/password`, password);
  }

  public getImage(userId: number) {
    return this.apiService.get(`user/${userId}/image`);
  }
}

