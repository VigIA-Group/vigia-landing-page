export interface Service {
  serviceName: string;
  description: string;
  image: string;
  features: Feature[];
}

export interface Feature {
  featureName: string;
  description: string;
  images: string[];
}

export type Services = Service[];
