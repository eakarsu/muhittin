import { useEffect } from 'react';

export default function useSEO(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Multiverse Consulting Group` : 'Multiverse Consulting Group';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.content = description;

    return () => {
      document.title = 'Multiverse Consulting Group';
    };
  }, [title, description]);
}
