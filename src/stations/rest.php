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

public function artists(){ // list all artists
	if (1 === count($this->route)) {
		$this->db->sfquery(array(
			'SELECT *
				FROM `%s`',
			MYSQL_TABLE_ARTISTS
		));
		$rows = $this->db->fetchParsedRows();
		for ($i = 0; $i < count($rows); $i++) {
			$rows[$i]['tracks'] = json_decode($rows[$i]['tracks']);
		}
		$final = array('artists'=>$rows);
	} elseif (1 < count($this->route)) {
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

public function tracks(){ // list all artists
	$request = $this->request->getRequestVars();
	$ids = $request['ids'];
	$this->db->sfquery(array(
		'SELECT *
			FROM `%s`
				WHERE id
					IN ('.implode(',', $ids).')',
		MYSQL_TABLE_TRACKS
	));
	$rows = $this->db->fetchParsedRows();
	$final = array('tracks'=>$rows);
	$this->sendAcceptedResponse(200, $final);
}
}

$router = new Router;
$router->processRoute();
?>

