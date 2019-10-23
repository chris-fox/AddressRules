// This will calculate the full address for a site address point by concatenating several other field values 

// Specify the fields to concatenate
var fulladdr = null;
var addressValues = [$feature.PREADDRNUM,$feature.ADDRNUM,$feature.ADDRNUMSUF,$feature.FULLNAME,$feature.UNITTYPE,$feature.UNITID,$feature.ALTUNITTYPE,$feature.ALTUNITID];

// Loop through the field values and test if test if they are null or empty strings
// If they are not null or empty add them to an array
var concatValues = []
for(var i in addressValues) {
  var value = addressValues[i];
  if (value == "" || value == null) continue;
  concatValues[Count(concatValues)] = value
}

// Return the field values concatenated with a space between
return Concatenate(concatValues, " ");