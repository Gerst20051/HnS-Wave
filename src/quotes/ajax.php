<?php
session_start();
header('Access-Control-Allow-Origin: *');

require_once 'config.inc.php';
require_once 'functions.inc.php';
require_once 'api.inc.php';
require_once 'mysql.class.php';

if (!$con = mysql_connect(MYSQL_HOST,MYSQL_USER,MYSQL_PASSWORD)) throw new Exception('Error connecting to the server');
if (!mysql_select_db(MYSQL_DATABASE,$con)) throw new Exception('Error selecting database');

if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) $UID = (int)$_SESSION['user_id'];
if (isset($_POST['id']) && !empty($_POST['id'])) $PID = (int)$_POST['id'];
if (isset($_POST['quote']) && !empty($_POST['quote'])) $QUOTE = $_POST['quote'];
if (isset($_POST['timestamp']) && !empty($_POST['timestamp'])) $TIMESTAMP = (int)$_POST['timestamp'];
if (isset($_REQUEST['type']) && !empty($_REQUEST['type'])) $TYPE = $_REQUEST['type'];

switch ($_SERVER['REQUEST_METHOD']) {
case 'GET':

if (isset($_GET['id']) && !empty($_GET['id'])) {
	$ID = (int)$_GET['id'];
	try {
		$db = new MySQL();
		$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE owner_id = '.$ID);
		$rows = $db->fetchParsedRows();
		for ($i=0;$i<count($rows);$i++) {
			$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
		}
		if (0 < $db->numRows()) {
			print_json(array_reverse($rows));
		} else die('0');
	} catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
} elseif (!empty($TYPE)) {
	if ($TYPE == 'all') {
		try {
			$db = new MySQL();
			//$rows = $db->fetchParsedAll(MYSQL_TABLE);
			$db->query('SELECT * FROM '.MYSQL_TABLE);
			$rows = $db->fetchParsedRows();
			for ($i=0;$i<count($rows);$i++) {
				$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
			}
			if (0 < $db->numRows()) {
				print_json(array_reverse($rows));
			} else die('0');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
	} elseif ($TYPE == 'user') {
		try {
			$db = new MySQL();
			$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE owner_id = '.$UID);
			$rows = $db->fetchParsedRows();
			for ($i=0;$i<count($rows);$i++) {
				$rows[$i]["quote"] = json_decode($rows[$i]["quote"]);
			}
			if (0 < $db->numRows()) {
				print_json(array_reverse($rows));
			} else die('0');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
	}
}

break;
case 'POST':

if (!empty($UID) && !empty($PID) && !empty($TYPE)) {
	$type = (int)$TYPE;
	try {
		$db = new MySQL();
		$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE id = '.$PID);
		if ($type === 1) {
			if (!empty($QUOTE) && !empty($TIMESTAMP)) {
				$quote = json_encode($QUOTE);
				if (0 < $db->numRows()) {
					$db->sfquery(array('UPDATE `%s` SET quote = "%s" WHERE id = %s',MYSQL_TABLE,$quote,$PID));
				} else {
					$db->insert(MYSQL_TABLE, array(
						'owner_id'=>$UID,
						'quote'=>$quote,
						'timestamp'=>$TIMESTAMP
					));
				}
				if (0 < $db->affectedRows()) {
					die('1');
				} else die('0');
			}
		} elseif ($type === 2) {
			if (0 < $db->numRows()) {
				// check to make sure the current user UID is the owner of the post to be deleted PID
				$db->query('DELETE FROM `'.MYSQL_TABLE.'` WHERE id = '.$PID);
				if (0 < $db->affectedRows()) {
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
				if (0 < $db->affectedRows()) {
					$insertID = $db->insertID();
					$db->query('SELECT * FROM `'.MYSQL_TABLE.'` WHERE id = '.$insertID);
					if (0 < $db->numRows()) {
						$row = $db->fetchParsedRow();
						$row["quote"] = json_decode($row["quote"]);
						if (0 < $db->numRows()) {
							print_json($row);
						}
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
}
?>