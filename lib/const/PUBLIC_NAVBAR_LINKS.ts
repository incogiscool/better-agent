import { DOCS_URL } from "./DOCS_URL";
import { FEATUREBASE_URL } from "./FEATUREBASE_URL";

export const PUBLIC_NAVBAR_LINKS = [
  {
    name: "Docs",
    id: "docs",
    link: DOCS_URL,
  },
  {
    name: "Components",
    id: "components",
    link: `${DOCS_URL}/components`,
  },
  {
    name: "Pricing",
    id: "pricing",
    link: "/pricing",
  },
  {
    name: "Demo",
    id: "demo",
    link: "/demo",
  },
  {
    name: "Contact",
    id: "contact",
    link: "/contact",
  },
  {
    name: "Feedback",
    id: "feedback",
    link: FEATUREBASE_URL,
    external: true,
  },
];
