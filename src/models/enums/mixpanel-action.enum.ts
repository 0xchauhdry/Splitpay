export enum MixpanelAction{
    PageViewed = 1,
    error = 2,
    info = 3,
    warning = 4
  }
  
  export function enumToString(enumValue: number): string {
    return MixpanelAction[enumValue];
  }
  