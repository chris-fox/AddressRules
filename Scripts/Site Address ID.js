// This rule will create a new unique id when a site address point is created

//Define the leading text, the trailing text and the delimiter for the ID
prefix = "SID"
join_char = "-"

//Ensure the ID is not already set, if it is, return the original id
if (IsEmpty($feature.assetid)) {
   // If you do not want to use a prefix, or suffix, remove it from the list
   return Concatenate([prefix, NextSequenceValue("SiteAddressID")], join_char)
}
else {
   return $feature.assetid
}
return "SID-" + NextSequenceValue("SiteAddressID");