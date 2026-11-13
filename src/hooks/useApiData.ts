import { useEffect, useState } from 'react';

// Loads data from the API when the page opens.
// Returns the data, whether it's still loading, whether it failed, and reload() to fetch again.
export function useApiData<T>(load: () => Promise<T>, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the page closes before the answer arrives, the answer is ignored.
    let ignore = false;

    load()
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
    // Runs when the page opens and after reload(). `load` is left out on purpose:
    // it is a new function on every render and would cause endless reloading.
  }, [reloadCount]);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  return { data, loading, failed, reload };
}
