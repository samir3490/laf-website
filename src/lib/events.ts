/** Active and upcoming LAF events / competitions shown on /events */

import {
  DRAWING_COMPETITION_DATES,
  DRAWING_COMPETITION_PROMO_IMAGE,
  DRAWING_COMPETITION_THEME,
} from "@/lib/drawing-competition-promo";
import {
  YOUNG_INNOVATORS_DATES,
  YOUNG_INNOVATORS_PROMO_IMAGE,
} from "@/lib/young-innovators";

export type EventCompetition = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dateRange?: string;
  image?: string;
  href: string;
  submitHref?: string;
  galleryHref?: string;
  cta: string;
};

export const EVENT_COMPETITIONS: EventCompetition[] = [
  {
    id: "young-innovators",
    title: "Young Innovators Challenge 2026",
    subtitle: `${YOUNG_INNOVATORS_DATES.labelShort} · Free · Ages 6–16 · From home`,
    description:
      "Create something useful with home materials. Verify email, upload a photo (extra photo and video optional). Browse the gallery and vote with Google. Digital certificates for valid entries.",
    dateRange: YOUNG_INNOVATORS_DATES.label,
    image: YOUNG_INNOVATORS_PROMO_IMAGE,
    href: "/events/young-innovators",
    submitHref: "/events/young-innovators/submit",
    galleryHref: "/events/young-innovators/gallery",
    cta: "View challenge",
  },
  {
    id: "drawing",
    title: "Drawing Competition",
    subtitle: `${DRAWING_COMPETITION_DATES.labelShort} · Submit artwork · Vote for favourites`,
    description:
      `Share your paintings and drawings (${DRAWING_COMPETITION_DATES.label}). Theme: ${DRAWING_COMPETITION_THEME}. Browse entries, vote in your age group, and celebrate young artists. Parents can help children submit safely with first name, age, class, school, and city only.`,
    dateRange: DRAWING_COMPETITION_DATES.label,
    image: DRAWING_COMPETITION_PROMO_IMAGE,
    href: "/events/drawing-competition",
    submitHref: "/events/drawing-competition/submit",
    cta: "View gallery & vote",
  },
  {
    id: "scratch-games",
    title: "Scratch Games Showcase",
    subtitle: "Create games · Play together",
    description:
      "Play MIT Scratch games shared by the community — no login required. Sign in only to publish your own projects.",
    href: "/events/scratch-games",
    cta: "Play & share games",
  },
];

export function getEventCompetition(id: string): EventCompetition | undefined {
  return EVENT_COMPETITIONS.find((e) => e.id === id);
}
