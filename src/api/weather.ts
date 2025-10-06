import { API_CONFIG } from "./config";
import type {
  Coordinates,
  ForecastData,
  GeocodingResponse,
  WeatherData,
} from "./types";

//class WeatherApi {: Class Declaration. Creates a class that encapsulates all the logic for working with the weather API.
class WeatherApi {
  //private createUrl(...) {: Private Method. A method for creating the complete URL for a request. The private keyword means this method can only be called from within the WeatherApi class.
  //endpoint: string: Expects the base part of the URL (e.g., .../weather or .../forecast).
  private createUrl(endpoint: string, params: Record<string, string | number>) {
    //const searchParams = new URLSearchParams({ ... });: Parameter Creation. Creates a new URLSearchParams object, which simplifies formatting parameters for the URL.
    //appid: API_CONFIG.API_KEY: Automatically adds the API key to every request.
    //	...params: Spreads and adds all other passed parameters.
    const searchParams = new URLSearchParams({
      appid: API_CONFIG.API_KEY,
      ...params,
    });

    //return endpoint?{searchParams.toString()};: URL Construction. Returns the complete URL string, combining the endpoint and the formatted query parameters.
    return `${endpoint}?${searchParams.toString()}`;
  }

  //private async fetchData<T>(url: string): Promise<T> {: Private Fetch Method. A generic asynchronous method that executes the fetch request, checks for errors, and parses the JSON response.
  //<T>: Generic Type. Allows the method to accept any data type on output (e.g., WeatherData or ForecastData).
  private async fetchData<T>(url: string): Promise<T> {
    //const response = await fetch(url);: Executing the Request. Uses the built-in fetch function to asynchronously retrieve data.
    const response = await fetch(url);

    //if (!response.ok) { ... }: Error Check. Checks the response.ok property. If the HTTP status is not in the 200–299 range (e.g., 404 or 500), an error is thrown.
    if (!response.ok) {
      throw new Error(`Weather API Error: ${response.statusText}`);
    }

    return response.json();
  }

  //async getCurrentWeather({ lat, lon }: Coordinates): Promise<WeatherData> {: Public Method. A method designed to retrieve the current weather data.
  //{ lat, lon }: Coordinates: Uses object destructuring and the Coordinates type to extract the latitude and longitude.
  //Promise<WeatherData>: Indicates that the method will return a Promise that resolves to an object of type WeatherData.
  async getCurrentWeather({ lat, lon }: Coordinates): Promise<WeatherData> {
    //const url = this.createUrl(...): Calls the private method createUrl to form the URL for the /weather endpoint.
    const url = this.createUrl(`${API_CONFIG.BASE_URL}/weather`, {
      //Note the use of lat.toString(): this ensures that numeric values are converted to strings for correct usage in the URL parameters.
      lat: lat.toString(),
      lon: lon.toString(),
      units: API_CONFIG.DEFAULT_PARAMS.units,
    });

    //return this.fetchData<WeatherData>(url);: Calls fetchData, specifying that the expected return data type is WeatherData.
    return this.fetchData<WeatherData>(url);
  }

  //async getForecast(...): Public Method. Similar to the previous one, but intended for retrieving the weather forecast (using the /forecast endpoint).
  async getForecast({ lat, lon }: Coordinates): Promise<ForecastData> {
    const url = this.createUrl(`${API_CONFIG.BASE_URL}/forecast`, {
      lat: lat.toString(),
      lon: lon.toString(),
      units: API_CONFIG.DEFAULT_PARAMS.units,
    });

    return this.fetchData<ForecastData>(url);
  }

  async reverseGeocode({
    lat,
    lon,
  }: Coordinates): Promise<GeocodingResponse[]> {
    const url = this.createUrl(`${API_CONFIG.GEO}/reverse`, {
      lat: lat.toString(),
      lon: lon.toString(),
      limit: "1",
    });
    return this.fetchData<GeocodingResponse[]>(url);
  }

  async searchLocations(query: string): Promise<GeocodingResponse[]> {
    const url = this.createUrl(`${API_CONFIG.GEO}/direct`, {
      q: query,
      limit: "5",
    });

    return this.fetchData<GeocodingResponse[]>(url);
  }
}

export const weatherApi = new WeatherApi();
