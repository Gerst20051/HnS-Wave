<?php
require_once 'functions.inc.php';
$REF = varcheck($_SERVER['HTTP_REFERER']);
$APIKEY = varcheck($_REQUEST['apikey']);
if (!empty($REF) && !empty($APIKEY)) {
	require_once 'auth.inc.php';
	$allow = false;
	foreach($auth as $referer => $key) {
		if ($APIKEY == $key && strpos($REF,$referer) !== false) { $allow = true; break; }
	}
	if (!$allow) error("Bad API Key! - Key: ".$APIKEY);
} else {
	if (empty($APIKEY)) error("API Key Error! - Key: ".$APIKEY);
	elseif (empty($REF)) error("HTTP Referer Error! - Ref: ".$REF);
}
?>