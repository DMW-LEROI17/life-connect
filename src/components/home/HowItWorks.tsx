const STEPS = [
  {
    title: 'Décrivez le besoin',
    text: 'Choisissez une famille, un service, votre région et votre quartier.',
  },
  {
    title: 'Nous alertons les pros',
    text: 'Les prestataires du même quartier, puis de la même commune, sont prévenus.',
  },
  {
    title: 'Vous êtes en contact',
    text: 'Dès qu’un professionnel accepte, son numéro apparaît. Vous l’appelez.',
  },
];

export function HowItWorks() {
  return (
    <section className="container-lc py-8">
      <h2 className="text-xl font-bold sm:text-2xl">Comment ça marche</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-3 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
