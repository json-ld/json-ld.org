<?php

// open the token file
$tfile = fopen('remote-update-token.txt', 'r');

// Acquire the lock in a non-blocking manner
if($tfile == FALSE)
{
   echo 'ERROR: You must create a file called remote-update-token.txt and ' .
      'place a secret token in that file. See the README for more information.';
}
else if(flock($tfile, LOCK_EX | LOCK_NB))
{
   $token = trim(fgets($tfile));

   // check to make sure that the token value is correct
   if(array_key_exists('token', $_GET) and $token === $_GET['token'])
   {
      // perform a git pull
      chdir('..');
      $gitdir = getcwd() . "/.git";
      $last_line = system("git --git-dir $gitdir pull", $last_line);

      echo 'git pull last line: ' . $last_line . "\n";
      echo 'git pull retval: ' . $retval . "\n";
      echo 'git pull complete';

      // Sleep for 5 seconds to throttle the update rate to 12 per minute
      sleep(5);
   }
   else
   {
      echo 'ERROR: Invalid secret token provided. ' .
         'See the README for more information.';
   }

   // Release the lock file
   flock($tfile, LOCK_UN); // release the lock
}
else
{
   echo 'ERROR: An update is currently being performed, ' .
      'this request has been rejected.';
}

fclose($tfile);
?>
