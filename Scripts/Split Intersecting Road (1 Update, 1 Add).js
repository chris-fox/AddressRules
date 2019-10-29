// This rule will create a new unique id when a road is created and splits any intersecting roads
// All intersecting roads will be split at their intersection and the address ranges will be updated to reflect where the split occured.

// This function calculates a new from and to address based on the percentage along the line the split occurs
function newToFrom(from, to, percent) {
    if (from == null || to == null) return [null, null];
    
    var range = Abs(to - from);
    if (range < 2) return [from, to];
    
    var val = percent * range;
    var newVal = 0;
    
    if ((Floor(val) % 2) == 0) newVal = Floor(val);
    else if ((Ceil(val) % 2) == 0) newVal = Ceil(val);
    else newVal = Floor(val) - 1;
    
    if (newVal == range) newVal -= 2;
    
    if (from > to) return [from - newVal, from - newVal - 2];
    else return [from + newVal, from + newVal + 2];
}

// If the id of the road is not null return the id
// This prevents the rule from being processed on new roads created as a result of the split
if ($feature.centerlineid != null) return $feature.centerlineid;

// Create a new id for the road and get the object id and geometry from the road
var id = "RD-" + NextSequenceValue("CenterlineID");
var oid = $feature.OBJECTID;
var geom = Geometry($feature);

// Get all the intersecting roads
var intersectingRoads = Intersects(FeatureSetByName($datastore, "RoadCenterline"), geom);
var adds = [];
var updates = [];
var nameAliasAdds = [];

// Loop through each intersecting road
for (var road in intersectingRoads) {
	// Continue to the next road if the intersecting road is the same or geometry is the same
    if (oid == road.OBJECTID || Equals(geom, road)) continue;
    
	// Cut the intersecting road and continue if the result of the cut is 0 features
    var newRoads = Cut(road, geom);
    if (Count(newRoads) == 0) continue;
    
    var validCut = true;
    var geometries = []
    
	// Loop through collection of lines and check that it was a valid cut in the middle of a segment
    for (var i in newRoads) {
        if (newRoads[i] == null || Length(newRoads[i], 'feet') == 0) {
            validCut = false;
            continue;
        }
		
		// Handle multipart geometries
        var allParts  = MultiPartToSinglePart(newRoads[i]);
        for (var p in allParts )
        {
            geometries[Count(geometries)] = allParts[p];
        }
    }

	// Process the cut if valid
    if (validCut) {
		
		// Get the address range of the intersecting road
        var fromRight = road.fromright;
        var toRight = road.toright;
        var fromLeft = road.fromleft;
        var toLeft = road.toleft;
    
        var firstGeometry = null;
        var secondGeomArray = [];    
        var firstPoint = Geometry(road).paths[0][0];
        
		// Loop through each geometry in the cut
		// Store the geometry including the first vertex of the orginal road as the first geometry
		// Collect all other geometries in an array
        for (var i in geometries) {
            if (Equals(firstPoint, geometries[i].paths[0][0])) {
                firstGeometry = geometries[i];
            }
            else {
                secondGeomArray[Count(secondGeomArray)] = geometries[i];
            }
        }
        
		// Merge all other geometries as the second geometry
        var secondGeometry = Union(secondGeomArray);
		
		// Calculate the new address ranges based on the intersection location along the line
        var geometryPercent = Length(firstGeometry, 'feet') / (Length(firstGeometry, 'feet') + Length(secondGeometry, 'feet'));
        var newToFromLeft = newToFrom(fromLeft, toLeft, geometryPercent)
        var newToFromRight = newToFrom(fromRight, toRight, geometryPercent)
        
		// Store an update for the intersecting road with the first geometry from the cut and the new right to and left to value 
        updates[Count(updates)] = {
            'objectID': road.OBJECTID,
            'attributes': {'toright' : newToFromRight[0], 'toleft' : newToFromLeft[0]},
            'geometry': firstGeometry
        }

		// Create a new id for a road
		// Store an add for a new road with the second geometry from the cut and the new right from and left from value 
        var newId = "RD-" + NextSequenceValue("CenterlineID");
        var featureAttributes = Dictionary(Text(road))['attributes'];
	var newAttributes = {};
	for(var k in featureAttributes) {
		if (IndexOf(["globalid", "objectid", "shape_length", "shape_area"], Lower(k)) > -1) {
			continue;
		}
		else if (Lower(k) == "fromright") {
			newAttributes['fromright'] = newToFromRight[1];
		}
		else if (Lower(k) == "fromleft") {
			newAttributes['fromleft'] = newToFromLeft[1];
		}
		else {
			newAttributes[k] = featureAttributes[k];
		}
	}
        adds[Count(adds)] = {
             'attributes': newAttributes,
             'geometry': secondGeometry
        }
        
		// Find the all the related road alias names for the intersecting road
		// Store an add for every road alias and related it to the new road that was added after the cut
        var roadNameAliases = Filter(FeatureSetByName($datastore, "AliasStreetName"), "centerlineid = '" + road.centerlineid + "'");
        for (var roadNameAlias in roadNameAliases) {
            nameAliasAdds[Count(nameAliasAdds)] = {
                'attributes': {'centerlineid' : newId, 'roadpredir' : roadNameAlias.roadpredir, 'roadname' : roadNameAlias.roadname, 'roadtype' : roadNameAlias.roadtype,}
            }
        }
    }
}

// Return the new id of the road
// Using the edit parameter return the list of updates and adds for the intersecting roads and a list of adds for related road alias names
return { 
    'result' : id,
    'edit' : [{'className': 'RoadCenterline', 'adds' : adds, 'updates' : updates}, 
              {'className': 'AliasStreetName', 'adds': nameAliasAdds}] 
    };
