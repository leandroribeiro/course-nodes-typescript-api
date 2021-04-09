import { StromGlass } from '@src/clients/stromGlass';
import axios from 'axios';
import stromGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stromGlassNormalizedHoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StromGlass client', () => {
    it('should return the normalize forecast from the StromGlass service', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        axios.get = jest.fn().mockResolvedValue({
            data: stromGlassWeather3HoursFixture
        });

        const stromGlass = new StromGlass(axios);
        const response = await stromGlass.fetchPoints(lat, lng);

        //    expect([0,0,0]).toBe([0, 0, 0]);
        //    expect([0,0,0]).toEqual([0, 0, 0]);
        expect(response).toStrictEqual(stromGlassNormalizedHoursFixture);
    })
})