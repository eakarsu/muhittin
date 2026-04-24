import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TYPE_LABELS = {
  insight: 'Insight',
  case_study: 'Case Study',
  industry: 'Industry',
};

const TYPE_COLORS = {
  insight: '#0f766e',
  case_study: '#c9a84c',
  industry: '#6366f1',
};

function getLink(item) {
  if (item.type === 'insight') return `/insights/${item.slug}`;
  if (item.type === 'case_study') return `/case-studies/${item.slug}`;
  if (item.type === 'industry') return `/industries/${item.slug}`;
  return '/';
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then(res => res.json())
        .then(data => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleResultClick = (item) => {
    onClose();
    navigate(getLink(item));
  };

  if (!open) return null;

  return (
    <>
      <div className="search-overlay" onClick={onClose} />
      <div className="search-modal">
        <div className="search-input-wrap">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search insights, case studies, industries..."
          />
          <kbd className="search-kbd" onClick={onClose}>ESC</kbd>
        </div>

        <div className="search-results">
          {loading && <p className="search-status">Searching...</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="search-status">No results found for "{query}"</p>
          )}
          {results.map((item, i) => (
            <button key={`${item.type}-${item.id}-${i}`} className="search-result-item" onClick={() => handleResultClick(item)}>
              <span className="search-result-badge" style={{ background: TYPE_COLORS[item.type] || '#64748b' }}>
                {TYPE_LABELS[item.type] || item.type}
              </span>
              <span className="search-result-title">{item.title}</span>
              {item.summary && <span className="search-result-summary">{item.summary.length > 120 ? item.summary.slice(0, 120) + '...' : item.summary}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
