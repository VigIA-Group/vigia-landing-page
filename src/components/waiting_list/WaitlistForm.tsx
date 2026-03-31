import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";

interface FormData {
  phone: string;
  email: string;
  sector: string;
}

interface FormErrors {
  phone?: string;
  email?: string;
  sector?: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    email: "",
    sector: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar celular Bolivia (8 dígitos, empieza con 6 o 7)
    const phoneRegex = /^[67]\d{7}$/;
    if (!formData.phone) {
      newErrors.phone = "El número es requerido.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone =
        "Ingrese un celular válido (8 dígitos, inicia con 6 o 7).";
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El correo es requerido.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido.";
    }

    // Validar sector
    if (!formData.sector.trim()) {
      newErrors.sector = "Por favor, describa su sector.";
    } else if (formData.sector.length < 5) {
      newErrors.sector = "La descripción es muy corta.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Si es teléfono, solo permitir números
    if (name === "phone" && value && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    try {
      // Guarda en la colección "waitlist"
      await addDoc(collection(db, "waitlist"), {
        phone: `+591${formData.phone}`, // Guardamos con el código de país
        email: formData.email,
        sector: formData.sector,
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setFormData({ phone: "", email: "", sector: "" });
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#0a0514] border border-purple-500/30 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
        <div className="w-16 h-16 mx-auto mb-4 text-purple-400 bg-purple-500/10 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          ¡Gracias por unirte!
        </h3>
        <p className="text-gray-400">
          Te contactaremos pronto con novedades de VigIA.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 px-6 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[#0a0514] border border-purple-500/20 shadow-[0_0_40px_rgba(124,58,237,0.1)]">
      <h2 className="text-3xl font-display font-bold text-white mb-2">
        Únete a la Lista de Espera
      </h2>
      <p className="text-gray-400 mb-8 text-sm">
        Sé de los primeros en transformar tus cámaras en inteligencia.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Número de Celular
          </label>
          <div className="relative flex items-center">
            {/* Bandera y código */}
            <div className="absolute left-0 inset-y-0 flex items-center pl-3 pr-2 border-r border-gray-700 bg-gray-800/50 rounded-l-lg pointer-events-none">
              <span className="text-lg mr-1">🇧🇴</span>
              <span className="text-gray-300 text-sm font-medium">+591</span>
            </div>
            <input
              type="tel"
              name="phone"
              maxLength={8}
              value={formData.phone}
              onChange={handleChange}
              placeholder="71234567"
              className={`w-full pl-24 pr-4 py-3 bg-gray-900/50 border ${errors.phone ? "border-red-500/50 focus:border-red-500" : "border-gray-700 focus:border-purple-500"} rounded-lg text-white outline-none transition-colors placeholder:text-gray-600`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.email ? "border-red-500/50 focus:border-red-500" : "border-gray-700 focus:border-purple-500"} rounded-lg text-white outline-none transition-colors placeholder:text-gray-600`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Sector o Industria
          </label>
          <textarea
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            placeholder="Ej. Retail, Minería, Condominios..."
            rows={3}
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.sector ? "border-red-500/50 focus:border-red-500" : "border-gray-700 focus:border-purple-500"} rounded-lg text-white outline-none transition-colors placeholder:text-gray-600 resize-none`}
          />
          {errors.sector && (
            <p className="mt-1 text-xs text-red-400">{errors.sector}</p>
          )}
        </div>

        {/* Error General */}
        {status === "error" && (
          <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
            Hubo un problema de conexión. Por favor, intenta de nuevo.
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Solicitar Acceso"
          )}
        </button>
      </form>
    </div>
  );
}
