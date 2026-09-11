import Report, { toc } from './report.mdx'

/**
 * This is a minimal example, not a component to keep as-is — replace the
 * inline <ul> below with your own <TableOfContents items={toc} /> once
 * you've built and styled it.
 */
export default function App() {
  return (
    <div className="report-layout">
      <nav className="report-toc">
        <ul>
          {toc.map((item) => (
            <li key={item.id} style={{ marginLeft: (item.depth - 1) * 12 }}>
              <a href={`#${item.id}`}>
                {item.number} — {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="report-content">
        <Report />
      </main>
    </div>
  )
}