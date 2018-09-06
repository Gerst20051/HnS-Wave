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
	$required = array('name','email','password','username','image');
	if (!validateinput($VARS,$required)) print_json(array('registered'=>false));
	extract($VARS);
	list($firstname, $lastname) = split(' ',ucname($name));
	$salt = genSalt();
	$secure_password = pbkdf2($password,$salt);
	$timestamp = time();
	$friends = json_encode(array());
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
			'logins'=>1,
			'image'=>$image,
			'friends'=>$friends
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
} elseif ($ACTION == 'addfriend') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT friends FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_TABLE_USERS,$UID));
		if ($db->numRows()) {
			$data = $db->fetchParsedRow();
			$data['friends'] = json_decode($data['friends']);
			if (in_array($ID, $data['friends'])) {
				removeValue($ID, $data['friends']);
				$db->sfquery(array('UPDATE `%s` SET friends = "%s" WHERE uid = "%s"',MYSQL_TABLE_USERS,json_encode($data['friends']),$UID));
				if ($db->affectedRows()) print_json(array('action'=>'removed'));
				else die('0');
			} else {
				array_push($data['friends'], (int) $ID);
				$db->sfquery(array('UPDATE `%s` SET friends = "%s" WHERE uid = "%s"',MYSQL_TABLE_USERS,json_encode($data['friends']),$UID));
				if ($db->affectedRows()) print_json(array('action'=>'added'));
				else die('0');
			}
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'createsnap') {
	$VARS = array_map('varcheck',$FORM);
	if ($VARS['formname'] != 'createsnapimage') die('0');
	else unset($VARS['formname']);
	$required = array('image','publish','friends');
	//if (!validateinput($VARS,$required)) die('0');
	extract($VARS);
	$timestamp = time();
	try {
		$db = new MySQL();
		for ($i = 0; $i < count($friends); $i++) {
			$db->query('INSERT INTO `'.MYSQL_TABLE_MESSAGES.'` (`sid`,`rid`,`timelimit`,`type`,`data`,`opened`,`sclear`,`rclear`,`timestamp`) VALUES ('.$UID.','.$friends[$i].',5,1,"'.$image.'",0,0,0,'.$timestamp.')');
		}
		if ($db->affectedRows()) {
			if ($publish == "true") {
				$db->insert(MYSQL_TABLE_SNAPS, array(
					'oid'=>$UID,
					'type'=>1,
					'data'=>$image,
					'timestamp'=>$timestamp
				));
			}
			print_json(array('action'=>'sent'));
		} else die('0');
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
			$data['friends'] = json_decode($data['friends']);
			print_json(array('user'=>$data));
		} else print_json(array('user'=>false));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'snapimage') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT data FROM `%s` WHERE id = "%s" AND sclear = 0 LIMIT 1',MYSQL_TABLE_MESSAGES,$ID));
		if ($db->numRows()) {
			$row = $db->fetchParsedRow();
			print_json($row);
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'home') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT id,sid,rid,timelimit,type,opened,timestamp FROM `%s` WHERE sid = "%s" OR rid = "%s" AND sclear = 0',MYSQL_TABLE_MESSAGES,$UID,$UID));
		if (!$db->numRows()) $messages = array();
		else $messages = $db->fetchParsedRows();
		foreach ($messages as $index => $message) {
			if ($message['sid'] == $UID) {
				$targetid = $message['rid'];
			} elseif ($message['rid'] == $UID) {
				$targetid = $message['sid'];
			}
			$db->sfquery(array('SELECT firstname,lastname,image FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_TABLE_USERS,$targetid));
			if ($db->numRows()) {
				$targetuser = $db->fetchParsedRow();
				$messages[$index]['tid'] = $targetid;
				$messages[$index]['name'] = $targetuser['firstname'] . ' ' . $targetuser['lastname'];
				$messages[$index]['image'] = $targetuser['image'];
			}
		}
		print_json(array_reverse($messages));
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'profile') {
	if (!empty($ID)) {
		try {
			$db = new MySQL();
			$db->sfquery(array('SELECT %s FROM `%s` WHERE uid = "%s" LIMIT 1',MYSQL_ALL_USERS,MYSQL_TABLE_USERS,$ID));
			if ($db->numRows()) {
				$user = $db->fetchParsedRow();
				$user['fullname'] = $user['firstname'] . ' ' . $user['lastname'];
				$user['friends'] = json_decode($user['friends']);
				$db->sfquery(array('SELECT * FROM `%s` WHERE oid = "%s" ORDER BY timestamp DESC LIMIT 20',MYSQL_TABLE_SNAPS,$ID));
				$snaps = $db->fetchParsedRows();
				if (!$db->numRows()) $snaps = array();
				$final = array('user'=>$user,'snaps'=>$snaps);
				print_json($final);
			} else die('0');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
	}
} elseif ($ACTION == 'members') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT uid, username, firstname, lastname, image FROM `%s`',MYSQL_TABLE_USERS));
		if ($db->numRows()) {
			$users = $db->fetchParsedRows();
			foreach ($users as $index => $user) {
				$users[$index]['fullname'] = $user['firstname'] . ' ' . $user['lastname'];
			}
			print_json(array_reverse($users));
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'friends') {
	try {
		$db = new MySQL();
		if (!isset($FRIENDS)) die('0');
		$orquery = implode(' OR uid = ', $FRIENDS);
		$db->sfquery(array('SELECT uid, username, firstname, lastname, image FROM `%s` WHERE uid = "%s"',MYSQL_TABLE_USERS, $orquery));
		if ($db->numRows()) {
			$users = $db->fetchParsedRows();
			foreach ($users as $index => $user) {
				$users[$index]['fullname'] = $user['firstname'] . ' ' . $user['lastname'];
			}
			print_json($users);
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif ($ACTION == 'feed') {
	try {
		$db = new MySQL();
		$db->sfquery(array('SELECT * FROM `%s` ORDER BY timestamp DESC LIMIT 10',MYSQL_TABLE_SNAPS));
		$snaps = $db->fetchParsedRows();
		if (!$db->numRows()) $snaps = array();
		print_json($snaps);
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
}

break;
}

exit();
?>
