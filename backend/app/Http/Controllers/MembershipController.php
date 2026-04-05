<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Subscription;

class MembershipController extends Controller
{
    /**
     * Crear una sesión de pago de Stripe
     */
    public function createCheckoutSession(Request $request)
    {
        try {
            $user = $request->user();
            $membershipType = $request->input('type'); // 'monthly' o 'yearly'
            
            if (!in_array($membershipType, ['monthly', 'yearly'])) {
                return ResponseHelper::error('Tipo de membresía inválido', 400);
            }

            // Configurar Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Configurar precios (en centavos)
            $prices = [
                'monthly' => 999, // $9.99
                'yearly' => 9999  // $99.99
            ];

            // Crear o obtener el cliente de Stripe
            $stripeCustomer = null;
            if ($user->stripe_customer_id) {
                try {
                    $stripeCustomer = Customer::retrieve($user->stripe_customer_id);
                } catch (\Exception $e) {
                    // Si el cliente no existe, crear uno nuevo
                    $stripeCustomer = null;
                }
            }

            if (!$stripeCustomer) {
                $stripeCustomer = Customer::create([
                    'email' => $user->email,
                    'name' => $user->name,
                    'metadata' => [
                        'user_id' => $user->id
                    ]
                ]);

                // Guardar el ID del cliente
                $user->update(['stripe_customer_id' => $stripeCustomer->id]);
            }

            // Crear la sesión de checkout
            $checkoutSession = Session::create([
                'customer' => $stripeCustomer->id,
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Membresía Recetagram ' . ($membershipType === 'monthly' ? 'Mensual' : 'Anual'),
                        ],
                        'unit_amount' => $prices[$membershipType],
                        'recurring' => [
                            'interval' => $membershipType === 'monthly' ? 'month' : 'year',
                        ],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => env('APP_URL') . '/membership/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('APP_URL') . '/membership/cancel',
                'metadata' => [
                    'user_id' => $user->id,
                    'membership_type' => $membershipType
                ]
            ]);

            return ResponseHelper::success([
                'session_id' => $checkoutSession->id,
                'url' => $checkoutSession->url,
                'type' => $membershipType
            ], 'Sesión de pago creada exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en MembershipController@createCheckoutSession: ' . $e->getMessage());
            return ResponseHelper::error('Error al crear la sesión de pago: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Confirmar el pago y activar la membresía
     */
    public function confirmPayment(Request $request)
    {
        try {
            $user = $request->user();
            $sessionId = $request->input('session_id');

            // Configurar Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Obtener la sesión de Stripe
            $session = Session::retrieve($sessionId);
            
            if ($session->payment_status !== 'paid') {
                return ResponseHelper::error('El pago no se ha completado', 400);
            }

            // Obtener la suscripción
            $subscription = Subscription::retrieve($session->subscription);
            $membershipType = $session->metadata->membership_type ?? 'monthly';

            // Calcular fecha de expiración
            $expiresAt = $membershipType === 'monthly' 
                ? Carbon::now()->addMonth() 
                : Carbon::now()->addYear();

            $user->update([
                'is_verified' => true,
                'verified_at' => now(),
                'membership_expires_at' => $expiresAt,
                'membership_type' => $membershipType,
                'stripe_subscription_id' => $subscription->id
            ]);

            return ResponseHelper::success([
                'user' => $user->fresh(),
                'membership_expires_at' => $expiresAt,
                'subscription_id' => $subscription->id
            ], 'Membresía activada exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en MembershipController@confirmPayment: ' . $e->getMessage());
            return ResponseHelper::error('Error al confirmar el pago: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener el estado de la membresía del usuario
     */
    public function getMembershipStatus(Request $request)
    {
        try {
            $user = $request->user();
            
            $status = [
                'is_verified' => $user->isVerified(),
                'has_active_membership' => $user->hasActiveMembership(),
                'membership_type' => $user->membership_type,
                'membership_expires_at' => $user->membership_expires_at,
                'verified_at' => $user->verified_at
            ];

            return ResponseHelper::success($status, 'Estado de membresía obtenido exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en MembershipController@getMembershipStatus: ' . $e->getMessage());
            return ResponseHelper::error('Error al obtener el estado de membresía: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar la membresía
     */
    public function cancelMembership(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user->hasActiveMembership()) {
                return ResponseHelper::error('No tienes una membresía activa', 400);
            }

            // Configurar Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Cancelar la suscripción en Stripe
            if ($user->stripe_subscription_id) {
                $subscription = Subscription::retrieve($user->stripe_subscription_id);
                $subscription->cancel();
            }

            $user->update([
                'membership_expires_at' => now(),
                'stripe_subscription_id' => null
            ]);

            return ResponseHelper::success($user->fresh(), 'Membresía cancelada exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en MembershipController@cancelMembership: ' . $e->getMessage());
            return ResponseHelper::error('Error al cancelar la membresía: ' . $e->getMessage(), 500);
        }
    }
}
