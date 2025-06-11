
import axios from 'axios';

const BASE_URL = 'https://frontend-take-home-service.fetch.com';

export const fetchDogIds = async (paramsOrQuery: object | string) => {
  const url =
    typeof paramsOrQuery === 'string'
      ? `${BASE_URL}/dogs/search?${paramsOrQuery}` // if filters then
      : `${BASE_URL}/dogs/search`; //else

  const response = await axios.get(url, {
    ...(typeof paramsOrQuery === 'object' ? { params: paramsOrQuery } : {}),
    withCredentials: true,
  });

  return response.data;
};

export const searchLocations = async (city: string, state: string) => {
  const body: any = {};
  if (city.trim()) body.city = city;
  if (state.trim()) body.states = [state];

  const response = await axios.post(
    `${BASE_URL}/locations/search`,
    body,
    { withCredentials: true }
  );
  return response.data.results.map((loc: any) => loc.zip_code);
};


export const fetchDogsByIds = async (ids: string[]) => {
  const response = await axios.post(`${BASE_URL}/dogs`, ids, {
    withCredentials: true,
  });
  return response.data; // array of Dog objects
};

export const fetchBreeds = async () => {
  const response = await axios.get(`${BASE_URL}/dogs/breeds`, {
    withCredentials: true,
  });
  return response.data as string[];
};

export const searchLocationsByCity = async (city: string) => {
  const response = await axios.post(
    `${BASE_URL}/locations/search`,
    { city },
    { withCredentials: true }
  );
  return response.data.results.map((loc: any) => loc.zip_code);
};

export const fetchMatch = async (favoriteIds: string[]) => {
  const response = await axios.post(
    `${BASE_URL}/dogs/match`,
    favoriteIds,
    { withCredentials: true }
  );
  return response.data.match; // returns a single dog ID
};
