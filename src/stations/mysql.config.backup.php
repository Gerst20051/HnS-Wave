<?php
require_once 'config.inc.php';

if (LOCAL) {
	define('MYSQL_HOST','');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','');
} else {
	define('MYSQL_HOST','');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','');
}

define('MYSQL_TABLE_USERS','station_users');
define('MYSQL_TABLE_ARTISTS','station_artists');
define('MYSQL_TABLE_TRACKS','station_tracks');
?>
