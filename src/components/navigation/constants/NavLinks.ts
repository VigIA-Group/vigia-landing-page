import { LANDING_ROUTES } from "../../../utils/path-builder/LandingRoutes";
import { PRICE_ROUTES } from "../../../utils/path-builder/PriceRoutes";

export const NAV_LINKS = [
  {
    name: "Inicio",
    href: LANDING_ROUTES.hero,
  },
  {
    name: "Servicios",
    href: LANDING_ROUTES.services,
  },
  {
    name: "Precios",
    href: PRICE_ROUTES.calculator,
  },
  {
    name: "Logo",
    href: LANDING_ROUTES.whyToUse,
  },
  {
    name: "¿Por qué VigIA?",
    href: LANDING_ROUTES.whyToUse,
  },
  {
    name: "Nosotros",
    href: LANDING_ROUTES.footer,
  },
];
