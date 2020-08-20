import {
  StormGlass,
  ClientRequestError,
  StormGlassResponseError,
} from "@src/clients/stormGlass";
import axios from "axios";
import weatherResponse from "@test/fixtures/stormglass_weather_3_hours.json";
import normalizedWeatherResponse from "@test/fixtures/stormglass_normalized_response_3_hours.json";

jest.mock("axios");

describe("StormGlass client", () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it("should return the normalized forecast from the StormGlass service", async () => {
    const lat = -33.89123;
    const lng = 151.28924;

    mockedAxios.get.mockResolvedValue({ data: weatherResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(normalizedWeatherResponse);
  });

  it("should exclude incomplete data points", async () => {
    const lat = -33.89123;
    const lng = 151.28924;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: "2020-04-26T00:00:00+00:00",
        },
      ],
    };
    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual([]);
  });

  it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: "Network Error" });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      ClientRequestError
    );
  });

  it("should get an StormGlassResponseError when the StormGlass service responds with an errro", async () => {
    const lat = -33.789431;
    const lng = 151.28942;
    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ["Rate limit reached"] },
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      StormGlassResponseError
    );
  });
});
