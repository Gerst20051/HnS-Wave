<?php
require_once 'functions.inc.php';
require_once 'restutils.class.php';
require_once 'mysql.class.php';

class Router extends RestUtils {
public $request = null;
public $route = array();
private $db = null;

public function __construct(){
	$this->db = new MySQL;
	$this->request = $this->processRequest();
}

public function processRoute(){
	$this->route = explode('/', strtolower(trim($_GET['route'])));
	$func = $this->route[0];

	if (method_exists($this, $func) === true) {
		$this->$func();
	} else {
		$this->sendResponse(404);
	}
}

private function json($data){
	if (is_array($data)) {
		return json_encode($data);
	}
}

private function xml($data){
	// $fc = FrontController::getInstance();
	$options = array(
		'indent' => '     ',
		'addDecl' => false,
		// 'rootName' => '', // $fc->getAction();
		XML_SERIALIZER_OPTION_RETURN_RESULT => true
	);
	$serializer = new XML_Serializer($options);
	return $serializer->serialize($data);
}

private function sendAcceptedResponse($status, $array){
	if ($this->request->getHttpAccept() == 'json') {
		$this->sendResponse($status, $this->json($array), 'application/json');
	} else if ($this->request->getHttpAccept() == 'xml') {
		$this->sendResponse($status, $this->xml($array), 'application/xml');
	}
}

public function artists(){
	if (1 === count($this->route)) { // list all artists
		$this->db->sfquery(array(
			'SELECT *
				FROM `%s` LIMIT 10',
			MYSQL_TABLE_ARTISTS
		));
		$artistrows = $this->db->fetchParsedRows();
		for ($i = 0; $i < count($artistrows); $i++) {
			$this->db->sfquery(array(
				'SELECT *
					FROM `%s`
						WHERE artistid = "%s"',
				MYSQL_TABLE_TRACKS,
				$artistrows[$i]['id']
			));
			$trackrows = $this->db->fetchParsedRows();
			//$artistrows[$i]['tracks'] = $trackrows;
			$artistrows[$i]['tracks'] = json_decode($artistrows[$i]['tracks']);
		}
		$final = array('artists'=>$artistrows);
	} elseif (1 < count($this->route)) { // list all tracks for artist based on artistid
		$route = $this->route;
		$this->db->sfquery(array(
			'SELECT *
				FROM `%s`
					WHERE artistid = "%s"',
			MYSQL_TABLE_TRACKS,
			$route[1]
		));
		$rows = $this->db->fetchParsedRows();
		$final = array('tracks'=>$rows);
	}
	$this->sendAcceptedResponse(200, $final);
}

public function tracks(){
	$request = $this->request->getRequestVars();
	$ids = $request['ids'];
	if (!isset($ids)) { // list all tracks for artist based on artistid
		$route = $this->route;
		$this->db->sfquery(array(
			'SELECT *
				FROM `%s`
					WHERE artistid = "%s"',
			MYSQL_TABLE_TRACKS,
			$route[1]
		));
	} else { // list all tracks for artist based on track ids
		$this->db->sfquery(array(
			'SELECT *
				FROM `%s`
					WHERE id
						IN ('.implode(',', $ids).')',
			MYSQL_TABLE_TRACKS
		));
	}
	$rows = $this->db->fetchParsedRows();
	$final = array('tracks'=>$rows);
	$this->sendAcceptedResponse(200, $final);
}
}

$router = new Router;
$router->processRoute();
?>

