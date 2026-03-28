<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api_Controller.php';

class Teachers extends Api_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Teacher_model');
        $this->load->model('Auth_model');
    }

    /**
     * GET /api/teachers
     * List all teachers with their user data (protected)
     */
    public function index(): void
    {
        $this->require_auth();

        $teachers = $this->Teacher_model->get_all_with_user();
        $this->success($teachers, 'Teachers retrieved successfully');
    }

    /**
     * POST /api/teachers
     * Create auth_user + teacher in one request (protected)
     * This is the single POST API as per requirement #6
     */
    public function create(): void
    {
        $this->require_auth();
        $data = $this->get_json_body();

        // Validate auth_user fields
        $errors = $this->validate($data, [
            'email'           => 'required|valid_email',
            'first_name'      => 'required',
            'last_name'       => 'required',
            'password'        => 'required|min_length[6]',
            'university_name' => 'required',
            'gender'          => 'required',
            'year_joined'     => 'required',
        ]);

        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
        }

        if ($this->Auth_model->email_exists($data['email'])) {
            $this->error('Email already registered', 409);
        }

        // Begin transaction
        $this->db->trans_begin();

        // 1. Insert into auth_user
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
            $this->db->trans_rollback();
            $this->error('Failed to create user record', 500);
        }

        // 2. Insert into teachers (FK: user_id)
        $teacher_id = $this->Teacher_model->create([
            'user_id'         => $user_id,
            'university_name' => trim($data['university_name']),
            'gender'          => $data['gender'],
            'year_joined'     => (int) $data['year_joined'],
            'subject'         => $data['subject'] ?? null,
            'bio'             => $data['bio'] ?? null,
            'created_at'      => date('Y-m-d H:i:s'),
            'updated_at'      => date('Y-m-d H:i:s'),
        ]);

        if (!$teacher_id) {
            $this->db->trans_rollback();
            $this->error('Failed to create teacher record', 500);
        }

        if ($this->db->trans_status() === FALSE) {
            $this->db->trans_rollback();
            $this->error('Transaction failed', 500);
        }

        $this->db->trans_commit();

        $result = $this->Teacher_model->get_with_user($teacher_id);
        $this->success($result, 'Teacher created successfully', 201);
    }

    /**
     * GET /api/teachers/:id
     * Get single teacher (protected)
     */
    public function show(int $id): void
    {
        $this->require_auth();

        $teacher = $this->Teacher_model->get_with_user($id);
        if (!$teacher) {
            $this->error('Teacher not found', 404);
        }

        $this->success($teacher, 'Teacher retrieved successfully');
    }

    /**
     * PUT /api/teachers/:id
     * Update teacher (protected)
     */
    public function update(int $id): void
    {
        $this->require_auth();
        $data = $this->get_json_body();

        $teacher = $this->Teacher_model->find($id);
        if (!$teacher) {
            $this->error('Teacher not found', 404);
        }

        // Update auth_user fields if provided
        $user_data = array_filter([
            'first_name' => $data['first_name'] ?? null,
            'last_name'  => $data['last_name'] ?? null,
            'phone'      => $data['phone'] ?? null,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (!empty($user_data)) {
            $this->Auth_model->update($teacher->user_id, $user_data);
        }

        // Update teacher fields if provided
        $teacher_data = array_filter([
            'university_name' => $data['university_name'] ?? null,
            'gender'          => $data['gender'] ?? null,
            'year_joined'     => isset($data['year_joined']) ? (int)$data['year_joined'] : null,
            'subject'         => $data['subject'] ?? null,
            'bio'             => $data['bio'] ?? null,
            'updated_at'      => date('Y-m-d H:i:s'),
        ]);

        if (!empty($teacher_data)) {
            $this->Teacher_model->update($id, $teacher_data);
        }

        $updated = $this->Teacher_model->get_with_user($id);
        $this->success($updated, 'Teacher updated successfully');
    }

    /**
     * DELETE /api/teachers/:id
     * Delete teacher and their auth_user (protected)
     */
    public function delete(int $id): void
    {
        $this->require_auth();

        $teacher = $this->Teacher_model->find($id);
        if (!$teacher) {
            $this->error('Teacher not found', 404);
        }

        $this->db->trans_begin();
        $this->Teacher_model->delete($id);
        $this->Auth_model->delete($teacher->user_id);
        $this->db->trans_commit();

        $this->success(null, 'Teacher deleted successfully');
    }
}
