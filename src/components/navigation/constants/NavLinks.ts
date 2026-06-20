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
    name: "¿Por qué nosotros?",
    href: LANDING_ROUTES.whyToUse,
  },
  {
    name: "Contacto",
    href: LANDING_ROUTES.footer,
  },
  {
    name: "Precios",
    href: PRICE_ROUTES.calculator,
  },
];
