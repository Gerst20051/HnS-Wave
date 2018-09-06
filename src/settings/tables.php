<html>
<head>
<title>Displaying MySQL Tables</title>
</head>
<body>
<?php
$url = parse_url(getenv("CLEARDB_DATABASE_URL"));
$server = $url["host"];
$username = $url["user"];
$password = $url["pass"];
$db = substr($url["path"],1);

$global_dbh = mysql_connect($server, $username, $password) or die("Could not connect to database");
mysql_select_db($db, $global_dbh) or die("Could not select database");

function display_db_query($query_string, $connection, $header_bool, $table_params){
	$result_id = mysql_query($query_string, $connection) or die("display_db_query:" . mysql_error());
	$column_count = mysql_num_fields($result_id) or die("display_db_query:" . mysql_error());
	echo "<table $table_params>\n";
	if ($header_bool) {
		echo "<tr>";
		for ($column_num = 0; $column_num < $column_count; $column_num++) {
			$field_name = mysql_field_name($result_id, $column_num);
			echo "<th>$field_name</th>";
		}
		echo "</tr>\n";
	}
	while ($row = mysql_fetch_row($result_id)) {
		echo "<tr align='left' valign='top'>";
		for ($column_num = 0; $column_num < $column_count; $column_num++) {
			echo "<td>$row[$column_num]</td>\n";
		}
		echo "</tr>\n";
	}
	echo "</table>\n"; 
}

function display_db_table($tablename, $connection, $header_bool, $table_params){
	$query_string = "SELECT * FROM $tablename";
	echo "<h1>$tablename</h1>";
	display_db_query($query_string, $connection, $header_bool, $table_params);
}

$result = mysql_query("SHOW TABLES FROM `$db`");
if (mysql_num_rows($result)) {
	while ($row = mysql_fetch_row($result)) {
		$table = "{$row[0]}";
		display_db_table($table, $global_dbh, TRUE, "border='2'");
	}
}
?>
</body>
</html>
