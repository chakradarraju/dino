<?php
require_once("../../data/config.php");

$appId = APP_ID;
$appSecret = APP_SECRET;
$myURL = MY_URL . "?all=" . ($_GET['all'] ? $_GET['all'] : "false");

session_start();

if(isset($_GET['code'])) {
  if($_GET['state']!==$_SESSION['state'])
    die('{"error":"Wrong code, try again"}');
  $code = $_GET['code'];
  $url = "https://graph.facebook.com/oauth/access_token?client_id=$appId&redirect_uri=" . urlencode($myURL) . "&client_secret=$appSecret&code=$code";
  $forToken = @file_get_contents($url);
  $params = NULL;
  parse_str($forToken,$params);
  if(!isset($params['access_token'])) {
    echo "forToken:$forToken<br/>url:$url<br/>";
    die('{"error":"Facebook authentication failed"}');
  }
  header("Location: app.html?access_token=" . $params['access_token'] . "&all=" . $_GET['all']);
} else {
  $_SESSION['state'] = md5(uniqid(rand(), TRUE));
  echo("<script> top.location.href='http://www.facebook.com/dialog/oauth?client_id=$appId&redirect_uri=" . urlencode($myURL) . "&state={$_SESSION['state']}&scope=publish_actions,read_stream,friends_status' </script>");
}
?>
