<?php
if (LOCAL) {
	define('MYSQL_HOST','localhost');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','websnapchat');
} else {
	define('MYSQL_HOST','mysql16.000webhost.com');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','a4253500_hnswave');
}

define('MYSQL_TABLE_USERS','users_snapchat');
define('MYSQL_TABLE_SNAPS','snaps');
define('MYSQL_TABLE_MESSAGES','messages');
define('MYSQL_ALL_USERS','uid, email, username, firstname, lastname, last_login, date_joined, logins, image, friends');
?>