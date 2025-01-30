import { useState, useEffect } from "react";
import axios from "axios";
import { type GpuCard } from "~/components/types/gpuInterface";

function useFetchGpuAvailability(
  initialGpuCards: GpuCard[],
  selectedRegion: string
): [GpuCard[], boolean, Error | null] {
  const [gpuCards, setGpuCards] = useState<GpuCard[]>(initialGpuCards);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  interface ApiResponse {
    success: boolean;
    map: null | undefined;
    listMap: Array<{
      is_active: string;
      product_url: string;
      price: string;
      fe_sku: string;
      locale: string;
    }>;
  }

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const promises = initialGpuCards.map(async (card) => {
          const card_url = card.api_url;
          const completeUrl = `/api/proxy?url=${encodeURIComponent(card.api_url)}&locale=${selectedRegion}`;

          try {
            const response = await axios.get<ApiResponse>(completeUrl);
            const isApiReachable =
              response.data.listMap &&
              Array.isArray(response.data.listMap) &&
              response.data.listMap.length > 0 &&
              "is_active" in (response.data.listMap[0] ?? {});

            const isActive = response.data.listMap.some(
              (item) => item.is_active === "true",
            );

            return {
              ...card,
              locale: selectedRegion,
              product_url: response.data.listMap[0]?.product_url ?? null,
              available: isActive,
              last_seen: isActive ? new Date().toISOString() : card.last_seen,
              api_reachable: isApiReachable,
            };
          } catch (error) {
            return {
              ...card,
              locale: selectedRegion,
              api_reachable: false,
            };
          }
        });

        const updatedCards = await Promise.all(promises);
        setGpuCards(updatedCards);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ Run fetchAvailability every 1 second
    fetchAvailability(); // Run immediately on component mount
    const interval = setInterval(() => {
      void fetchAvailability(); // Ensures async function works inside setInterval
    }, 1000);

    return () => clearInterval(interval); // ✅ Cleanup interval on component unmount
  }, [initialGpuCards, selectedRegion]); // ✅ Dependency array ensures it updates when region or cards change

  return [gpuCards, isLoading, error];
}

export { useFetchGpuAvailability };
