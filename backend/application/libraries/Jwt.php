<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * JWT (JSON Web Token) Library for CodeIgniter
 * Implements HS256 signing
 */
class Jwt
{
    private $secret_key;
    private $expiration;

    public function __construct()
    {
        $CI =& get_instance();
        $CI->config->load('config');
        $this->secret_key = $CI->config->item('jwt_secret_key');
        $this->expiration  = $CI->config->item('jwt_expiration');
    }

    /**
     * Generate a JWT token
     */
    public function generate_token(array $payload): string
    {
        $header = $this->base64url_encode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT',
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + $this->expiration;

        $payload_encoded = $this->base64url_encode(json_encode($payload));

        $signature = $this->base64url_encode(
            hash_hmac('sha256', "$header.$payload_encoded", $this->secret_key, true)
        );

        return "$header.$payload_encoded.$signature";
    }

    /**
     * Validate and decode a JWT token
     * Returns payload array on success, false on failure
     */
    public function validate_token(string $token)
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = $parts;

        $expected_signature = $this->base64url_encode(
            hash_hmac('sha256', "$header.$payload", $this->secret_key, true)
        );

        if (!hash_equals($expected_signature, $signature)) {
            return false;
        }

        $decoded_payload = json_decode($this->base64url_decode($payload), true);

        if (!$decoded_payload) {
            return false;
        }

        if (isset($decoded_payload['exp']) && $decoded_payload['exp'] < time()) {
            return false; // Token expired
        }

        return $decoded_payload;
    }

    /**
     * Extract token from Authorization header
     */
    public function get_token_from_header(): ?string
    {
        $CI =& get_instance();
        $headers = $CI->input->request_headers();

        if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
            return null;
        }

        $auth_header = $headers['Authorization'] ?? $headers['authorization'];

        if (preg_match('/Bearer\s+(.+)$/i', $auth_header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function base64url_encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64url_decode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
