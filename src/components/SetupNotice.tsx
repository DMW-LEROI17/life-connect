import { Icon } from '@/components/Icons';

export function SetupNotice({
  title = 'Configuration requise',
}: {
  title?: string;
}) {
  return (
    <div className="container-lc max-w-2xl py-14">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
        <div className="flex items-start gap-3">
          <Icon name="alert" size={24} className="mt-0.5 shrink-0" />
          <div className="space-y-3">
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-sm">
              L’application est construite, mais la base de données n’est pas
              encore reliée. Créez un projet Supabase, exécutez les 4 scripts
              SQL, puis renseignez le fichier{' '}
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs">
                .env.local
              </code>
              .
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Créer un projet sur supabase.com.</li>
              <li>
                Exécuter <code>supabase/01_schema.sql</code>,{' '}
                <code>02_functions.sql</code>, <code>03_rls.sql</code>,{' '}
                <code>04_seed.sql</code>.
              </li>
              <li>
                Renseigner <code>NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
                <code>SUPABASE_SERVICE_ROLE_KEY</code>.
              </li>
              <li>Redémarrer le serveur avec Ctrl + C puis npm run dev.</li>
            </ol>
            <p className="text-xs opacity-80">
              Le guide complet se trouve dans <code>GUIDE_DEMARRAGE.md</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
