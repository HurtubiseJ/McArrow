// USED https://github.com/0neDrop/mcdonalds-api/tree/master/src converted to tsx. 
export async function getNearestLocation(latitude: number, longitude: number, keyWord: string) {
    try{
        const fetchNearestLocation = async (
            lat: number,
            lng: number
          ): Promise<any> => {
            const radius = 10000; 
            const location = `${lat},${lng}`;
            const type = "";
            const key = "AIzaSyDZN49QqnniwdsEjKnqu4EntPC7SpVr4cM";
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyWord}&location=${location}&radius=${radius}&type=${type}&key=${key}`;

            console.log(url);

            const response = await fetch(url);

            if (!response.ok) {
                console.log('Fetch Failed');
            }

            const data = await response.json();
            console.log(data);
            return data.results?.[0] || null;
        };
        const response = await fetchNearestLocation(latitude, longitude);
        if (response == null) {
            console.log("No location found");
            return
        }
        console.log("Location: \n")
        console.log(response.geometry.location);
        return response.geometry.location;

    } catch {
        console.log("Error fetching McDonalds location");
        return
    }
}

export default function calcBearing(lat: number, lng: number, latLocation: number, lngLocation: number) {
    // Calculates heading from use location (lat, lng) to store (latLocation, lngLocation)
    const toRad = (deg: number) => deg * (Math.PI / 180);

    const lat1 = toRad(lat);
    const lng1 = toRad(lng);
    const lat2 = toRad(latLocation);
    const lng2 = toRad(lngLocation);

    const x = Math.cos(lat2) * Math.sin(lng2 - lng1);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);

    const b = Math.atan2(x, y) * (180 / Math.PI); // Bearing in degrees

    const bearing = (b + 360) % 360; // Normalize to 0–360°
    return bearing;
}

export async function getDistance(lat: number, lng: number, latLocation: number, lngLocation: number){
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);

    const latLocRad = latLocation * (Math.PI / 180); 
    const lngLocRad = lngLocation * (Math.PI / 180);

    const a =
        Math.sin((latLocRad - latRad) / 2) ** 2 +
        Math.cos(latRad) *
            Math.cos(latLocRad) *
            Math.sin((lngLocRad - lngRad) / 2) ** 2;

    const dist = 2 * 6371 * Math.asin(Math.sqrt(a));

    return dist;
};