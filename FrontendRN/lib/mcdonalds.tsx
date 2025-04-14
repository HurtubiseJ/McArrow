// USED https://github.com/0neDrop/mcdonalds-api/tree/master/src converted to tsx. 
// Have not tested!!!
export async function getNearestLocation(longitude: number, latitude: number, keyWord: string) {
    try{
        const fetchNearestLocation = async (
            lat: number,
            lng: number
          ): Promise<any> => {
            const radius = 10000; 
            const location = `${lat},${lng}`;
            const type = "restaurant";
            const key = "AIzaSyDZN49QqnniwdsEjKnqu4EntPC7SpVr4cM";
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyWord}&location=${location}&radius=${radius}&type=${type}&key=${key}`;

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
        return response.geometry.location;

    } catch {
        console.log("Error fetching McDonalds location");
        return
    }
}