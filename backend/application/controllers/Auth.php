<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api_Controller.php';

class Auth extends Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Auth_model');
    }

    /**
     * POST /api/auth/register
     * Register a new user
     */
    public function register(): void
    {
        $data = $this->get_json_body();

        $errors = $this->validate($data, [
            'email'      => 'required|valid_email',
            'first_name' => 'required',
            'last_name'  => 'required',
            'password'   => 'required|min_length[6]',
        ]);

        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
        }

        // Check email uniqueness
        if ($this->Auth_model->email_exists($data['email'])) {
            $this->error('Email already registered', 409);
        }

        $user_id = $this->Auth_model->create_user([
            'email'      => strtolower(trim($data['email'])),
            'first_name' => trim($data['first_name']),
            'last_name'  => trim($data['last_name']),
            'password'   => password_hash($data['password'], PASSWORD_BCRYPT),
            'phone'      => $data['phone'] ?? null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (!$user_id) {
            $this->error('Registration failed. Please try again.', 500);
        }

        $user  = $this->Auth_model->find_by_id($user_id);
        $token = $this->jwt->generate_token([
            'user_id'    => $user->id,
            'email'      => $user->email,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
        ]);

        $this->success([
            'token' => $token,
            'user'  => $this->_safe_user($user),
        ], 'Registration successful', 201);
    }

    /**
     * POST /api/auth/login
     * Login with email & password
     */
    public function login(): void
    {
        $data = $this->get_json_body();

        $errors = $this->validate($data, [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ]);

        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
        }

        $user = $this->Auth_model->find_by_email(strtolower(trim($data['email'])));

        if (!$user || !password_verify($data['password'], $user->password)) {
            $this->error('Invalid email or password', 401);
        }

        $token = $this->jwt->generate_token([
            'user_id'    => $user->id,
            'email'      => $user->email,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
        ]);

        $this->success([
            'token' => $token,
            'user'  => $this->_safe_user($user),
        ], 'Login successful');
    }

    /**
     * POST /api/auth/logout
     * Logout (token invalidation is handled client-side for stateless JWT)
     */
    public function logout(): void
    {
        $this->require_auth();
        $this->success(null, 'Logged out successfully');
    }

    /**
     * GET /api/auth/me
     * Get authenticated user profile
     */
    public function me(): void
    {
        $payload = $this->require_auth();
        $user    = $this->Auth_model->find_by_id($payload['user_id']);

        if (!$user) {
            $this->error('User not found', 404);
        }

        $this->success($this->_safe_user($user), 'User profile retrieved');
    }

    /**
     * Remove password from user object
     */
    private function _safe_user(object $user): array
    {
        $arr = (array) $user;
        unset($arr['password']);
        return $arr;
    }
}
