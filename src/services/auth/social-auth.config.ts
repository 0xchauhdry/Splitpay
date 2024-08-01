import { GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { environment } from "src/environments/environment";

export const socialAuthConfig: SocialAuthServiceConfig = {
  autoLogin: false,
  providers: [
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(environment.googleClientId),
    },
  ],
};
