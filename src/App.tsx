import { useEffect, useState } from 'react';
import Shell from './components/layout/Shell';
import Landing from './views/Landing';
import { useAppStore } from './stores/app';

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const [started, setStarted] = useState(() => {
    return localStorage.getItem('hush.started') === '1';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function begin() {
    localStorage.setItem('hush.started', '1');
    setStarted(true);
  }

  return (
    <>
      <div className="wallpaper" />
      <div className="aurora" />
      <div className="grain" />
      {started ? <Shell /> : <Landing onBegin={begin} />}
    </>
  );
}
