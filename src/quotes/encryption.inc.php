<?php
require_once 'config.php';

function pbkdf2($password, $salt){
	$goodSalt = PASSWORD_PEPPER . $salt . PASSWORD_PEPPER;
	return pbkdf2_real("sha512", $password, $goodSalt, 1024, 256);
}

function pbkdf2_real($algorithm, $password, $salt, $count, $key_length){
	$algorithm = strtolower($algorithm);
	if (!in_array($algorithm, hash_algos(), true)) die('PBKDF2 ERROR: Invalid hash algorithm.');
	if ($count < 0 || $key_length < 0) die('PBKDF2 ERROR: Invalid parameters.');
	if ($key_length > 4294967295) die('PBKDF2 ERROR: Derived key too long.');

	$hLen = strlen(hash($algorithm, "", true));
	$numBlocks = (int) ceil((double) $key_length / $hLen);
	$output = "";

	for ($i = 1; $i <= $numBlocks; $i++)
			$output .= pbkdf2_f($password, $salt, $count, $i, $algorithm, $hLen);

	return substr($output, 0, $key_length);
}

function pbkdf2_f($password, $salt, $count, $i, $algorithm, $hLen){
	$last = $salt . chr(($i >> 24) % 256) . chr(($i >> 16) % 256) . chr(($i >> 8) % 256) . chr($i % 256);
	$xorsum = "";

	for ($r = 0; $r < $count; $r++) {
		$u = hash_hmac($algorithm, $last, $password, true);
		$last = $u;
		if (empty($xorsum)) $xorsum = $u;
		else
			for ($c = 0; $c < $hLen; $c++)
				$xorsum[$c] = chr(ord(substr($xorsum, $c, 1)) ^ ord(substr($u, $c, 1)));
	}

	return bin2hex($xorsum);
} 

function genSalt(){
	return hash("sha256", md5(mt_rand()) . hash("sha1", PASSWORD_PEPPER . time() . mt_rand()));
}

function genVerificationKey(){
	return sha1(sha1(mt_rand()) . substr(md5(mt_rand()), 12));
}
?>
