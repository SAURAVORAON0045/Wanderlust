
// Access the key passed from backend

  maptilersdk.config.apiKey = maptilerKey;
  
  const map = new maptilersdk.Map({
    container: "map", // ID of the div
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates, // [longitude, latitude] - currently set to New Delhi
    zoom: 9
  });

  // Optional: Add a marker
  new maptilersdk.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(`<h4>${listing.title}</h4><p>${listing.location}</p>`)
    )
    .addTo(map);