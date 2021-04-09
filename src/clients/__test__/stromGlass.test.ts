import { StromGlass } from '@src/clients/stromGlass';
import axios from 'axios';
import stromGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stromGlassNormalizedHoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StromGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('should return the normalize forecast from the StromGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({
      data: stromGlassWeather3HoursFixture,
    });

    const stromGlass = new StromGlass(mockedAxios);
    const response = await stromGlass.fetchPoints(lat, lng);

    //    expect([0,0,0]).toBe([0, 0, 0]);
    //    expect([0,0,0]).toEqual([0, 0, 0]);
    expect(response).toStrictEqual(stromGlassNormalizedHoursFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00+00:00',
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stromGlass = new StromGlass(mockedAxios);
    const response = await stromGlass.fetchPoints(lat, lng);

    expect(response).toStrictEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({ message: 'Network Error' });

    const stromGlass = new StromGlass(mockedAxios);

    await expect(stromGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error ', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'],
        },
      },
    });

    const stromGlass = new StromGlass(mockedAxios);

    await expect(stromGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
