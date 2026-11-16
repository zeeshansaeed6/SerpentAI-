import React, { useMemo, useState } from 'react';
import { Table2, BarChart3 } from 'lucide-react';
import { SEVERITY } from '../utils/severity';
import SeverityGlyph from './SeverityGlyph';

const MAX_FAMILIES = 6; // fold the tail into "Other" instead of adding more bars
const VENOM_COLOR = '#c084fc';
const NON_VENOM_COLOR = '#64748b';

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// Overview of the species currently shown (it follows the search and filters above it).
// Forms: KPI tiles, ordered bars for the danger scale, ranked bars for families, and a thin
// segmented bar for the venomous split. A table view carries every number for non-visual use.
export default function SpeciesInsights({ snakes }) {
  const [showTable, setShowTable] = useState(false);

  const stats = useMemo(() => {
    const byLevel = Object.fromEntries(SEVERITY.map((s) => [s.level, 0]));
    const familyCounts = new Map();
    let venomous = 0;

    snakes.forEach((snake) => {
      if (snake.venomous) venomous += 1;
      if (byLevel[snake.dangerLevel] !== undefined) byLevel[snake.dangerLevel] += 1;
      const family = snake.family || 'Unknown';
      familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
    });

    const ranked = [...familyCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const shown = ranked.slice(0, MAX_FAMILIES);
    const otherCount = ranked.slice(MAX_FAMILIES).reduce((sum, [, count]) => sum + count, 0);
    if (otherCount) shown.push(['Other', otherCount]);

    return { byLevel, venomous, families: shown, familyTotal: ranked.length };
  }, [snakes]);

  if (!snakes.length) return null;

  const total = snakes.length;
  const nonVenomous = total - stats.venomous;
  const maxLevel = Math.max(1, ...Object.values(stats.byLevel));
  const maxFamily = Math.max(1, ...stats.families.map(([, count]) => count));

  const tiles = [
    { label: 'Species shown', value: total },
    { label: 'Venomous', value: stats.venomous, note: `${percent(stats.venomous, total)}% of shown` },
    { label: 'Deadly', value: stats.byLevel.Deadly, note: 'highest danger level', color: SEVERITY[3].color },
    { label: 'Families', value: stats.familyTotal }
  ];

  return (
    <section className="glass-panel viz-panel" aria-label="Species insights">
      <div className="viz-head">
        <div>
          <h3 className="viz-title">Species insights</h3>
          <p className="viz-sub">A snapshot of the {total} species currently shown. It updates with your search and filters.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary viz-toggle"
          aria-pressed={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? <BarChart3 size={16} /> : <Table2 size={16} />} {showTable ? 'Chart view' : 'Table view'}
        </button>
      </div>

      <div className="viz-tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="viz-tile">
            <div className="viz-tile__label">{tile.label}</div>
            <div className="viz-tile__value" style={tile.color ? { color: tile.color } : undefined}>{tile.value}</div>
            {tile.note && <div className="viz-tile__note">{tile.note}</div>}
          </div>
        ))}
      </div>

      {showTable ? (
        <div className="viz-tables">
          <table className="viz-table">
            <caption>Species by danger level</caption>
            <thead><tr><th scope="col">Danger level</th><th scope="col">Species</th></tr></thead>
            <tbody>
              {SEVERITY.map((s) => (
                <tr key={s.level}><th scope="row">{s.level}</th><td>{stats.byLevel[s.level]}</td></tr>
              ))}
            </tbody>
          </table>
          <table className="viz-table">
            <caption>Species by family</caption>
            <thead><tr><th scope="col">Family</th><th scope="col">Species</th></tr></thead>
            <tbody>
              {stats.families.map(([family, count]) => (
                <tr key={family}><th scope="row">{family}</th><td>{count}</td></tr>
              ))}
            </tbody>
          </table>
          <table className="viz-table">
            <caption>Venom</caption>
            <thead><tr><th scope="col">Type</th><th scope="col">Species</th></tr></thead>
            <tbody>
              <tr><th scope="row">Venomous</th><td>{stats.venomous}</td></tr>
              <tr><th scope="row">Non-venomous</th><td>{nonVenomous}</td></tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="viz-cols">
            <div className="viz-card">
              <h4 className="viz-card__title">By danger level</h4>
              <div className="viz-rows">
                {SEVERITY.map((s, i) => (
                  <div key={s.level} className="viz-row">
                    <span className="viz-label"><SeverityGlyph level={s.level} /> {s.level}</span>
                    <span className="viz-track">
                      <span
                        className="viz-fill"
                        style={{ width: `${(stats.byLevel[s.level] / maxLevel) * 100}%`, background: s.color, '--i': i }}
                      />
                    </span>
                    <span className="viz-count">{stats.byLevel[s.level]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="viz-card">
              <h4 className="viz-card__title">By family</h4>
              <div className="viz-rows">
                {stats.families.map(([family, count], i) => (
                  <div key={family} className="viz-row">
                    <span className="viz-label">{family}</span>
                    <span className="viz-track">
                      <span className="viz-fill" style={{ width: `${(count / maxFamily) * 100}%`, background: 'var(--emerald-500)', '--i': i }} />
                    </span>
                    <span className="viz-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="viz-card viz-split-card">
            <h4 className="viz-card__title">Venomous vs non-venomous</h4>
            <div className="viz-split" role="img" aria-label={`${stats.venomous} venomous, ${nonVenomous} non-venomous`}>
              {stats.venomous > 0 && <span style={{ flex: stats.venomous, background: VENOM_COLOR }} />}
              {nonVenomous > 0 && <span style={{ flex: nonVenomous, background: NON_VENOM_COLOR }} />}
            </div>
            <ul className="viz-split-legend">
              <li><i style={{ background: VENOM_COLOR }} /> Venomous <strong>{stats.venomous}</strong></li>
              <li><i style={{ background: NON_VENOM_COLOR }} /> Non-venomous <strong>{nonVenomous}</strong></li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
