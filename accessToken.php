<?php
require_once("config.php");

$appId = APP_ID;
$appSecret = APP_SECRET;
$myURL = "http://chakradarraju.blr.corp.google.com/fbapp/accessToken.php";

session_start();

if(isset($_GET['code'])) {
  if($_GET['state']!==$_SESSION['state'])
    die('{"error":"Wrong code, try again"}');
  $code = $_GET['code'];
  $forToken = @file_get_contents("https://graph.facebook.com/oauth/access_token?client_id=$appId&redirect_uri=" . urlencode($myURL) . "&client_secret=$appSecret&code=$code");
  $params = NULL;
  parse_str($forToken,$params);
  if(!isset($params['access_token']))
    die('{"error":"Facebook authentication failed"}');
  header("Location: index.html?access_token=" . $params['access_token']);
} else {
  $_SESSION['state'] = md5(uniqid(rand(), TRUE));
  echo("<script> top.location.href='http://www.facebook.com/dialog/oauth?client_id=$appId&redirect_uri=" . urlencode($myURL) . "&state={$_SESSION['state']}&scope=publish_actions,read_stream,friends_status' </script>");
}
?>
