<?php
$url = parse_url(getenv("CLEARDB_DATABASE_URL"));
$server = $url["host"];
$username = $url["user"];
$password = $url["pass"];
$db = substr($url["path"],1);

echo getenv("CLEARDB_DATABASE_URL");

echo "<pre>";
print_r($url);
echo "</pre>";
echo "<p>/applications/xampp/xamppfiles/bin/mysql -u $username -p $db -h $server < ~/web/heroku/websnapchat/input.sql > ~/web/heroku/websnapchat/output.txt</p>\n";

$link = mysql_connect($server, $username, $password);

if (!$link) {
	echo "<p>Could not connect to the server '" . $server . "'</p>\n";
	echo mysql_error();
} else {
	echo "<p>Successfully connected to the server '" . $server . "'</p>\n";
	printf("<p>MySQL client info: %s</p>\n", mysql_get_client_info());
	printf("<p>MySQL host info: %s</p>\n", mysql_get_host_info());
	printf("<p>MySQL server version: %s</p>\n", mysql_get_server_info());
	printf("<p>MySQL protocol version: %s</p>\n", mysql_get_proto_info());
}

if ($link && !$db) {
	echo "<p>No database name was given. Available databases:</p>\n";
	$db_list = mysql_list_dbs($link);
	echo "<pre>\n";
	while ($row = mysql_fetch_array($db_list)) {
	     echo $row['Database'] . "\n";
	}
	echo "</pre>\n";
}

if ($db) {
	$dbcheck = mysql_select_db($db);
	if (!$dbcheck) {
		echo mysql_error();
	} else {
		echo "<p>Successfully connected to the database '" . $db . "'</p>\n";
		$sql = "SHOW TABLES FROM `$db`";
		$result = mysql_query($sql);
		if (mysql_num_rows($result)) {
			echo "<p>Available tables:</p>\n";
			echo "<pre>\n";
			while ($row = mysql_fetch_row($result)) {
				echo "{$row[0]}\n";
			}
			echo "</pre>\n";
		} else {
			echo "<p>The database '" . $db . "' contains no tables.</p>\n";
			echo mysql_error();
		}
	}
}

$CREATETABLES = false;

if ($CREATETABLES) {
	$query = 'CREATE TABLE IF NOT EXISTS `users` (
	  `uid` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `email` varchar(50) NOT NULL,
	  `pass` varchar(256) NOT NULL,
	  `salt` varchar(64) NOT NULL,
	  `username` varchar(50) NOT NULL,
	  `firstname` varchar(50) NOT NULL,
	  `lastname` varchar(50) NOT NULL,
	  `access_level` tinyint(1) NOT NULL,
	  `last_login` int(11) NOT NULL,
	  `date_joined` int(11) NOT NULL,
	  `logins` int(11) NOT NULL,
	  `image` text NOT NULL,
	  `friends` text NOT NULL,
	  PRIMARY KEY (`uid`),
	  UNIQUE KEY `username` (`username`)
	) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;';

	$result = mysql_query($query);
	if (!$result) {
		echo mysql_error() . "\n";
	}

	$query = 'CREATE TABLE IF NOT EXISTS `snaps` (
	  `id` int(11) NOT NULL AUTO_INCREMENT,
	  `oid` int(11) NOT NULL,
	  `type` tinyint(1) NOT NULL,
	  `data` mediumtext NOT NULL,
	  `timestamp` int(15) NOT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;';

	$result = mysql_query($query);
	if (!$result) {
		echo mysql_error() . "\n";
	}

	$query = 'CREATE TABLE IF NOT EXISTS `messages` (
	  `id` int(11) NOT NULL AUTO_INCREMENT,
	  `sid` int(11) NOT NULL,
	  `rid` int(11) NOT NULL,
	  `timelimit` int(2) NOT NULL,
	  `type` tinyint(1) NOT NULL,
	  `data` mediumtext NOT NULL,
	  `opened` tinyint(1) NOT NULL,
	  `sclear` tinyint(1) NOT NULL,
	  `rcelar` tinyint(1) NOT NULL,
	  `timestamp` int(15) NOT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;';

	$result = mysql_query($query);
	if (!$result) {
		echo mysql_error() . "\n";
	}

	echo "Tables have been created!\n";
}

$ALTERTABLES = false;

if ($ALTERTABLES) {
	/*
	$query = "ALTER TABLE users";

	$result = mysql_query($query);
	if (!$result) {
		echo mysql_error() . "\n";
	}

	mysql_query("INSERT INTO table (name, age) VALUES ('First Last', 19)") or die(mysql_error());
	*/

	echo "Tables have been altered!\n";
}
?>
