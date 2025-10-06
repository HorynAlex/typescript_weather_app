import type { Coordinates } from "@/api/types";
import { useEffect, useState } from "react";

//State Interface. Defines the structure of the object that will hold the geolocation state. This enforces type safety in TypeScript.
interface GeolocationState {
  //Property to store the latitude/longitude or null until retrieved.
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

//Hook Declaration. Declares the custom hook, which, by React convention, starts with use.
const UseGeolocation = () => {
  //State Initialization. Creates the state variable locationData with initial values: isLoading: true (as the request is expected to start immediately) and coordinates/error as null.
  const [locationData, setLocationData] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  //Function Declaration. Defines the function that contains all the logic for interacting with the browser's Geolocation API.
  const getLocation = () => {
    //State Reset. Before starting a new request, it resets any previous errors and sets isLoading to true.
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      //If the API is not supported, the corresponding error is set, and the function exits.
      setLocationData({
        coordinates: null,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      });
      return;
    }

    //API Call. Initiates the browser's built-in function to retrieve the current position.
    navigator.geolocation.getCurrentPosition(
      //Success Callback. Executed if the browser successfully obtains the coordinates.
      (position) => {
        //Updates the state: stores the retrieved latitude and longitude in the Coordinates format, clears the error, and sets isLoading: false.
        setLocationData({
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMessage: string;
        //Error Handling. Uses a switch statement to determine the specific cause of the failure based on the error.code constant.
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }

        //Updates the state after an error: sets the relevant error message and isLoading: false.
        setLocationData({
          coordinates: null,
          error: errorMessage,
          isLoading: false,
        });
      },
      //Request Options. The configuration object for getCurrentPosition: requests high accuracy, sets a timeout of 5 seconds, and prevents the use of stale (cached) data.
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  //Side Effect. Calls the getLocation() function once after the initial component render (due to the empty dependency array []). This automatically initiates the geolocation request when the hook is used.
  useEffect(() => {
    getLocation();
  }, []);

  //Return Value. The hook returns an object containing all the state properties (coordinates, error, isLoading) via the spread operator (...locationData), as well as the getLocation function itself.
  return {
    ...locationData,
    getLocation,
  };
};

export default UseGeolocation;
