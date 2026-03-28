<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth_model extends CI_Model
{
    protected $table = 'auth_user';

    public function find_by_email(string $email)
    {
        return $this->db->get_where($this->table, ['email' => $email])->row();
    }

    public function find_by_id(int $id)
    {
        return $this->db->get_where($this->table, ['id' => $id])->row();
    }

    public function email_exists(string $email): bool
    {
        return $this->db->get_where($this->table, ['email' => strtolower($email)])->num_rows() > 0;
    }

    public function create_user(array $data): int
    {
        $this->db->insert($this->table, $data);
        return (int) $this->db->insert_id();
    }

    public function update(int $id, array $data): void
    {
        $this->db->where('id', $id)->update($this->table, $data);
    }

    public function delete(int $id): void
    {
        $this->db->where('id', $id)->delete($this->table);
    }

    public function get_all_safe(): array
    {
        $users = $this->db->select('id, email, first_name, last_name, phone, created_at, updated_at')
                          ->get($this->table)
                          ->result_array();
        return $users;
    }
}
