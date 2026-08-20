import { UseFetchAPIProp } from "./Types";
import React from "react";
import axios from "axios";

/**
 * Fetch data with axios and expose loading/error state.
 * @param {UseFetchAPIProp} props Hook options
 * @returns {{ data: any; loading: boolean; error: any }} Fetch state
 */
export function useFetchAPI({ url, options }: UseFetchAPIProp): {
  data: any;
  loading: boolean;
  error: any;
} {
  const [data, setData] = React.useState<any>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>(undefined);

  React.useEffect(() => {
    let isMounted = true;

    axios
      .get(url, options)
      .then((response) => {
        if (isMounted) {
          setData(response.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url, options]);

  return {
    data,
    loading,
    error,
  };
}
