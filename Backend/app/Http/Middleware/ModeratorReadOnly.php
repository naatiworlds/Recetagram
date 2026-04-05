<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ModeratorReadOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Si es moderador, solo permitir métodos GET y POST (para despublicar)
        if ($user && $user->isModerator() && !$user->isAdmin()) {
            if (!in_array($request->method(), ['GET', 'POST'])) {
                return response()->json([
                    'message' => 'Los moderadores solo pueden ver información y despublicar posts'
                ], 403);
            }
        }
        
        return $next($request);
    }
}
