export interface Company {
  name: string;
  slogan: string;
  shortDescription: string;
  logos: Logos;
  whyToUse: ReasonToUse[];
  videos: string[];
  socialMedia: SocialMedum[];
}

export interface ReasonToUse {
  reason: string;
  icon: string;
  description: string;
}

export interface Logos {
  icon: string;
  iconTitle: string;
  iconTitleRow: string;
  title: string;
}

export interface SocialMedum {
  name: string;
  url: string;
  icon: string;
}
