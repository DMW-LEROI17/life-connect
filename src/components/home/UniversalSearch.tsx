'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';

import { Icon } from '@/components/Icons';
import { resolveUniversalSearch } from '@/lib/universal-search';

const EXAMPLES = [
  'Emploi',
  'Appartement',
  'Graphiste',
  'Mécanicien',
  'Fournisseur',
];

export function UniversalSearch({ tone = 'default' }: { tone?: 'default' | 'hero' }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hero = tone === 'hero';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();

    if (query.length < 2) {
      setError('Écrivez ce que vous cherchez.');
      return;
    }

    setError('');
    router.push(resolveUniversalSearch(query).href);
  }

  function startVoice() {
    setError('');
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('La recherche vocale n’est pas disponible sur ce navigateur.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => {
        setListening(false);
        setError('Micro indisponible. Autorisez le microphone ou écrivez.');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) setValue(transcript);
      };

      recognition.start();
    } catch {
      setListening(false);
      setError('Impossible de démarrer la recherche vocale.');
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className={`rounded-2xl border bg-surface p-2 shadow-soft ${
          hero
            ? 'border-white/30 shadow-[0_18px_50px_rgba(2,12,27,0.35)]'
            : 'border-line'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Icon name="search" size={22} className="ml-2 shrink-0 text-muted" />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="De quoi avez-vous besoin aujourd’hui ? (Ex : un mécanicien, un appartement, un emploi…)"
            className="min-h-12 w-full bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted sm:text-base"
            aria-label="Recherche universelle"
          />
          <button
            type="button"
            onClick={startVoice}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
              listening
                ? 'bg-urgent-500 text-white'
                : 'bg-surface2 text-muted hover:text-ink'
            }`}
            aria-label="Rechercher à la voix"
          >
            <Icon name="mic" size={19} />
          </button>
          <button
            type="submit"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-3 text-xs font-bold text-white sm:px-4 sm:text-sm"
          >
            <Icon name="search" size={16} />
            <span className="hidden sm:inline">Chercher</span>
          </button>
        </div>
      </form>

      {error ? (
        <p className={`mt-1 text-xs font-medium ${hero ? 'text-amber-200' : 'text-urgent-600'}`} role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setValue(example);
              setError('');
            }}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              hero
                ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                : 'border border-line bg-surface text-muted hover:border-teal-500/40 hover:text-ink'
            }`}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
