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
        Schema::table('posts', function (Blueprint $table) {
            $table->enum('visibility', ['public', 'hidden', 'deleted'])->default('public');
            $table->timestamp('hidden_at')->nullable();
            $table->unsignedBigInteger('hidden_by')->nullable();
            $table->foreign('hidden_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['hidden_by']);
            $table->dropColumn(['visibility', 'hidden_at', 'hidden_by']);
        });
    }
};
