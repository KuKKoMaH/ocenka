<?
error_reporting(0);
$opts = [
  "http" => [
    "method" => "GET",
    "header" => "token: " . explode('|', $_COOKIE['auth'])[0] . "\r\n"
  ]
];

$context = stream_context_create($opts);

$id = $_GET['id'];
$url = 'https://test-fa.srg-it.ru/order/' . $id . '/invoice';
$resp = file_get_contents($url, false, $context);
if (!$resp) {
  header("HTTP/1.0 404 Not Found");
  echo '<h1>Сертификат не найден</h1>';
  die();
}

$certificate = json_decode($resp);
//echo '<pre>';var_dump($certificate); echo'</pre>';die();

$image = imagecreatefrompng('image.png');
$font = 'TimesNewRomanRegular.ttf';
$black = imagecolorallocate($image, 0, 0, 0);

// ========================================================
// наименованиие получателя платежа
$text = '' . $certificate->companyTitle;
$font_size = 22;
$y = 280;
$left = 387;
$right = 1126;
$bbox = imagettfbbox($font_size, 0, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text);
// ========================================================

// ========================================================
// КПП
$text = '' . $certificate->companyKpp;
$font_size = 22;
$y = 280;
$x = 1232;
for ($i = 0; $i < strlen($text); $i++) {
  $bbox = imagettfbbox($font_size, 0, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 31 / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 31 / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text[$i]);
  $x += 35;
}
// ========================================================

// ========================================================
// ИНН
$text = '' . $certificate->companyInn;
$font_size = 22;
$y = 348;
$x = 390;
for ($i = 0; $i < strlen($text); $i++) {
  $bbox = imagettfbbox($font_size, 0, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text[$i]);
  $x += 33;
}
// ========================================================

// ========================================================
// ОКТМО
$text = '' . $certificate->companyOktmo;
$font_size = 22;
$y = 348;
$x = 1163;
for ($i = 0; $i < strlen($text); $i++) {
  $bbox = imagettfbbox($font_size, 0, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 31 / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 31 / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text[$i]);
  $x += 35;
}
// ========================================================

// ========================================================
// номер счета получателя платежа
$text = '' . $certificate->companyTransferNumber;
$font_size = 22;
$y = 417;
$x = 390;
for ($i = 0; $i < strlen($text); $i++) {
  $bbox = imagettfbbox($font_size, 0, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text[$i]);
  $x += 33;
}
// ========================================================

// ========================================================
// БИК
$text = '' . $certificate->bankBik;
$font_size = 22;
$y = 487;
$x = 456;
for ($i = 0; $i < strlen($text); $i++) {
  $bbox = imagettfbbox($font_size, 0, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text[$i]);
  imagettftext($image, $font_size, 0, $x + 29 / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 662, $black, $font, $text[$i]);
  $x += 33;
}
// ========================================================

// ========================================================
// наименованиие платежа
$text = '' . $certificate->serviceName;
$font_size = 22;
$y = 535;
$left = 387;
$right = 1546;
$bbox = imagettfbbox($font_size, 0, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 682, $black, $font, $text);
// ========================================================

// ========================================================
// ФИО
$text = '' . $certificate->customerName;
$font_size = 22;
$y = 658;
$left = 618;
$right = 1546;
$bbox = imagettfbbox($font_size, 0, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 682, $black, $font, $text);
// ========================================================

// ========================================================
// К уплате
$text = $certificate->price . ' руб. 00 коп.';
$font_size = 22;
$y = 771;
$left = 552;
$right = 1546;
$bbox = imagettfbbox($font_size, 0, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y, $black, $font, $text);
imagettftext($image, $font_size, 0, $left + ($right - $left) / 2 - ($bbox[2] - $bbox[0]) / 2, $y + 707, $black, $font, $text);
// ========================================================

header('Content-type: image/png');
imagepng($image);
imagedestroy($image);