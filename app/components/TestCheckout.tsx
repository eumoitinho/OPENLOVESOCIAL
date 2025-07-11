"use client";

import { useState } from "react";
import CheckoutForm from "./CheckoutForm";

export default function TestCheckout() {
  const [showCheckout, setShowCheckout] = useState(false);

  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Usuário Teste"
  };

  console.log("TestCheckout renderizado, showCheckout:", showCheckout);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste do Checkout</h1>
      
      <button 
        onClick={() => {
          console.log("Botão clicado, abrindo checkout");
          setShowCheckout(true);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Abrir Checkout
      </button>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" 
              onClick={() => {
                console.log("Fechando checkout");
                setShowCheckout(false);
              }}
            >
              ×
            </button>
            <div className="p-6">
              <CheckoutForm 
                user={mockUser} 
                plano="gold" 
                onSuccess={(data) => {
                  console.log("Sucesso:", data);
                  setShowCheckout(false);
                }} 
                onError={(error) => {
                  console.log("Erro:", error);
                  setShowCheckout(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 