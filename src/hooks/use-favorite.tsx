// src/hooks/use-favorites.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

export interface FavoriteCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  addedAt: number;
}

export function useFavorites() {
  //Local Storage State. Uses the useLocalStorage hook to manage the array of favorite cities. The data is synchronized between React state and the "favorites" key in localStorage, defaulting to an empty array [].
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>(
    "favorites",
    []
  );
  //Query Client Initialization. Retrieves the instance of the TanStack Query client, which is needed to manually interact with the cache (e.g., invalidating queries).
  const queryClient = useQueryClient();

  //Data Query. Defines a query to read the list of favorites. This handles data access, caching, and state management.
  const favoritesQuery = useQuery({
    //Unique Key. The unique identifier for this piece of data in the TanStack Query cache.
    queryKey: ["favorites"],
    //Query Function. The function that retrieves the data. Here, it simply returns the current value from the useLocalStorage state (favorites).
    queryFn: () => favorites,
    //Initial Data. Provides the initial data from localStorage immediately, ensuring the app doesn't show a "loading" state when the favorites are already cached locally.
    initialData: favorites,
    staleTime: Infinity, // Since we're managing the data in localStorage
  });

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, "id" | "addedAt">) => {
      //Create New Item. Constructs the final FavoriteCity object by spreading the input city, generating a unique id based on coordinates, and setting the current timestamp for addedAt.
      const newFavorite: FavoriteCity = {
        ...city,
        id: `${city.lat}-${city.lon}`,
        addedAt: Date.now(),
      };

      //Duplicate Check. Checks if a city with the same calculated ID already exists in the current favorites list.
      const exists = favorites.some((fav) => fav.id === newFavorite.id);
      if (exists) return favorites;

      //Update List. Creates a new array containing all current favorites plus the new one.
      const newFavorites = [...favorites, newFavorite];
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeFavorite = useMutation({
    //Mutation Function. Accepts the cityId (string) of the city to be removed.
    mutationFn: async (cityId: string) => {
      //Update List. Creates a new array containing only cities whose ID does not match the given cityId.
      const newFavorites = favorites.filter((city) => city.id !== cityId);
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favorites: favoritesQuery.data,
    addFavorite,
    removeFavorite,
    isFavorite: (lat: number, lon: number) =>
      favorites.some((city) => city.lat === lat && city.lon === lon),
  };
}
