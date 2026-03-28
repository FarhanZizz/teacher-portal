<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api_Controller.php';

class Users extends Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Auth_model');
    }

    /**
     * GET /api/users
     * List all auth_users (protected)
     */
    public function index(): void
    {
        $this->require_auth();
        $users = $this->Auth_model->get_all_safe();
        $this->success($users, 'Users retrieved successfully');
    }

    /**
     * GET /api/users/:id
     * Get single user (protected)
     */
    public function show(int $id): void
    {
        $this->require_auth();
        $user = $this->Auth_model->find_by_id($id);

        if (!$user) {
            $this->error('User not found', 404);
        }

        $arr = (array) $user;
        unset($arr['password']);
        $this->success($arr, 'User retrieved');
    }
}
