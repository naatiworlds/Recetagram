<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Actualizar el enum de roles para incluir los nuevos roles
            $table->enum('role', ['user', 'admin', 'moderator', 'sponsor', 'donor', 'verified'])->default('user')->change();
            
            // Agregar campos para verificación y membresías
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('membership_expires_at')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_subscription_id')->nullable();
            $table->enum('membership_type', ['monthly', 'yearly'])->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revertir el enum de roles
            $table->enum('role', ['user', 'admin'])->default('user')->change();
            
            // Eliminar los campos agregados
            $table->dropColumn([
                'is_verified',
                'verified_at',
                'membership_expires_at',
                'stripe_customer_id',
                'stripe_subscription_id',
                'membership_type'
            ]);
        });
    }
};
