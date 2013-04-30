<?php
require_once 'mysql.config.php';

class MySQL {
private $query;
private $result;
private $data;
public function __construct($host = MYSQL_HOST, $user = MYSQL_USER, $password = MYSQL_PASSWORD, $database = MYSQL_DATABASE) {
	if (!$con = mysql_connect($host,$user,$password)) {
		throw new Exception('Error connecting to the server');
	}
	if (!mysql_select_db($database,$con)) {
		throw new Exception('Error selecting database');
	}
}

public function query($query){
	$this->query = $query;
	if (!$this->result = mysql_query($query)) {
		throw new Exception('Error performing query '.$query);
	}
}

public function sfquery($args){
	if (count($args) < 2) return false;
	$query = array_shift($args);
	$this->query = $query;
	$args = array_map('mysql_real_escape_string',$args);
	array_unshift($args,$query);
	$query = call_user_func_array('sprintf',$args);
	if (!$this->result = mysql_query($query)) {
		throw new Exception('Error performing query '.$query);
	}
}

public function numRows(){
	if ($this->result) return mysql_num_rows($this->result);
	return false;
}

public function fetchRow(){
	while ($row = mysql_fetch_array($this->result)) {
		$this->data = $row;
		return $row;
	}
	return false;
}

public function fetchAll($table = MYSQL_TABLE){
	$this->query('SELECT * FROM '.$table);
	while ($row = $this->fetchRow()) {
		$rows[] = $row;
	}
	$this->data = $rows;
	return $rows;
}

public function fetchRows(){
	while ($row = $this->fetchRow()) {
		$rows[] = $row;
	}
	$this->data = $rows;
	return $rows;
}

public function fetchAssocRow(){
	while ($row = mysql_fetch_assoc($this->result)) {
		$this->data = $row;
		return $row;
	}
	return false;
}

public function fetchAssocAll($table = MYSQL_TABLE){
	$this->query('SELECT * FROM '.$table);
	while ($row = $this->fetchAssocRow()) {
		$rows[] = $row;
	}
	$this->data = $rows;
	return $rows;
}

public function fetchAssocRows(){
	while ($row = $this->fetchAssocRow()) {
		$rows[] = $row;
	}
	$this->data = $rows;
	return $rows;
}

public function fetchParsedRow(){
	$row = mysql_fetch_assoc($this->result);
	for ($i = 0; $i < mysql_num_fields($this->result); $i++) {
		$info = mysql_fetch_field($this->result,$i);
		$type = $info->type;
		if ($type == 'real') $row[$info->name] = doubleval($row[$info->name]);
		else if ($type == 'int') $row[$info->name] = intval($row[$info->name]);
	}
	$this->data = $row;
	return $row;
}

public function fetchParsedRows(){
	while ($row = mysql_fetch_assoc($this->result)) {
		for ($i = 0; $i < mysql_num_fields($this->result); $i++) {
			$info = mysql_fetch_field($this->result,$i);
			$type = $info->type;
			if ($type == 'real') $row[$info->name] = doubleval($row[$info->name]);
			else if ($type == 'int') $row[$info->name] = intval($row[$info->name]);
		}
		$rows[] = $row;
	}
	$this->data = $rows;
	return $rows;
}

public function insert($table, $params){
	$values = array_map('mysql_real_escape_string',array_values($params));
	$keys = array_keys($params);
	$this->query('INSERT INTO `'.$table.'` (`'.implode('`,`', $keys).'`) VALUES (\''.implode('\',\'', $values).'\')');
}

public function queryDebug(){
	return print_r($this->query);
}

public function resultDebug(){
	return print_r($this->data);
}

public function insertID(){
	return mysql_insert_id();
}

public function affectedRows(){
	return mysql_affected_rows();
}
}
?>