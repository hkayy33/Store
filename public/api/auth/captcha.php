<?php
session_start();
header('Content-Type: application/json');

// Define the path to the CAPTCHA images and their corresponding codes
$captchaImagesPath = __DIR__ . '/../../../../Downloads/CaptchaImages/';
$images = [
    'image1.jpg' => 'Aeik2',
    'image2.jpg' => 'ecb4f',
    'image3.jpg' => '7plBJ8',
    'image4.jpg' => '24qu3'
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Select a random image
    $randomImage = array_rand($images);
    $imagePath = $captchaImagesPath . $randomImage;
    
    // Store the correct code in the session
    $_SESSION['captcha'] = $images[$randomImage];
    
    // Return the image path
    echo json_encode([
        'success' => true,
        'image' => '/api/auth/captcha_images/' . $randomImage
    ]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userInput = $data['captcha'] ?? '';
    
    if (empty($userInput)) {
        echo json_encode(['success' => false, 'error' => 'CAPTCHA is required']);
        exit;
    }
    
    if (!isset($_SESSION['captcha'])) {
        echo json_encode(['success' => false, 'error' => 'CAPTCHA session expired']);
        exit;
    }
    
    // Check if the user entered the correct code
    if ($userInput === $_SESSION['captcha']) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid CAPTCHA code']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} 