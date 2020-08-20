import { AxiosStatic } from "axios";

export class StormGlass {
  readonly apiParams =
    "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed";
  readonly apiSource = "noaa";

  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<{}> {
    return this.request.get(
      `https://api.stormglass.io/v2/weather/point?params=${this.apiParams}&source=${this.apiSource}&lat=${lat}&lng=${lng}`
    );
  }
}
