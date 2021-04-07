import { AxiosStatic } from "axios";

export class StromGlass {
    readonly stormGlassAPIParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stromGlassAPISource = 'noaa';

    constructor(protected request: AxiosStatic) {

    }

    public async fetchPoints(lat: number, lng: number): Promise<{}> {
        return this.request.get(`https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stromGlassAPISource}&end=1592113802&lat=${lat}&lng=${lng}}`);
    }
}