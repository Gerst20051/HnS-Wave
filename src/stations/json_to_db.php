<?php
header("Pragma: no-cache");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

$createtables = false;
$updatetables = false;
$json = json_decode(file_get_contents('playlist.json'), true);
$json = $json['data'];

$artists = array();

foreach ($json as $key=>$v) {
	$item = $json[$key];
	$newitem = array();
	$newitem['id'] = 0;
	$newitem['videoid'] = $item['id'];
	$newitem['title'] = $item['track'];
	$newitem['img'] = $item['img'];
	$newitem['duration'] = $item['duration'];
	$artists[$item['artist']][] = $newitem;
}

if ($createtables === true) {
	require_once 'mysql.class.php';

	$db = new MySQL;
	$artistnames = array_keys($artists);
	$newartistnames = array();

	foreach ($artistnames as $artistname) {
		$names[] = array('id'=>0,'name'=>$artistname,'tracks'=>array());
		$newartistnames[$artistname] = array('id'=>0,'tracks'=>array());
	}

	// insert artists
	//// keep reference of artistid
	foreach ($names as $name) {
		$db->insert(MYSQL_TABLE_ARTISTS, array(
			'name'=>$name['name'],
			'tracks'=>json_encode($name['tracks'])
		));
		$newartistnames[$name['name']]['id'] = $db->insertID();
	}

	// insert tracks
	foreach ($artists as $name => $tracks) {
		foreach ($tracks as $key => $track) {
			$db->insert(MYSQL_TABLE_TRACKS, array(
				'artistid'=>$newartistnames[$name]['id'],
				'videoid'=>$track['videoid'],
				'title'=>$track['title'],
				'img'=>$track['img'],
				'duration'=>$track['duration']
			));
			$newartistnames[$name]['tracks'][] = $db->insertID();
		}
	}

	// update artists with tracks. (array of tracks ids)
	foreach ($names as $name) {
		$tracksjson = json_encode($newartistnames[$name['name']]['tracks']);
		$db->sfquery(array(
			'UPDATE `%s`
				SET tracks = "%s"
					WHERE id = "%s"',
			MYSQL_TABLE_ARTISTS,
			$tracksjson,
			$newartistnames[$name['name']]['id']
		));
	}

	echo 'tables created';
}

if ($updatetables === true) {
	// merge updates with old data
	echo 'tables updated';
}
?>
