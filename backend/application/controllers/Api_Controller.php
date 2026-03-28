<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Base API Controller
 * All API controllers extend this
 */
class Api_Controller extends CI_Controller
{
    protected $authenticated_user = null;

    public function __construct()
    {
        parent::__construct();
        $this->_cors_headers();
        $this->load->library('jwt');
        $this->load->database();
    }

    /**
     * Set CORS headers
     */
    private function _cors_headers(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
        header('Content-Type: application/json; charset=UTF-8');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    /**
     * Send JSON response
     */
    protected function respond(array $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data);
        exit();
    }

    /**
     * Send success response
     */
    protected function success($data = null, string $message = 'Success', int $status = 200): void
    {
        $response = [
            'status'  => 'success',
            'message' => $message,
        ];
        if ($data !== null) {
            $response['data'] = $data;
        }
        $this->respond($response, $status);
    }

    /**
     * Send error response
     */
    protected function error(string $message = 'Error', int $status = 400, $errors = null): void
    {
        $response = [
            'status'  => 'error',
            'message' => $message,
        ];
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        $this->respond($response, $status);
    }

    /**
     * Require valid JWT token — returns payload or sends 401
     */
    protected function require_auth(): array
    {
        $token = $this->jwt->get_token_from_header();

        if (!$token) {
            $this->error('No token provided. Please login first.', 401);
        }

        $payload = $this->jwt->validate_token($token);

        if (!$payload) {
            $this->error('Invalid or expired token. Please login again.', 401);
        }

        $this->authenticated_user = $payload;
        return $payload;
    }

    /**
     * Get raw JSON body
     */
    protected function get_json_body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Simple validation helper
     */
    protected function validate(array $data, array $rules): array
    {
        $errors = [];
        foreach ($rules as $field => $rule_str) {
            $rules_list = explode('|', $rule_str);
            foreach ($rules_list as $rule) {
                if ($rule === 'required' && (empty($data[$field]) && $data[$field] !== '0')) {
                    $errors[$field][] = "$field is required";
                }
                if (str_starts_with($rule, 'min_length')) {
                    preg_match('/\[(\d+)\]/', $rule, $m);
                    $min = (int)($m[1] ?? 0);
                    if (isset($data[$field]) && strlen($data[$field]) < $min) {
                        $errors[$field][] = "$field must be at least $min characters";
                    }
                }
                if ($rule === 'valid_email' && isset($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
                    $errors[$field][] = "$field must be a valid email address";
                }
            }
        }
        return $errors;
    }
}
