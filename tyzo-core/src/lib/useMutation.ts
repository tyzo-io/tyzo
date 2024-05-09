import { useState } from "react";

export function useMutation<T, R>(url: string) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (data: T) => {
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result as R;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    mutate: fetchData,
  };
}
