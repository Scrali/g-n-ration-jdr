import { PageHeader } from '../components/ui';
import { RETAILERS } from '../data/retailers';

export function SourcesPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Sources et méthode" lead="Comment les prix sont collectés, vérifiés et calculés." />

      <div className="flex flex-col gap-6 leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Nos principes</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Nous ne publions que des offres dont la source est connue et vérifiée.</li>
            <li>Aucun prix, aucune réduction et aucune date ne sont inventés. Une information inconnue est indiquée comme telle.</li>
            <li>Une promotion expirée n’est jamais présentée comme active. Les dates s’entendent à l’heure suisse.</li>
            <li>La réduction n’est affichée que si la source indique un prix de référence.</li>
            <li>Les prix avec carte de fidélité ou sous condition sont signalés.</li>
            <li>Une offre non revérifiée depuis plus de 7 jours est marquée « fraîcheur non garantie ».</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Calculs</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Prix unitaire = prix du conditionnement ÷ quantité totale (ex. 3 × 500 g à CHF 9.00 = CHF 6.00/kg).</li>
            <li>Les montants sont calculés au centime près, sans arrondi intermédiaire.</li>
            <li>Les offres « 2 pour 1 » et les quantités minimales sont prises en compte dans le coût du panier.</li>
            <li>Des produits de marques ou de qualités différentes ne sont jamais considérés comme identiques.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">État des enseignes</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Enseigne</th>
                  <th scope="col" className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {RETAILERS.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {r.status === 'active' ? 'Données vérifiées' : 'Source en cours de vérification'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Indépendance</h2>
          <p>
            Ce site est indépendant et n’est affilié à aucune des enseignes citées. Les noms d’enseignes sont utilisés
            uniquement pour identifier l’origine des offres ; aucun logo n’est reproduit. Les prix peuvent varier selon le
            magasin : vérifiez en magasin ou sur le site officiel avant d’acheter.
          </p>
        </section>
      </div>
    </div>
  );
}
