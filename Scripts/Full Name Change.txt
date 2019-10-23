// This rule will update the full road name of any site addresses or roads when the road name changes in the master street name table

// Get the current road name and the road name prior to the edit
var fullname = $feature.fullname;
var origFullName = $originalFeature.fullname;

// If the name is unchanged return the current road name;
if (origFullName == fullname) return fullname;

// Find all site addresses that have the same road name as road name prior to the edit
// Add each matching site address to an array storing the object id and updated road name
var siteAddressUpdates = []
var siteAddresses = Filter(FeatureSetByName($datastore, "SiteAddressPoint"), "fullname = '" + origFullName + "'");
for (var siteAddress in siteAddresses) {
	siteAddressUpdates[Count(siteAddressUpdates)] = {
		'objectID': siteAddress.OBJECTID,
		'attributes': {'fullname' : fullname}
	}
}

// Find all roads that have the same road name as road name prior to the edit
// Add each road to an array storing the object id and updated road name
var centerlineUpdates = []
var centerlines = Filter(FeatureSetByName($datastore, "RoadCenterline"), "fullname = '" + origFullName + "'");
for (var centerline in centerlines) {
	centerlineUpdates[Count(centerlineUpdates)] = {
		'objectID': centerline.OBJECTID,
		'attributes': {'fullname' : fullname}
	}
}

// Return the road name in the result parameter
// Using the edit parameter return the list of updates for the site address points and roads
return {
		'result' : fullname,
		'edit' : [
				{'className': 'SiteAddressPoint', 'updates' : siteAddressUpdates},
				{'className': 'RoadCenterline', 'updates' : centerlineUpdates}
			]
		};