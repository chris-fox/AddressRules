// This rule will calculate the full road name for the steet alias table by concatenating several other field values 

// Specify the fields to concatenate
var fullname = null;
var roadValues = [$feature.roadpredir, $feature.roadname, $feature.roadtype];

// Loop through the field values and test if test if they are null or empty strings
// If they are not null or empty add them to an array
var concatValues = []
for(var i in roadValues) {
  var value = roadValues[i];
  if (value == "" || value == null) continue;
  concatValues[Count(concatValues)] = value
}

// Return the field values concatenated with a space between
return Concatenate(concatValues, " ");