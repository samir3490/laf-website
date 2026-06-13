/** Active and upcoming LAF events / competitions shown on /events */

export type EventCompetition = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  submitHref?: string;
  cta: string;
};

export const EVENT_COMPETITIONS: EventCompetition[] = [
  {
    id: "drawing",
    title: "Drawing Competition",
    subtitle: "Submit artwork · Vote for favourites",
    description:
      "Share your paintings and drawings. Browse entries from other participants and vote for your favourites. Parents can help children submit safely with first name, age, class, school, and city only.",
    href: "/events/drawing-competition",
    submitHref: "/events/drawing-competition/submit",
    cta: "View gallery & vote",
  },
  {
    id: "scratch-games",
    title: "Scratch Games Showcase",
    subtitle: "Create games · Play together",
    description:
      "Build games with MIT Scratch and share them with the community. Sign in to publish your project and explore games made by other young creators.",
    href: "/events/scratch-games",
    cta: "Play & share games",
  },
];

export function getEventCompetition(id: string): EventCompetition | undefined {
  return EVENT_COMPETITIONS.find((e) => e.id === id);
}
