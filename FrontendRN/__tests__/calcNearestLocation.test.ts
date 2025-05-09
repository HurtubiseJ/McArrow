import calcBearing from '@/lib/locationUtil';
import { getNearestLocation } from '@/lib/locationUtil';

it('Check getNearestLocation util, takes location and returns geometry location', async () => {
    // Class northfield location
    const startLocationLatitude = 44.46129320539737;
    const startLocationLongitude = -93.15293492654509;
    const keyWord = "McDonalds";

    const location = await getNearestLocation(startLocationLatitude, startLocationLongitude, keyWord);
    
    // Expect the northfield Mcdonalds location
    expect(location.lat).toBeCloseTo(44.4486537, 2)
    expect(location.lng).toBeCloseTo(-93.17010599999999, 2)
});



// it('finds the bearing from south to north = 0°', () => {
//   const b = calcBearing(10, 0, 11, 0);
//   expect(Math.round(b)).toBe(0);
// });


