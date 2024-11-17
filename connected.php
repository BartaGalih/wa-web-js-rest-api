<?php
$url = "http://localhost:3000/connected-info";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if ($data['success']) {
    echo $data['connectedNumber'];
} else {
    echo "Error: " . $data['message'];
}