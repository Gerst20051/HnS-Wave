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
		$db = new MySQL;
		$db->sfquery(array('SELECT salt FROM %s WHERE email = "%s" LIMIT 1', MYSQL_TABLE_USERS, $email));
		if ($db->numRows()) {
			$result = $db->fetchAssocRow();
			$salt = $result['salt'];
			$secure_password = pbkdf2($password, $salt);
			$db->sfquery(array('SELECT * FROM %s WHERE email = "%s" AND pass = "%s" AND verified = 1 LIMIT 1', MYSQL_TABLE_USERS, $email, $secure_password));
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
				$db->sfquery(array('UPDATE %s SET last_login = "%s", logins = logins + 1 WHERE id = "%s"', MYSQL_TABLE_USERS, time(), $_SESSION['user_id']));
				print_json(array('logged'=>true));
			} else print_json(array('logged'=>false, 'error'=>'Check Your Email For Activation Email!'));
		} else print_json(array('logged'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'register') {
	require_once 'encryption.inc.php';
	require_once 'email.class.php';
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
		$db = new MySQL;
		$db->insert(MYSQL_TABLE_USERS, array(
			'email'=>$email,
			'pass'=>$secure_password,
			'salt'=>$salt,
			'verification_key'=>$verification_key,
			'firstname'=>$firstname,
			'lastname'=>$lastname,
			'timezone_id'=>$timezone,
			'last_login'=>$timestamp,
			'date_joined'=>$timestamp
		));
		if ($db->affectedRows()) {
			try {
				$user_id = $db->insertID();
				if (LOCAL) {
					$activate_link = "http://localhost/git/hns-wave/src/birthdays/ajax.php?action=verify&user_id=$user_id&key=$verification_key";
				} else {
					$activate_link = "http://{$_SERVER['SERVER_NAME']}/birthdays/ajax.php?action=verify&user_id=$user_id&key=$verification_key";
				}
				$email = new EMAIL;
				$email->setToAddress($email);
				$email->setHeaders(
					'MIME-Version: 1.0' . "\r\n" .
					'Content-type: text/html; charset=iso-8859-1' . "\r\n"
				);
				$email->setMessage('
					<html>
					<head>
						<title>Birthday Reminder Account Activation</title>
					</head>
					<body>
						<h1>Birthday Reminder Account Activation</h1>
						<p>Here is your link to activate your account!</p>
						<p><a href="' . $activate_link . '">Activate My Account</a></p>
					</body>
					</html>
				');
			} catch (Exception $e) {
			}
			print_json(array('registered'=>true));
		} else print_json(array('registered'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'logout') {
	logout();
	print_json(array('logged'=>false));
}

break;
case 'GET':

if ($ACTION == 'logged') {
	if (isset($_SESSION['logged'])) print_json(array('logged'=>true));
	else print_json(array('logged'=>false));
} elseif ($ACTION == 'checkemail' && check($EMAIL)) {
	try {
		$db = new MySQL;
		$db->sfquery(array('SELECT email FROM %s WHERE email = "%s" LIMIT 1', MYSQL_TABLE_USERS, $EMAIL));
		if ($db->numRows()) print_json(array('email'=>true));
		else print_json(array('email'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'verify') {
	try {
		$db = new MySQL;
		$db->sfquery(array('SELECT verified FROM %s WHERE id = "%s" AND verification_key = "%s"', MYSQL_TABLE_USERS, $USER_ID, $KEY));
		if ($db->numRows()) {
			$row = $db->fetchParsedRow();
			if ($row['verified'] === 0) {
				$db->sfquery(array('UPDATE %s SET verified = 1 WHERE id = "%s"', MYSQL_TABLE_USERS, $USER_ID));
			}
			print_json(array('verified'=>true));
		} else print_json(array('verified'=>false));
	} catch (Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'userdata') {
	try {
		$db = new MySQL;
		$db->sfquery(array(
			"SELECT
					u.id,
					u.email,
					CONCAT(u.firstname, ' ', u.lastname) as fullname,
					tz.timezone_location as timezone
				FROM %s u
				LEFT JOIN %s tz ON tz.id = u.timezone_id
				WHERE u.id = '%s'
				LIMIT 1
			",
			MYSQL_TABLE_USERS,
			MYSQL_TABLE_TIMEZONES,
			$_SESSION['user_id']
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
		$db = new MySQL;
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
