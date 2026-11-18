import { useEffect, useState } from 'react';

export function useApiData<T>(
  load: () => Promise<T>,
  initialData: T,
  reloadWhen: unknown[] = []
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
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
  }, [reloadCount, ...reloadWhen]);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  return { data, loading, failed, reload };
}
