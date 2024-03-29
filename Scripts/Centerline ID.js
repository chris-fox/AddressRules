//Define the leading text, the trailing text and the delimiter for the ID
prefix = "RD"
join_char = "-"

//Ensure the ID is not already set, if it is, return the original id
if (IsEmpty($feature.assetid)) {
   // If you do not want to use a prefix, or suffix, remove it from the list
   return Concatenate([prefix, NextSequenceValue("CenterlineID")], join_char)
}
else {
   return $feature.assetid
}