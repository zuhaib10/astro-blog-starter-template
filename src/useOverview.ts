import { useEffect, useState } from "react";
import { demoOverview, fetchOverview, type Overview } from "./api";

export function useOverview(): Overview {
  const [data, setData] = useState<Overview>(demoOverview);

  useEffect(() => {
    const controller = new AbortController();
    fetchOverview(controller.signal).then(setData);
    return () => controller.abort();
  }, []);

  return data;
}
