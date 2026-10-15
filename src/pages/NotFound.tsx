import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O conteúdo que você procura não existe (ou mudou de lugar).</p>
      <Link to="/" className="mt-6 inline-block">
        ← voltar para todos os algoritmos
      </Link>
    </div>
  );
}
