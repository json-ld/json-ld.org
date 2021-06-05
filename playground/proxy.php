<?php
/*
 * This is a really dangerous proxy script, only run it on machines that
 * can't cause any damage if they were to be pwnd.
 */

// Support < 5.4.0
// https://stackoverflow.com/questions/3258634/php-how-to-send-http-response-code

// https://stackoverflow.com/questions/1252693/using-str-replace-so-that-it-only-acts-on-the-first-match
function str_replace_first($from, $to, $content)
{
    $from = '/'.preg_quote($from, '/').'/';

    return preg_replace($from, $to, $content, 1);
}

if ($_GET && $_GET['url']) {
  $url = $_GET['url'];

  $host = parse_url($url, PHP_URL_HOST);
  $ip = gethostbyname($host);

  // replace hostname with IP to avoid DNS rebinding attacks
  $url = str_replace_first($host, $ip, $url);
  
  // Check if IP in reserved range: https://www.php.net/manual/de/filter.filters.flags.php
  if (filter_var($ip, FILTER_FLAG_NO_PRIV_RANGE, FILTER_FLAG_NO_RES_RANGE)) {
    exit('The playground does not allow IPs within private or reserved ranges as JSON-LD @context URIs.');
  }

  if (strpos($url, 'http') !== 0) {
    exit('The playground only supports HTTP schema for JSON-LD @context URLs.');
  }

  // Set Headers
  $headers_str = array();
  $headers_str[] = "Host: " . $host;
  $headers_str[] = "User-Agent: " . "curl/json-ld.org";

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers_str);

  curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTPS | CURLPROTO_HTTP);
  curl_setopt($ch, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTPS);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Prevent redirect to blocked IP range. If we want to enable redirections we have to ensure the redirect does not contain an IP in a reserved/private range

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers_str);
  curl_setopt($ch, CURLOPT_ENCODING, '');
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);

  $result = curl_exec($ch);
  $recieved_content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  
  // Only allow json responses as we only process those on the client anyway
  // Prevent XSS payloads by returning HTML content from external sites.
  if ($recieved_content_type !== 'application/ld+json' && $recieved_content_type !== 'application/json') {
    exit('Invalid content type recieved from JSON-LD @context endpoint');
  }
  
  curl_close($ch);
  echo $result;
}
