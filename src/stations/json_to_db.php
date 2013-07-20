<?php
header("Pragma: no-cache");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

$updatedatabase = false;
$json = json_decode(file_get_contents('playlist.json'), true);
$json = $json['data'];

$artists = array();

foreach ($json as $key=>$v) {
	$item = $json[$key];
	$artist = $item['artist'];
	unset($item['artist']);
	$artists[$artist][] = $item;
}

/*
foreach ($json as $key=>$v) {
	$item = $json[$key];
	foreach ($item as $attr=>$value) {
		$row = $item;

		//echo $value;
		//echo "<br/>";
		//echo $item[$track];
	}
	/*
	echo $item['id'];
	echo $item['artist'];
	echo $item['track'];
	echo $item['img'];
	echo $item['duration'];
	*
}
*/

if ($updatedatabase === true) {
	require_once 'mysql.class.php';

	$artistnames = array_keys($artists);



	echo "database updated";
}
