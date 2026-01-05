"use client";

import { Lock, Smartphone, RefreshCw } from "lucide-react"; // Added Refresh icon
import { QRCodeSVG } from "qrcode.react";

interface ConnectScreenProps {
  qrCode?: string | null;
  status: string;
}

export default function ConnectScreen({ qrCode, status }: ConnectScreenProps) {

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#ecedf0] text-[#41525d] p-4 font-sans">
      <div className="w-full max-w-[1000px] overflow-hidden rounded-[3px] bg-white shadow-lg flex flex-col md:flex-row h-[70vh] min-h-[500px]">

        {/* Left Side - Instructions */}
        <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-light text-[#41525d]">Use o WhatsApp no seu computador</span>
            </div>

            <ol className="list-decimal ml-6 space-y-5 text-lg leading-6 text-[#3b4a54]">
              <li>Abra o WhatsApp no seu celular</li>
              <li>
                Toque em <strong>Menu</strong> <span className="px-1 bg-gray-100 rounded text-sm">⋮</span> no Android ou <strong>Configurações</strong> <span className="px-1 bg-gray-100 rounded text-sm">⚙️</span> no iPhone
              </li>
              <li>Toque em <strong>Aparelhos conectados</strong> e depois em <strong>Conectar um aparelho</strong></li>
              <li>Aponte seu celular para esta tela para capturar o código</li>
            </ol>
          </div>

          <div className="mt-8 text-[#008069] font-medium text-base hover:underline cursor-pointer">
            Precisa de ajuda para começar?
          </div>
        </div>

        {/* Right Side - QR Code */}
        <div className="flex-none w-full md:w-[400px] p-10 md:p-14 flex flex-col items-center justify-center border-l border-gray-100">
          <div className="relative">
            <div className="w-[264px] h-[264px] bg-white border border-[#e1e1e1] relative mx-auto flex items-center justify-center">
              {status === 'READY' || status === 'AUTHENTICATED' ? (
                <div className="flex flex-col items-center justify-center text-[#00a884]">
                  <Smartphone className="w-16 h-16 mb-4 animate-pulse" />
                  <span>Conectado! Redirecionando...</span>
                </div>
              ) : qrCode ? (
                <QRCodeSVG value={qrCode} size={250} level="L" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <div className="animate-spin mb-4">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <span>Carregando QR Code...</span>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-[#8696a0] text-sm">
                <Lock className="w-3 h-3" />
                <span>Suas mensagens pessoais são protegidas com a criptografia de ponta a ponta.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Accent Top */}
      <div className="fixed top-0 left-0 w-full h-[127px] bg-[#00a884] -z-10"></div>
    </div>
  );
}
