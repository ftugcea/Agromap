import { Ion, Viewer, createWorldTerrain, createOsmBuildings, Cartesian3, Math } from "cesium";
import "cesium/Widgets/widgets.css";
import "../src/css/main.css"

// Your access token can be found at: https://cesium.com/ion/tokens.
    // Replace `your_access_token` with your Cesium ion access token.
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';
    
    // Keep your Cesium.Ion.defaultAccessToken = 'your_token_here' line above. 
    // STEP 2 CODE
    // Initialize the viewer with Cesium World Terrain.
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    });
    // Add Cesium OSM Buildings.
    const buildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
    // Fly the camera to Istanbul, Turkey at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(29.08896, 41.13866, 1500)
    });