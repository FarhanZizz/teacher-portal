<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Teacher_model extends CI_Model
{
    protected $table = 'teachers';

    public function find(int $id)
    {
        return $this->db->get_where($this->table, ['id' => $id])->row();
    }

    public function create(array $data): int
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

    public function get_all_with_user(): array
    {
        return $this->db
            ->select('t.id, t.user_id, t.university_name, t.gender, t.year_joined, t.subject, t.bio, t.created_at, t.updated_at,
                      u.email, u.first_name, u.last_name, u.phone')
            ->from('teachers t')
            ->join('auth_user u', 'u.id = t.user_id', 'left')
            ->get()
            ->result_array();
    }

    public function get_with_user(int $id): ?array
    {
        $result = $this->db
            ->select('t.id, t.user_id, t.university_name, t.gender, t.year_joined, t.subject, t.bio, t.created_at, t.updated_at,
                      u.email, u.first_name, u.last_name, u.phone')
            ->from('teachers t')
            ->join('auth_user u', 'u.id = t.user_id', 'left')
            ->where('t.id', $id)
            ->get()
            ->row_array();

        return $result ?: null;
    }
}
