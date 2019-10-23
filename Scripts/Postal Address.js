// This rule will updated the postal address when a new postal address record is added from the related site address point

// Get the site address id. If it is null return null
var siteAddressID = $feature.siteaddid;
if (siteAddressID == null) return;

// Find the first related site address point and return its full address
var siteAddresses = Filter(FeatureSetByName($datastore, "SiteAddressPoint"), "siteaddid = '" + siteAddressID + "'");
for (var siteAddress in siteAddresses) {
	return siteAddress.fulladdr;
}