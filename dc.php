<?php
$url = "http://localhost:3000/disconnect";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if ($data['success']) {
    echo "Disconnected successfully!";
} else {
    echo "Error: " . $data['message'];
}
?>