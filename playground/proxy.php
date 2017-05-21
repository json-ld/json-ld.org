<?php
/*
* Warning! Read and use at your own risk!
*
* This tiny proxy script is completely transparent and it passes
* all requests and headers without any checking of any kind.
* The same happens with JSON data. They are simply forwarded.
*
* This is just an easy and convenient solution for the AJAX
* cross-domain request issue, during development.
* No sanitization of input is made either, so use this only
* if you are sure your requests are made correctly and
* your urls are valid.
*
*/
$method = $_SERVER['REQUEST_METHOD'];
if ($_GET && $_GET['url']) {
  $headers = getallheaders();
  $headers_str = [];
  $url = $_GET['url'];

  foreach ( $headers as $key => $value){
    if($key == 'Host')
      continue;
    $headers_str[]=$key.":".$value;
  }

  $ch = curl_init($url);
  curl_setopt($ch,CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers_str );
  $result = curl_exec($ch);
  curl_close($ch);
  echo $result;
}
else {
  echo $method;
  var_dump($_POST);
  var_dump($_GET);
  $data_str = file_get_contents('php://input');
  echo $data_str;
}

?>
