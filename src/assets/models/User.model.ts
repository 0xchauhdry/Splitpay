export class User {
  id: number;
  username: string;
  email: string;
  password: string = "";
  name: {
    first: string;
    last: string;
  };
  timezone: string = "";
}
