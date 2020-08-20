import { StormGlass } from "@src/clients/stormGlass";
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
});
