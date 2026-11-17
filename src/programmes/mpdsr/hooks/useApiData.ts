import { useEffect, useRef, useState } from 'react';

// Loads data from the API when the page opens.
// Returns the data, whether it's still loading, whether it failed, and reload() to fetch again.
export function useApiData<T>(
  load: () => Promise<T>,
  initialData: T,
  // Reload when this key changes, e.g. the current user's id or current route.
  reloadKey?: string | number | null
) {
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the page closes before the answer arrives, the answer is ignored.
    let ignore = false;

    loadRef.current()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
    // Runs when the page opens, reload() is called, or reloadKey changes.
  }, [reloadCount, reloadKey]);

  function reload() {
    setLoading(true);
    setFailed(false);
    setReloadCount((count) => count + 1);
  }

  return { data, loading, failed, reload };
}
