Parse National Hurricane Centers Atlantic RSS feed and return KMZ links for Active Storms

Author: Eric Bridger ebridger@gmri.org  eric.bridger@gmail.com

Date:    Aug. 2012
Updated: Jul. 2014
(At some point NHC changed the content of the index-at.xml RSS file.  KMZ are no longer included. It seems they were moved the GIS RSS feed located at http://www.nhc.noaa.gov/gis-at.xml The RSS parse was rewritten to retain the original functionality)

Describption:
Use jQuery and jFeed plugin to parse National Hurricane Center's Active Atlantic Storms RSS feed and turn them into useful objects.  In particular the KMZ links for display in Google Maps, Google Earth or OpenLayers.

Requires:  jQuery >= 1.6

Tested with:  jQuery 1.7.1 http://code.jquery.com/jquery-1.7.1.min.js

Links:

*  NHC GIS RSS: http://www.nhc.noaa.gov/gis-at.xml
*  jFeed Plugin: http://hovinne.com/articles/jfeed-jquery-rss-atom-feed-parser-plugin
*  jQuery: http://jquery.com

Returns array of JSON objects.  E.g.

    storm_num: 14
    storm_name: NADINE
    storm_label: Tropical Storm
    adv_num: 4
    title: Tropical Storm NADINE Advisory GIS Forecast Track (.kmz)
    link: http://www.nhc.noaa.gov/storm_graphics/AT14/AL1412_TRACK_latest.kmz
    updated: Wed, 12 Sep 2012 08:45:03 GMT
    storm_year: 2012
    type: TRACK

Possible types: TRACK, CONE, WATCH, BEST_TRACK

Note:
 In 2016 season the NHC had changed the numbering of their latest feeds. Best track requires '2016' forecasts just '16'
