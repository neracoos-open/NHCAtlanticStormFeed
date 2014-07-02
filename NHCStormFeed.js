///////////////////////
// Author: Eric Bridger ebridger@gmri.org  eric.bridger@gmail.com
// Date:    Aug. 2012
// Updated: Jul. 2014 - Version 2.0
// Describption: Use jQuery and jFeed plugin to parse National Hurricane Center's Active Atlantic Storms RSS feed.
// and turn them into useful objects.  In particular the KMZ links for display in Google Maps or OpenLayers.
// Requires:  jQuery >= 1.6
// Tested with:  jQuery 1.7.1 http://code.jquery.com/jquery-1.7.1.min.js
// Links:
//  Jul. 2014 NHC changed their RSS feeds. http://www.nhc.noaa.gov/index-at.xml no longer has KMZ links.
//  Based on the GIS RSS feed. http://www.nhc.noaa.gov/gis-at.xml no longer has KMZ links.
//  jFeed Plugin: http://hovinne.com/articles/jfeed-jquery-rss-atom-feed-parser-plugin
//  jQuery: http://jquery.com
//////////////////////////
var link_type = '';
var nhc_results = [];
var callBackFunction = null;

function getNHCFeed(nhc_url, wanted_type, onReceivedCallback){
    link_type = wanted_type;
    callBackFunction = null;
    if(onReceivedCallback){
      callBackFunction = onReceivedCallback;
    }

    jQuery.getFeed({
        url: nhc_url,
        success: filterNHCFeed
    });
}

////////////////////////
// filterNHCFeed()
//   jFeed has already parsed the RSS but we only want certain links and info such as storm name, storm number.
//   This is done via regular expressions.
//   An array of one item per kmz link is put into global nhc_results[]
////////////////////////
function filterNHCFeed(feed){

  // clear out results
  nhc_results = [];
  var this_re = '';
  if(link_type === 'KMZ'){
    this_re = new RegExp(/\[kmz\]/);
  }else{
    this_re = '';
  }

  var n = []; // for regEx.exec() captures
  var cur_storm_num = '';
  var cur_storm_name = '';
  var cur_storm_year = '';
  var cur_storm_label = '';
  var cur_adv_num = '';
  for(var i = 0; i < feed.items.length && i < feed.items.length; i++) {
    var item = feed.items[i];
    var ret_item = new Object();
    if(! item.title.match(/Advisory|Best Track/) ) {
      continue;
    }
    // Skip non KMZ items. The gis-at.xml has all the meta data in the Advisory title,
    // No longer a need to check other titles or links
    if(this_re && !item.title.match(this_re) ) {
      continue;
    }

    // KMZ Advisory title e.g. from 2014 
    // <title>Advisory #003A Forecast Track [kmz] - Tropical Storm ARTHUR (AT1/AL012014)</title>
    if(item.title.match(/Advisory/) ) {
      // Get 5 metadata items: 
      // Need g.exec() to get the captured elements n[1] ...  n[0] has the full string
      // See item.title example above: cur_adv_num, cur_storm_label, cur_storm_name, cur_storm_num, cur_storm_year
      // RegEx: Start with Advisory, # 3 number, with optional A then after dash - label, capital name, then number and year.
      n = /^Advisory #(\d{3}\w{0,1}) .* - (.+) ([A-Z]+) \(AT1\/AL(\d{2})(\d{4}.*)\)$/g.exec(item.title);
      if(n && n.length === 6){
        cur_adv_num = n[1];
        cur_storm_label = n[2];
        cur_storm_name = n[3];
        cur_storm_num = n[4];
        cur_storm_year = n[5];
      }
    }

    // Get storm_num from KMZ TRACK_latest link
    // But reuse it for non TRACK links, this may only be working because the TRACK_latest comes first
    if(item.link.match(/TRACK_latest/) ) {
      n = /AT(\d\d)/g.exec(item.link);
      if(n){
        cur_storm_num = n[1];
      }
    }

    ret_item.storm_num = cur_storm_num;
    ret_item.storm_name = cur_storm_name;
    ret_item.storm_label = cur_storm_label;
    ret_item.adv_num = cur_adv_num;
    ret_item.title = item.title;
    ret_item.link = item.link;
    ret_item.updated = item.updated;
    ret_item.storm_year = new Date(item.updated).getFullYear();

    // Classify KMZ type there are possibly 4

    if(item.link.match(/CONE/) ){
      ret_item.type = 'CONE';
    }
    if(item.link.match(/TRACK/i) ){
      if(item.link.match(/BEST_TRACK/i) ){
        ret_item.type = 'BEST_TRACK';
      }else{
        ret_item.type = 'TRACK';
      }
    }
    if(item.link.match(/WW/) ){
      ret_item.type = 'WATCH';
    }

    nhc_results.push(ret_item);
  } // end for feed.items

  // reset link_type
  link_type = '';
  if(callBackFunction){
    callBackFunction();
  }
  return;
}
//////////////////////////////////////
// NHC Storm Archive Links
//////////////////////////////////////
// return Best Track KMZ link for season (year) and storm_number
function getNHCBestTrackLink(nhc_season, nhc_number)
{ 
    var results = [];
    results.push( 'http://www.nhc.noaa.gov/gis/best_track/al' + nhc_number + nhc_season + '_best_track.kmz');
    return results;
}
// return the 3 NHC KMZ links for NHC season (year), storm number, advistory number
function getNHCForecastsLinks(nhc_season, nhc_number, nhc_adv)
{ 
    var results = [];
    var nhc_kml = 'http://www.nhc.noaa.gov/storm_graphics/api/AL' + nhc_number +  nhc_season + '_' + nhc_adv + 'adv_';
    // Forecast Track
    results.push(nhc_kml + 'TRACK.kmz');
    // Forecast Cone
    results.push(nhc_kml + 'CONE.kmz');
    // Forecast Watches
    results.push(nhc_kml + 'WW.kmz');
    return results;
  
}
