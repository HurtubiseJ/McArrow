// Returns locaton object of nearest store (input through keyWord) to input location
export async function getNearestLocation(latitude: number, longitude: number, keyWord: string) {
    try{
        const fetchNearestLocation = async (
            lat: number,
            lng: number
          ): Promise<any> => {
            const radius = 10000; 
            const location = `${lat},${lng}`;
            const type = "";

            // KEY FOR TESTING ONLY 
            // WHEN PRODUCTION, USE ENVIRONMENT VARIABLE
            const key = "AIzaSyDZN49QqnniwdsEjKnqu4EntPC7SpVr4cM"

            // const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Use the environment variable
            // if (!key) {
            //   console.error("Google Maps API key is not set. Please check your .env file.");
            //   return null;
            // }
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyWord}&location=${location}&radius=${radius}&type=${type}&key=${key}`;

            const response = await fetch(url);

            if (!response.ok) {
                console.log('Fetch Failed');
            }

            const data = await response.json();
            console.log(data)
            return data.results?.[0] || null;
        };

        const response = await fetchNearestLocation(latitude, longitude);
        if (response == null) {
            console.log("No location found");
            return
        }
        return response.geometry.location;

    } catch {
        console.log("Error fetching McDonalds location");
        return
    }
}
const toRad  = (d:number) => (d * Math.PI) / 180;

export function calcBearing(lat: number, lng: number, latLocation: number, lngLocation: number) {
    // Calculates heading from use location (lat, lng) to store (latLocation, lngLocation)
    const lat1 = toRad(lat)
    const lat2 = toRad(latLocation)
    const dLon = toRad(lngLocation - lng)

    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearingRad = Math.atan2(y, x);
    const bearingDeg = (bearingRad * 180 / Math.PI + 360) % 360;

    return bearingDeg;
}


// Distance calculation
export function haversineDistance (aLat:number, aLng:number, bLat:number, bLng:number): number{
    const distance = 2 * 6371 * Math.asin(Math.sqrt(
        Math.sin((toRad(bLat) - toRad(aLat)) / 2)**2 +
        Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) *
        Math.sin((toRad(bLng) - toRad(aLng)) / 2)**2
    ))
    return distance
};