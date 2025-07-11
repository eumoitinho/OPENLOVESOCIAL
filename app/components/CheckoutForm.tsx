"use client";

import { useEffect, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { PUBLIC_KEY } from "@/app/lib/constants";

type PlanoType = "gold" | "diamante" | "diamante_anual";

const PLANOS_PRECOS = {
  gold: 25.0,
  diamante: 45.9,
  diamante_anual: 459.0,
} as const;

interface CheckoutFormProps {
  user: any;
  plano: PlanoType;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({ user, plano, onSuccess, onError }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);



  const initialization = {
    amount: Number(PLANOS_PRECOS[plano].toFixed(2)),
    currency_id: "BRL", // Adicione a moeda
  };
  
  const customization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
      types: {
        included: ["credit_card" as const, "debit_card" as const]
      }
    },
    form: {
      includeEmail: true,
    },
  };

  useEffect(() => {
    const initializeMercadoPago = async () => {
      try {
        await initMercadoPago('TEST-7eefa937-d666-48e2-ae89-9c30a28f86e0', { locale: 'pt-BR' });
        setIsSdkReady(true);
        console.log("Mercado Pago SDK inicializado com sucesso");
      } catch (err) {
        console.error("Erro ao inicializar Mercado Pago SDK:", err);
        onError?.("Erro ao carregar o formulário de pagamento");
      }
    };
    initializeMercadoPago();
  }, []);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    console.log("Dados do formulário:", formData);
    console.log("Email do formulário (payer.email):", formData.payer?.email);
    console.log("Email do usuário (fallback):", user.email);
    console.log("Email que será enviado:", formData.payer?.email || user.email);
    try {
      const response = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          plano: plano,
          email: formData.payer?.email || user.email, // Usa o email do formulário ou o do usuário como fallback
        }),
      });

      const result = await response.json();

      if (result.redirectUrl) {
        onSuccess?.(result);
        window.location.href = result.redirectUrl;
      } else {
        onError?.(result.error || "Erro ao processar pagamento");
      }
    } catch (error) {
      onError?.("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: any) => {
    console.error("Erro no formulário:", error);
    
    // Se error for um objeto vazio, não faz nada
    if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
      return;
    }
    
    if (error && typeof error === 'object' && error.cause) {
      // Verifica se cause é um array antes de fazer map
      if (Array.isArray(error.cause)) {
        const errorMessage = error.cause.map((e: any) => e.description).join(', ');
        onError?.(errorMessage || "Erro no formulário de pagamento");
      } else {
        onError?.("Erro no formulário de pagamento");
      }
    } else if (error && typeof error === 'string') {
      onError?.(error);
    } else if (error && typeof error === 'object') {
      // Se for um objeto mas não tiver cause, tenta extrair mensagem
      const errorMessage = error.message || error.description || "Erro no formulário de pagamento";
      onError?.(errorMessage);
    }
  };

  const onReady = () => {
    console.log("Formulário pronto");
  };

  const formatPlanoValue = (plano: PlanoType) => {
    switch (plano) {
      case "gold":
        return "R$ 25,00/mês";
      case "diamante":
        return "R$ 45,90/mês";
      case "diamante_anual":
        return "R$ 459,00/ano (2 meses grátis)";
      default:
        return "";
    }
  };

  const formatPlanoName = (plano: PlanoType) => {
    switch (plano) {
      case "gold":
        return "Open Ouro";
      case "diamante":
        return "Open Diamante";
      case "diamante_anual":
        return "Open Diamante Anual";
      default:
        return "";
    }
  };

  if (!isSdkReady) {
    return <div>Carregando formulário de pagamento...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Assinar {formatPlanoName(plano)}
        </h2>
        <p className="text-gray-600">
          Valor: {formatPlanoValue(plano)}
        </p>
      </div>

      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={handleFormError}
      />

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Processando pagamento...</p>
        </div>
      )}
    </div>
  );
}