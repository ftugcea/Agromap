import { Ion, Viewer, createWorldTerrain, createOsmBuildings, Cartesian3, Math } from "cesium";
import "cesium/Widgets/widgets.css";
import "./css/main.css";

// Your access token can be found at: https://cesium.com/ion/tokens.
    // Replace `your_access_token` with your Cesium ion access token.
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';
    
    var viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: true,
    });
    
    // Adjust the camera to look at Beykoz
    viewer.camera.lookAt(
      new Cesium.Cartesian3.fromDegrees(29.08896, 41.13866),
      new Cesium.Cartesian3(0.0, -800.0, 600.0)
    );
    
    // Add OSM Building tileset 
    var osmBuildingsTileset = Cesium.createOsmBuildings();
    viewer.scene.primitives.add(osmBuildingsTileset);
    
    // Applying a basic style
    function applyBasicStyle() {
      osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${name} === 'Crown Entertainment Complex'", "color('red')"],
            ["true", "color('cyan')"],
          ],
        },
      });
    }
    
    // Show features based on property
    function showFeaturesWithProperty() {
      osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        show: "${feature['building']} === 'residential' || ${feature['building']} === 'apartments'",
      });
    }
    
    // Color features with conditions
    function colorFeaturesWithConditions() {
      osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        defines: {
          distance:
            "distance(vec2(${feature['cesium#longitude']}, ${feature['cesium#latitude']}), vec2(29.08896, 41.13866))",
        },
        color: {
          conditions: [
            ["${distance} > 0.010", "color('#d65c5c')"],
            ["${distance} > 0.006", "color('#f58971')"],
            ["${distance} > 0.002", "color('#f5af71')"],
            ["${distance} > 0.0001", "color('#f5ec71')"],
            ["true", "color('#ffffff')"],
          ],
        },
      });
    }
    
    var menu = document.getElementById("dropdown");
    
    menu.options[0].onselect = function () {
      applyBasicStyle();
    };
    
    menu.options[1].onselect = function () {
      showFeaturesWithProperty();
    };
    
    menu.options[2].onselect = function () {
      colorFeaturesWithConditions();
    };
    
    menu.onchange = function () {
      var item = menu.options[menu.selectedIndex];
      if (item && typeof item.onselect === "function") {
        item.onselect();
      }
    };
    
    applyBasicStyle();
    
    menu.selectedIndex = 0;
    applyBasicStyle();

    
    
    // Entity çekmek için
    // try {
    //   new Cesium.EntityCollection(owner).getById(733597256);
    // console.log(new Cesium.EntityCollection(owner).getById(733597256));
    // } catch (error) {
    //   alert(error);
    // }
    
    // Information about the currently selected feature
const selected = {
  feature: undefined,
  originalColor: new Cesium.Color(),
};

// An entity object which will hold info about the currently selected feature for infobox display
const selectedEntity = new Cesium.Entity();

// Get default left click handler for when a feature is not picked on left click
const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
  Cesium.ScreenSpaceEventType.LEFT_CLICK
);

// If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
// If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
if (
  Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)
) {
  // Silhouettes are supported
  const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
  silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
  silhouetteBlue.uniforms.length = 0.01;
  silhouetteBlue.selected = [];

  const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
  silhouetteGreen.uniforms.color = Cesium.Color.LIME;
  silhouetteGreen.uniforms.length = 0.01;
  silhouetteGreen.selected = [];

  viewer.scene.postProcessStages.add(
    Cesium.PostProcessStageLibrary.createSilhouetteStage([
      silhouetteBlue,
      silhouetteGreen,
    ])
  );

  // Silhouette a feature blue on hover.
  viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
    movement
  ) {
    // If a feature was previously highlighted, undo the highlight
    silhouetteBlue.selected = [];

    // Pick a new feature
    const pickedFeature = viewer.scene.pick(movement.endPosition);
    if (!Cesium.defined(pickedFeature)) {
      nameOverlay.style.display = "none";
      return;
    }

    // A feature was picked, so show it's overlay content
    nameOverlay.style.display = "block";
    nameOverlay.style.bottom = `${
      viewer.canvas.clientHeight - movement.endPosition.y
    }px`;
    nameOverlay.style.left = `${movement.endPosition.x}px`;
    const name = pickedFeature.getProperty("BIN");
    nameOverlay.textContent = name;

    // Highlight the feature if it's not already selected.
    if (pickedFeature !== selected.feature) {
      silhouetteBlue.selected = [pickedFeature];
    }
  },
  Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Silhouette a feature on selection and show metadata in the InfoBox.
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
    movement
  ) {
    // If a feature was previously selected, undo the highlight
    silhouetteGreen.selected = [];

    // Pick a new feature
    const pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
      clickHandler(movement);
      return;
    }

    // Select the feature if it's not already selected
    if (silhouetteGreen.selected[0] === pickedFeature) {
      return;
    }

    // Save the selected feature's original color
    const highlightedFeature = silhouetteBlue.selected[0];
    if (pickedFeature === highlightedFeature) {
      silhouetteBlue.selected = [];
    }

    // Highlight newly selected feature
    silhouetteGreen.selected = [pickedFeature];

    // Set feature infobox description
    
    const featureName = pickedFeature.getProperty("elementId");
    selectedEntity.name = featureName;
    selectedEntity.description =
      'Loading <div class="cesium-infoBox-loading"></div>';
    viewer.selectedEntity = selectedEntity;
    selectedEntity.description =
      `${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>ElementId</th><td>"
      }${pickedFeature.getProperty("elementId")}</td></tr>` +
      `<tr><th>Name</th><td>Oğuz</td></tr>` + 
      `<tr><th>Product</th><td>Gül</td></tr>` +
      `<tr><th>Address</th><td>${pickedFeature.getProperty("addr:neighbourhood")}</td></tr>` +
      `<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
        "SOURCE_ID"
      )}</td></tr>` +
      `</tbody></table>`;
  },
  Cesium.ScreenSpaceEventType.LEFT_CLICK);
} else {
  // Silhouettes are not supported. Instead, change the feature color.

  // Information about the currently highlighted feature
  const highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };

  // Color a feature yellow on hover.
  viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
    movement
  ) {
    // If a feature was previously highlighted, undo the highlight
    if (Cesium.defined(highlighted.feature)) {
      highlighted.feature.color = highlighted.originalColor;
      highlighted.feature = undefined;
    }
    // Pick a new feature
    const pickedFeature = viewer.scene.pick(movement.endPosition);
    if (!Cesium.defined(pickedFeature)) {
      nameOverlay.style.display = "none";
      return;
    }
    // A feature was picked, so show it's overlay content
    nameOverlay.style.display = "block";
    nameOverlay.style.bottom = `${
      viewer.canvas.clientHeight - movement.endPosition.y
    }px`;
    nameOverlay.style.left = `${movement.endPosition.x}px`;
    let name = pickedFeature.getProperty("name");
    if (!Cesium.defined(name)) {
      name = pickedFeature.getProperty("id");
    }
    nameOverlay.textContent = name;
    // Highlight the feature if it's not already selected.
    if (pickedFeature !== selected.feature) {
      highlighted.feature = pickedFeature;
      Cesium.Color.clone(
        pickedFeature.color,
        highlighted.originalColor
      );
      pickedFeature.color = Cesium.Color.YELLOW;
    }
  },
  Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Color a feature on selection and show metadata in the InfoBox.
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
    movement
  ) {
    // If a feature was previously selected, undo the highlight
    if (Cesium.defined(selected.feature)) {
      selected.feature.color = selected.originalColor;
      selected.feature = undefined;
    }
    // Pick a new feature
    const pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
      clickHandler(movement);
      return;
    }
    // Select the feature if it's not already selected
    if (selected.feature === pickedFeature) {
      return;
    }
    selected.feature = pickedFeature;
    // Save the selected feature's original color
    if (pickedFeature === highlighted.feature) {
      Cesium.Color.clone(
        highlighted.originalColor,
        selected.originalColor
      );
      highlighted.feature = undefined;
    } else {
      Cesium.Color.clone(pickedFeature.color, selected.originalColor);
    }
    // Highlight newly selected feature
    pickedFeature.color = Cesium.Color.LIME;
    // Set feature infobox description
    const featureName = pickedFeature.getProperty("name");
    selectedEntity.name = featureName;
    selectedEntity.description =
      'Loading <div class="cesium-infoBox-loading"></div>';
    viewer.selectedEntity = selectedEntity;
    selectedEntity.description =
      `${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>BIN</th><td>"
      }${pickedFeature.getProperty("BIN")}</td></tr>` +
      `<tr><th>DOITT ID</th><td>${pickedFeature.getProperty(
        "DOITT_ID"
      )}</td></tr>` +
      `<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
        "SOURCE_ID"
      )}</td></tr>` +
      `<tr><th>Longitude</th><td>${pickedFeature.getProperty(
        "longitude"
      )}</td></tr>` +
      `<tr><th>Latitude</th><td>${pickedFeature.getProperty(
        "latitude"
      )}</td></tr>` +
      `<tr><th>Height</th><td>${pickedFeature.getProperty(
        "height"
      )}</td></tr>` +
      `<tr><th>Terrain Height (Ellipsoid)</th><td>${pickedFeature.getProperty(
        "TerrainHeight"
      )}</td></tr>` +
      `</tbody></table>`;
  },
  Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

