<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Options extends CI_Controller
{
    public function preflight(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
        http_response_code(200);
        exit();
    }
}
