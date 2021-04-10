import { StromGlass } from '@src/clients/stromGlass';
import * as stromGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stromGlassNormalizedHoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';

// jest.mock('axios');
jest.mock('@src/util/request');

describe('StromGlass client', () => {

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>
  // const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;


  it('should return the normalize forecast from the StromGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: stromGlassWeather3HoursFixture,
    } as HTTPUtil.Response);

    const stromGlass = new StromGlass(mockedRequest);
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

    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response);

    const stromGlass = new StromGlass(mockedRequest);
    const response = await stromGlass.fetchPoints(lat, lng);

    expect(response).toStrictEqual([]);
  });


  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    mockedRequest.get.mockRejectedValue(new Error('Network Error'));

    const stromGlass = new StromGlass(mockedRequest);

    await expect(stromGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });


  it('should get an StormGlassResponseError when the StormGlass service responds with error ', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'],
        },
      },
    } as unknown as HTTPUtil.Response);

    const stromGlass = new StromGlass(mockedRequest);

    await expect(stromGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
