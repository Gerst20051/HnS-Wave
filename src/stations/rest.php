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
	if (1 === count($this->route)) {
		$this->db->sfquery(array(
			'SELECT id, name
				FROM `%s` LIMIT 10',
			MYSQL_TABLE_ARTISTS
		));
		$artistrows = $this->db->fetchParsedRows();
		for ($i = 0; $i < count($artistrows); $i++) {
			$artistrows[$i]['track_ids'] = json_decode($artistrows[$i]['tracks']);
			unset($artistrows[$i]['tracks']);
		}
		$final = array('artists'=>$artistrows);
	}
	$this->sendAcceptedResponse(200, $final);
}

public function tracks(){
	$this->db->sfquery(array(
		'SELECT id, videoid, title, duration
			FROM `%s` LIMIT 50',
		MYSQL_TABLE_TRACKS
	));
	$trackrows = $this->db->fetchParsedRows();
	$final = array('tracks'=>$trackrows);
	$this->sendAcceptedResponse(200, $final);
}

public function loadFixtures(){
	$this->db->sfquery(array(
			'SELECT *
				FROM `%s`',
			MYSQL_TABLE_ARTISTS
		));
		$artistrows = $this->db->fetchParsedRows();
		for ($i = 0; $i < count($artistrows); $i++) {
			$this->db->sfquery(array(
				'SELECT id, videoid, title, duration
					FROM `%s`
						WHERE artistid = "%s"',
				MYSQL_TABLE_TRACKS,
				$artistrows[$i]['id']
			));
			$trackrows = $this->db->fetchParsedRows();
			$artistrows[$i]['tracks'] = $trackrows;
		}
		$final = array('artists'=>$artistrows);
		$this->sendAcceptedResponse(200, $final);
}
}

$router = new Router;
$router->processRoute();
?>
