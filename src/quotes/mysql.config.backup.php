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

define('MYSQL_TABLE','quotes');
define('MYSQL_TABLE_USERS','users');
define('MYSQL_ALL_USERS','uid, email, username, firstname, lastname, access_level, last_login, date_joined, logins');
?>
