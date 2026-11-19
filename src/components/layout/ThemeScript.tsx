export function ThemeScript() {
  const script = `(function(){try{var stored=localStorage.getItem('lc-theme');var dark=stored?stored==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(dark){document.documentElement.classList.add('dark');}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
