import { useState, useMemo } from 'react';

/**
 * SortableTable - A reusable table with column sorting and full-field search.
 *
 * Props:
 *   data: array of objects
 *   columns: array of { key, label, render?, sortValue?, style? }
 *   onRowClick: (item) => void
 *   searchPlaceholder: string (default "Search all fields...")
 *   rowStyle?: (item) => object
 */
export default function SortableTable({ data, columns, onRowClick, searchPlaceholder, rowStyle }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [tableSearch, setTableSearch] = useState('');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    if (!tableSearch.trim()) return data;
    const q = tableSearch.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(v =>
        v != null && String(v).toLowerCase().includes(q)
      )
    );
  }, [data, tableSearch]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      let aVal = col?.sortValue ? col.sortValue(a) : a[sortKey];
      let bVal = col?.sortValue ? col.sortValue(b) : b[sortKey];

      // Handle nulls
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric sort
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String sort
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder={searchPlaceholder || 'Search all fields...'}
          value={tableSearch}
          onChange={e => setTableSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, width: 320 }}
        />
        {tableSearch && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
            {sorted.length} of {data.length} results
          </span>
        )}
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...(col.thStyle || {}) }}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr
                key={item.id || i}
                className={onRowClick ? 'clickable' : ''}
                onClick={() => onRowClick && onRowClick(item)}
                style={rowStyle ? rowStyle(item) : undefined}
              >
                {columns.map(col => (
                  <td key={col.key} style={col.style || {}}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
