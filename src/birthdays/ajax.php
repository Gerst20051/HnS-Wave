<?php
session_start();

require_once 'config.inc.php';
require_once 'functions.inc.php';
require_once 'mysql.class.php';

switch ($_SERVER['REQUEST_METHOD']) {
	case 'POST': $_REQ = $_POST; break;
	case 'GET': $_REQ = $_GET; break;
	default: $_REQ = $_GET; break;
}

setglobal($_REQ);

switch ($_SERVER['REQUEST_METHOD']) {
case 'POST':

if ($ACTION == 'login') {
	require_once 'encryption.inc.php';
	$VARS = array_map('varcheck', $FORM);
	if ($VARS['formname'] != 'login') print_json(array('logged'=>false));
	else unset($VARS['formname']);
	if (!validateinput($VARS, array('email', 'password'))) print_json(array('logged'=>false));
	extract($VARS);
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT salt FROM %s WHERE email = "%s" LIMIT 1', MYSQL_TABLE_USERS, $email));
		if ($db->numRows()) {
			$result = $db->fetchAssocRow();
			$salt = $result['salt'];
			$secure_password = pbkdf2($password, $salt);
			$db->sfquery(array('SELECT * FROM %s WHERE email = "%s" AND pass = "%s" LIMIT 1', MYSQL_TABLE_USERS, $email, $secure_password));
			if ($db->numRows()) {
				$row = $db->fetchAssocRow();
				$_SESSION['logged'] = true;
				$_SESSION['user_id'] = $row['id'];
				$_SESSION['email'] = $row['email'];
				$_SESSION['fullname'] = $row['firstname'] . ' ' . $row['lastname'];
				$_SESSION['firstname'] = $row['firstname'];
				$_SESSION['lastname'] = $row['lastname'];
				$_SESSION['access_level'] = $row['access_level'];
				$_SESSION['last_login'] = $row['last_login'];
				$db->sfquery(array('UPDATE %s SET last_login = "%s", logins = logins + 1 WHERE uid = "%s"', MYSQL_TABLE_USERS, time(), $_SESSION['user_id']));
				print_json(array('logged'=>true));
			} else print_json(array('logged'=>false));
		} else print_json(array('logged'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'register') {
	require_once 'encryption.inc.php';
	$VARS = array_map('varcheck', $FORM);
	if ($VARS['formname'] != 'register') print_json(array('registered'=>false));
	else unset($VARS['formname']);
	$required = array('name', 'email', 'password', 'timezone');
	if (!validateinput($VARS, $required)) print_json(array('registered'=>false));
	extract($VARS);
	list($firstname, $lastname) = split(' ', ucname($name));
	$salt = genSalt();
	$secure_password = pbkdf2($password, $salt);
	$verification_key = genVerificationKey();
	$timestamp = time();
	try {
		$db = new MySQL();
		$db->insert(MYSQL_TABLE_USERS, array(
			'email'=>$email,
			'pass'=>$secure_password,
			'salt'=>$salt,
			'verification_key'=>$verification_key,
			'username'=>$username,
			'firstname'=>$firstname,
			'lastname'=>$lastname,
			'last_login'=>$timestamp,
			'date_joined'=>$timestamp
		));
		if ($db->affectedRows()) {
			print_json(array('registered'=>true));
		} else print_json(array('registered'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'logout') {
	logout();
	print_json(array('logged'=>false));
} elseif ($ACTION == 'verify') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT COUNT(*) FROM %s WHERE verification_key = "%s"', MYSQL_TABLE_USERS, ));
		if ($db->numRows()) {
			$data = $db->fetchParsedRows();
			print_json(array('timezones'=>$data));
		} else print_json(array('timezones'=>array()));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
}

break;
case 'GET':

if ($ACTION == 'logged') {
	if (isset($_SESSION['logged'])) print_json(array('logged'=>true));
	else print_json(array('logged'=>false));
} elseif ($ACTION == 'checkemail' && check($EMAIL)) {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT email FROM %s WHERE email = "%s" LIMIT 1', MYSQL_TABLE_USERS, $EMAIL));
		if ($db->numRows()) print_json(array('email'=>true));
		else print_json(array('email'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'userdata') {
	try {
		$db = new MySQL();
		$db->sfquery(array(
			'SELECT %s
				FROM %s u
				LEFT JOIN %s tz ON tz.id = u.timezone_id
				WHERE u.id = "%s"
				LIMIT 1
			',
			'
				u.id,
				u.email,
				CONCAT(u.firstname, " ", u.lastname) as fullname,
				tz.timezone_location as timezone
			',
			MYSQL_TABLE_USERS,
			MYSQL_TABLE_TIMEZONES,
			$UID
		));
		if ($db->numRows()) {
			$data = $db->fetchParsedRow();
			print_json(array('user'=>$data));
		} else print_json(array('user'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'timezones') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT * FROM %s', MYSQL_TABLE_TIMEZONES));
		if ($db->numRows()) {
			$data = $db->fetchParsedRows();
			print_json(array('timezones'=>$data));
		} else print_json(array('timezones'=>array()));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
}

break;
}

exit();
?>
