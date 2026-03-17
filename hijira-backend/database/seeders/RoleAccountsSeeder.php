<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAccountsSeeder extends Seeder
{
    /**
     * Seed role-based accounts.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Hijra Super Admin',
                'phone' => '+251911111111',
                'password' => Hash::make('Password123!'),
                'role' => 'admin',
                'admin_type' => 'super_admin',
                'account_status' => 'active',
                'preferred_language' => 'en',
            ]
        );
    }
}
