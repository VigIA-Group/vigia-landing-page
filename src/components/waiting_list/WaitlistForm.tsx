import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === "success") {
      timer = setTimeout(() => setStatus("idle"), 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const phoneRegex = /^[67]\d{7}$/;
    if (!formData.phone) newErrors.phone = "El número es requerido.";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Ingrese celular válido (8 dígitos).";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "El correo es requerido.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Correo electrónico inválido.";

    if (!formData.sector.trim()) newErrors.sector = "Describa su sector.";
    else if (formData.sector.length < 5) newErrors.sector = "Muy corta.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "phone" && value && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("loading");

    const payload = {
      phone: `+591${formData.phone}`,
      email: formData.email,
      sector: formData.sector,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "waitlist"), payload);

      setStatus("success");
      setFormData({ phone: "", email: "", sector: "" });
    } catch (error: any) {
      console.error("❌ 5. ERROR CRÍTICO AL GUARDAR EN FIREBASE:");
      console.error("-> Código del error:", error.code);
      console.error("-> Mensaje:", error.message);
      console.error("-> Objeto de error completo:", error);
      setStatus("error");
    }
  };

  return (
    <div className="animate-item w-full max-w-md mx-auto p-4 md:p-4 rounded-2xl border border-primary/20 backdrop-blur-sm relative overflow-hidden bg-transparent">
      <div
        className={`absolute top-0 left-0 w-full p-3 flex flex-col items-center justify-center bg-surface z-20 transition-all duration-500 ease-in-out border-b border-primary ${status === "success" ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="w-7 h-7 mb-1 rounded-full flex items-center justify-center bg-primary/20 text-primary">
          <svg
            className="w-4 h-4"
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
        <span className="font-medium text-sm text-text">
          ¡Súper! Te has unido a la lista.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[13px] font-medium mb-0.5 text-text">
            Número de Celular
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-0 inset-y-0 flex items-center pl-2 pr-1 border-r border-primary/20 bg-surface/30 rounded-l-lg pointer-events-none w-[72px] justify-center">
              <span className="text-sm mr-1">🇧🇴</span>
              <span className="text-xs font-medium text-text">+591</span>
            </div>
            <input
              type="tel"
              name="phone"
              maxLength={8}
              value={formData.phone}
              onChange={handleChange}
              placeholder="71234567"
              className={`w-full pl-[76px] pr-3 py-1.5 text-sm rounded-lg outline-none transition-colors bg-surface/20 text-text border ${errors.phone ? "border-danger" : "border-primary/30 focus:border-primary"}`}
            />
          </div>
          {errors.phone && (
            <p className="mt-0.5 text-[11px] text-danger-light">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium mb-0.5 text-text">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
            className={`w-full px-3 py-1.5 text-sm rounded-lg outline-none transition-colors bg-surface/20 text-text border ${errors.email ? "border-danger" : "border-primary/30 focus:border-primary"}`}
          />
          {errors.email && (
            <p className="mt-0.5 text-[11px] text-danger-light">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium mb-0.5 text-text">
            Sector o Industria
          </label>
          <textarea
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            placeholder="Ej. Retail, Minería..."
            rows={1}
            className={`w-full px-3 py-1.5 text-sm rounded-lg outline-none transition-colors resize-none bg-surface/20 text-text border ${errors.sector ? "border-danger" : "border-primary/30 focus:border-primary"}`}
          />
          {errors.sector && (
            <p className="mt-0.5 text-[11px] text-danger-light">
              {errors.sector}
            </p>
          )}
        </div>

        {status === "error" && (
          <p className="text-[11px] text-danger-light bg-danger-light/10 p-2 rounded-lg">
            Hubo un problema de conexión. Por favor, intenta de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full mt-2 py-2 px-4 text-sm font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary hover:bg-primary-dark text-text shadow-sm hover:shadow-md"
        >
          {status === "loading" ? (
            <svg
              className="animate-spin h-5 w-5 text-text"
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
            "Reserva un Espacio"
          )}
        </button>
      </form>
    </div>
  );
}
