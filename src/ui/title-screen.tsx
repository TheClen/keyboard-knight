export function TitleScreen() {
  return (
    <main className="game-frame" aria-labelledby="game-title">
      <section className="title-screen">
        <p className="eyebrow">Un jeu d’apprentissage de la frappe</p>
        <h1 id="game-title">Keyboard Knight</h1>
        <p className="status">L’aventure se prépare…</p>
      </section>
    </main>
  )
}
