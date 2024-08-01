import { SafeUrl } from "@angular/platform-browser";
import { Image } from "./image.model";
import { Name } from "./name.model";

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
  googleImageUrl: string;
  googleToken: string;
}
