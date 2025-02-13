import { SafeUrl } from "@angular/platform-browser";
import { Image } from "./image.model";
import { Name } from "./common/name.model";

export class User {
  id: number;
  username: string;
  email: string;
  password: string = "";
  name: Name;
  timezone: string = "";
  balance: number;
  currency: number;
  imageUrl: SafeUrl;
  image: Image;
  passwordSet: boolean;
  googleImageUrl: string;
  googleToken: string;
}
