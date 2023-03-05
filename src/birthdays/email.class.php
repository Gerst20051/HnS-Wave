<?php

define('FROM_ADDRESS', 'birthdays@hnswave.co');
define('SUBJECT', 'Birthday Reminder Account Activation');

class EMAIL {

private $from;
private $to;
private $subject;
private $message;
private $headers;

public function __construct($from = FROM_ADDRESS, $subject = SUBJECT) {
	$this->from = $from;
	$this->to = $to;
	$this->subject = $subject;
}

public function getHeaders(){
	return $this->headers;
}

public function setHeaders($headers){
	/*
	$headers .= 'To: Mary <mary@example.com>, Kelly <kelly@example.com>' . "\r\n";
	$headers .= 'From: Birthday Reminder <birthday@example.com>' . "\r\n";
	$headers .= 'Cc: birthdayarchive@example.com' . "\r\n";
	$headers .= 'Bcc: birthdaycheck@example.com' . "\r\n";
	*/
	$this->headers = $headers;
}

public function getFromAddress(){
	return $this->from;
}

public function setFromAddress($from){
	$this->from = $from;
}

public function getToAddress(){
	return $this->to;
}

public function setToAddress($to){
	//$to  = 'aidan@example.com' . ', ';
	//$to .= 'wez@example.com';
	$this->to = $to;
}

public function getSubject(){
	return $this->subject;
}

public function setSubject($subject){
	$this->subject = $subject;
}

public function getMessage(){
	return $this->message;
}

public function setMessage($message){
	$this->message = $message;
}

public function send(){
	try {
		mail($this->to, $this->subject, $this->message, $this->headers);
	} catch (Exception $e) {
	}
}

}
?>
