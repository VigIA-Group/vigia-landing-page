export interface Service {
  name: string;
  description: string;
  features: Feature[];
}

export interface Feature {
  name: string;
  description: string;
  images: string[];
}

export type Services = Service[];
