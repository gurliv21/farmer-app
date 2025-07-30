export function calculatePolygonArea(coords) {
  const R = 6378137; 

  if (coords.length < 3) return 0;

  const toRadians = (deg) => deg * Math.PI / 180;
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const { latitude: lat1, longitude: lng1 } = coords[i];
    const { latitude: lat2, longitude: lng2 } = coords[(i + 1) % coords.length];

    const deltaLng = toRadians(lng2 - lng1);
    const sinLat1 = Math.sin(toRadians(lat1));
    const sinLat2 = Math.sin(toRadians(lat2));


    area += deltaLng * (2 + sinLat1 + sinLat2);
  }

  area = Math.abs(area * R * R / 2); 
  const acres = area / 4046.86;      
  return acres;
}
