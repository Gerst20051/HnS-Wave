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

define('MYSQL_TABLE_BIRTHDAYS','birthdays');
define('MYSQL_TABLE_TIMEZONES','timezones');
define('MYSQL_TABLE_USERS','users');
