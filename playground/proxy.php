<?php
/*
 * This is a really dangerous proxy script, only run it on machines that
 * can't cause any damage if they were to be pwnd.
 */

// Support < 5.4.0
// https://stackoverflow.com/questions/3258634/php-how-to-send-http-response-code
if(!function_exists('http_response_code'))
{
   function http_response_code($newcode = NULL)
   {
      static $code = 200;
      if($newcode !== NULL)
      {
         header('X-PHP-Response-Code: '.$newcode, true, $newcode);
         if(!headers_sent())
            $code = $newcode;
      }
      return $code;
   }
}

if($_GET && $_GET['url']) {
  $headers = getallheaders();
  $headers_str = array();
  $url = $_GET['url'];

  if(strpos($url, 'http') !== 0) {
    exit('Only proxying HTTP URLs is allowed. Invalid URL: ' . $url);
  }

  foreach($headers as $key => $value){
    if($key == 'Host')
      continue;
    $headers_str[]=$key.': '.$value;
  }

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers_str);
  curl_setopt($ch, CURLOPT_ENCODING, '');
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);
  $result = curl_exec($ch);
  http_response_code(curl_getinfo($ch, CURLINFO_HTTP_CODE));
  header('Content-Type: '.curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
  curl_close($ch);
  echo $result;
}

?>
