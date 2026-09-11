import coverImg from "./assets/default-og-image.png";
import { CoverPage } from './components/cover-page/CoverPage';
import { Header } from './components/header/Header';
import Report, { toc } from './report.mdx';

export default function App() {
  return (
    <div className="page">
      <Header title="My report" logoAlt="logo here" />

      <main>
        <CoverPage
          title="Rapport SAÉ 4.01 - Qualité"
          coverImg={
            {
              coverImgAlt: "cover page",
              coverImgHref: "https://github.com/ElPotatoCorp/UnlockIt",
              coverImgSrc: `${coverImg}`
            }
          }
          date="Mars – Juin 2026"
          authors={
            [
              { firstName: "Eliot", lastName: "NADOUCE", alias: "Frozen1753", authorHref: "https://github.com/Frozen1753" },
              { firstName: "Noah", lastName: "GAUCHE", alias: "ElPotato", authorHref: "https://github.com/ElPotatoCorp" },
            ]
          }
          authorAffiliation={["IUT de Nevers, BUT Informatique"]}
        />

        <nav className="toc">
          <ul>
            {toc.map((item) => (
              <li key={item.id} className={`lvl${item.depth}`} style={{ marginLeft: (item.depth - 1) * 12 }}>
                <a href={`#${item.id}`}>
                  {item.number} — {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="content">
          <Report />
        </div>
      </main>
    </div>
  )
}