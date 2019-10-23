// This rule will calculate the full road name for the steet alias table by concatenating several other field values 

// Get the full name of the road. If it is null return the fullname
var fullname = $feature.fullname;
if (fullname == null) return fullname;

// Search the master street name table for a row matching the fullname.
// If there is no matching record raise an error preventing the edit
// Otherwise return the fullname
var masterStreetNames = Filter(FeatureSetByName($datastore, "MasterStreetName"), "fullname = '" + fullname + "'");
if (Count(masterStreetNames) == 0) {
	return {
		"errorMessage": "Full Road Name is invalid, must be defined in the Master Street Name table."
	}
}
return fullname;