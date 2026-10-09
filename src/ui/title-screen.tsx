import { useKeyDown } from './keyboard'

interface TitleScreenProps {
  readonly onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  useKeyDown((event) => {
    if (event.key === 'Enter' && !event.repeat) {
      onStart()
    }
  })

  return (
    <main className="game-frame" aria-labelledby="game-title">
      <section className="title-screen">
        <p className="eyebrow">Un jeu d’apprentissage de la frappe</p>
        <h1 id="game-title">Keyboard Knight</h1>
        <p className="status">Appuyez sur Entrée</p>
      </section>
    </main>
  )
}
