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

if (isset($_SESSION['uid']) && !empty($_SESSION['uid'])) $UID = (int)$_SESSION['uid'];

switch ($_SERVER['REQUEST_METHOD']) {
case 'POST':
if ($ACTION == 'login') {
	require_once 'encryption.inc.php';
	$VARS = array_map('varcheck',$FORM);
	if ($VARS['formname'] != 'login') print_json(array('logged'=>false));
	else unset($VARS['formname']);
	if (!validateinput($VARS,array('email','password'))) print_json(array('logged'=>false));
	extract($VARS);
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT salt FROM `%s` WHERE email = "%s" LIMIT 1',MYSQL_TABLE_USERS,$email));
		if ($db->numRows()) {
			$result = $db->fetchAssocRow();
			$salt = $result['salt'];
			$secure_password = pbkdf2($password,$salt);
			$db->sfquery(array('SELECT * FROM `%s` WHERE email = "%s" AND pass = "%s" LIMIT 1',MYSQL_TABLE_USERS,$email,$secure_password));
			if ($db->numRows()) {
				$row = $db->fetchAssocRow();
				$_SESSION['logged'] = true;
				$_SESSION['uid'] = $row['uid'];
				$_SESSION['email'] = $row['email'];
				$_SESSION['username'] = $row['username'];
				$_SESSION['fullname'] = $row['firstname'] . ' ' . $row['lastname'];
				$_SESSION['firstname'] = $row['firstname'];
				$_SESSION['lastname'] = $row['lastname'];
				$_SESSION['access_level'] = $row['access_level'];
				$_SESSION['last_login'] = $row['last_login'];
				$db->sfquery(array('UPDATE `%s` SET last_login = "%s", logins = logins+1 WHERE uid = "%s"',MYSQL_TABLE_USERS,time(),$_SESSION['uid']));
				print_json(array('logged'=>true));
			} else print_json(array('logged'=>false));
		} else print_json(array('logged'=>false));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'register') {
	require_once 'encryption.inc.php';
	$VARS = array_map('varcheck',$FORM);
	if ($VARS['formname'] != 'register') print_json(array('registered'=>false));
	else unset($VARS['formname']);
	$required = array('name','email','password','username');
	if (!validateinput($VARS,$required)) print_json(array('registered'=>false));
	extract($VARS);
	list($firstname, $lastname) = split(' ',ucname($name));
	$salt = genSalt();
	$secure_password = pbkdf2($password,$salt);
	$timestamp = time();
	try {
		$db = new MySQL();
		$db->insert(MYSQL_TABLE_USERS, array(
			'email'=>$email,
			'pass'=>$secure_password,
			'salt'=>$salt,
			'username'=>$username,
			'firstname'=>$firstname,
			'lastname'=>$lastname,
			'access_level'=>1,
			'last_login'=>$timestamp,
			'date_joined'=>$timestamp,
			'logins'=>1
		));
		if ($db->affectedRows()) {
			$uid = $db->insertID();
			$_SESSION['logged'] = true;
			$_SESSION['uid'] = $uid;
			$_SESSION['email'] = $email;
			$_SESSION['username'] = $username;
			$_SESSION['fullname'] = $firstname . ' ' . $lastname;
			$_SESSION['firstname'] = $firstname;
			$_SESSION['lastname'] = $lastname;
			$_SESSION['access_level'] = 1;
			$_SESSION['last_login'] = $timestamp;
			print_json(array('registered'=>true));
		} else print_json(array('registered'=>false));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'logout') {
	logout();
	print_json(array('logged'=>false));
}

if (isset($_POST['pid']) && !empty($_POST['pid'])) $PID = (int)$_POST['pid'];
if (isset($_POST['quote']) && !empty($_POST['quote'])) $QUOTE = $_POST['quote'];
if (isset($_POST['timestamp']) && !empty($_POST['timestamp'])) $TIMESTAMP = (int)$_POST['timestamp'];
if (isset($_REQUEST['type']) && !empty($_REQUEST['type'])) $TYPE = $_REQUEST['type'];

if (!empty($UID) && !empty($PID) && !empty($TYPE)) {
	$type = (int)$TYPE;
	try {
		$db = new MySQL();
		$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE id = "'.$PID.'"');
		if ($type === 1) {
			if (!empty($QUOTE) && !empty($TIMESTAMP)) {
				$quote = json_encode($QUOTE);
				if ($db->numRows()) {
					$db->sfquery(array('UPDATE `%s` SET quote = "%s" WHERE id = "%s"',MYSQL_TABLE,$quote,$PID));
				} else {
					$db->insert(MYSQL_TABLE, array(
						'owner_id'=>$UID,
						'quote'=>$quote,
						'timestamp'=>$TIMESTAMP
					));
				}
				if ($db->affectedRows()) {
					die('1');
				} else die('0');
			}
		} elseif ($type === 2) {
			if ($db->numRows()) {
				// check to make sure the current user UID is the owner of the post to be deleted PID
				$db->query('DELETE FROM `'.MYSQL_TABLE.'` WHERE id = "'.$PID.'"');
				if ($db->affectedRows()) {
					die('1');
				} else die('0');
			} else die('0');
		} elseif ($type === 3) {

		}
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} else if (!empty($UID) && !empty($TYPE)) {
	$type = (int)$TYPE;
	try {
		$db = new MySQL();
		if ($type === 3) {
			if (!empty($QUOTE) && !empty($TIMESTAMP)) {
				$quote = json_encode($QUOTE);
				$db->insert(MYSQL_TABLE, array(
					'owner_id'=>$UID,
					'quote'=>$quote,
					'timestamp'=>$TIMESTAMP
				));
				if ($db->affectedRows()) {
					$insertID = $db->insertID();
					$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE id = '.$insertID);
					if ($db->numRows()) {
						$row = $db->fetchParsedRow();
						$row["quote"] = json_decode($row["quote"]);
						$row["quote"]->name = htmlentities($row["quote"]->name, ENT_QUOTES, "UTF-8");
						$row["quote"]->quote = htmlentities($row["quote"]->quote, ENT_QUOTES, "UTF-8");
						print_json($row);
					} else die('0');
				} else die('0');
			}
		}
	} catch(Exception $e) {
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
		$db->sfquery(array('SELECT email FROM `%s` WHERE email = "%s" LIMIT 1',MYSQL_TABLE_USERS,$EMAIL));
		if ($db->numRows()) print_json(array('email'=>true));
		else print_json(array('email'=>false));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'userdata') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT %s FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_ALL_USERS,MYSQL_TABLE_USERS,$UID));
		if ($db->numRows()) {
			$data = $db->fetchParsedRow();
			print_json(array('user'=>$data));
		} else print_json(array('user'=>false));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
}

if (isset($_POST['id']) && !empty($_POST['id'])) $PID = (int)$_POST['id'];
if (isset($_POST['quote']) && !empty($_POST['quote'])) $QUOTE = $_POST['quote'];
if (isset($_POST['timestamp']) && !empty($_POST['timestamp'])) $TIMESTAMP = (int)$_POST['timestamp'];
if (isset($_REQUEST['type']) && !empty($_REQUEST['type'])) $TYPE = $_REQUEST['type'];

if (isset($_GET['id']) && !empty($_GET['id'])) {
	$ID = (int)$_GET['id'];
	try {
		$db = new MySQL();
		$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE owner_id = "'.$ID.'"');
		$rows = $db->fetchParsedRows();
		for ($i=0;$i<count($rows);$i++) {
			$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
		}
		if ($db->numRows()) {
			print_json(array_reverse($rows));
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif (isset($_GET['q']) && !empty($_GET['q'])) {
	$ID = (int)$_GET['q'];
	try {
		$db = new MySQL();
		$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE id = '.$ID);
		$row = $db->fetchParsedRow();
		if ($db->numRows()) {
			$row["quote"] = json_decode($row["quote"]);
			$owner_id = $row["owner_id"];
			$db->sfquery(array('SELECT firstname, lastname FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_TABLE_USERS,$owner_id));
			$userrow = $db->fetchParsedRow();
			$row["owner_name"] = $userrow["firstname"] . " " . $userrow["lastname"];
			print_json(array($row));
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
}  elseif (!empty($TYPE)) {
	if ($TYPE == 'global') {
		try {
			$db = new MySQL();
			//$rows = $db->fetchParsedAll(MYSQL_TABLE);
			$db->query('SELECT * FROM '.MYSQL_TABLE);
			$rows = $db->fetchParsedRows();
			if ($db->numRows()) {
				for ($i=0;$i<count($rows);$i++) {
					$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
					$owner_id = $rows[$i]["owner_id"];
					$db->sfquery(array('SELECT firstname, lastname FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_TABLE_USERS,$owner_id));
					$row = $db->fetchParsedRow();
					$rows[$i]["owner_name"] = $row["firstname"] . " " . $row["lastname"];
				}
				print_json(array_reverse($rows));
			} else die('0');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
	} elseif ($TYPE == 'user') {
		try {
			$db = new MySQL();
			$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE owner_id = "'.$UID.'"');
			$rows = $db->fetchParsedRows();
			for ($i=0;$i<count($rows);$i++) {
				$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
				$rows[$i]["quote"]->name = htmlentities($rows[$i]["quote"]->name, ENT_QUOTES, "UTF-8");
				$rows[$i]["quote"]->quote = htmlentities($rows[$i]["quote"]->quote, ENT_QUOTES, "UTF-8");
			}
			if ($db->numRows()) {
				print_json(array_reverse($rows));
			} else die('0');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
	}
}


break;
}

exit();
?>