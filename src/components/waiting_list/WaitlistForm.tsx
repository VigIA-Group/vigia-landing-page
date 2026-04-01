import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";

export interface WaitingList {
  title: string;
  description: string;
  benefit: {
    discount: string;
    priority_access: string;
    exclusive_content: string;
  };
  call_to_action: string;
}

interface WaitlistFormProps {
  data: WaitingList;
}

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

export default function WaitlistForm({ data }: WaitlistFormProps) {
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
      timer = setTimeout(() => {
        setStatus("idle");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const phoneRegex = /^[67]\d{7}$/;
    if (!formData.phone) {
      newErrors.phone = "El número es requerido.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone =
        "Ingrese un celular válido (8 dígitos, inicia con 6 o 7).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El correo es requerido.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido.";
    }

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
    if (name === "phone" && value && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    try {
      await addDoc(collection(db, "waitlist"), {
        phone: `+591${formData.phone}`,
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

  return (
    // Contenedor principal dividido en dos columnas en escritorio
    <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
      {/* Columna Izquierda: Información */}
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-display font-bold mb-3 text-[var(--color-text)]">
          {data.title}
        </h2>
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          {data.description}
        </p>

        <ul className="space-y-3 text-sm text-[var(--color-text)]/85">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)] mt-0.5">✓</span>
            <span>{data.benefit.priority_access}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)] mt-0.5">✓</span>
            <span>{data.benefit.discount}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)] mt-0.5">✓</span>
            <span>{data.benefit.exclusive_content}</span>
          </li>
        </ul>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl border border-[var(--color-primary)]/20 backdrop-blur-sm relative overflow-hidden bg-transparent">
        {/* Success Message Flotante (limitado a la tarjeta del formulario) */}
        <div
          className={`absolute top-0 left-0 w-full p-4 flex flex-col items-center justify-center bg-[var(--color-surface)] z-20 transition-all duration-500 ease-in-out border-b border-[var(--color-primary)] ${status === "success" ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
        >
          <div className="w-8 h-8 mb-2 rounded-full flex items-center justify-center bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
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
          <span className="font-medium text-sm text-[var(--color-text)]">
            ¡Súper! Te has unido a la lista.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Número de Celular
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-0 inset-y-0 flex items-center pl-2 pr-1 border-r border-[var(--color-primary)]/20 bg-[var(--color-surface)]/30 rounded-l-lg pointer-events-none w-[72px] justify-center">
                <span className="text-base mr-1">🇧🇴</span>
                <span className="text-xs font-medium text-[var(--color-text)]">
                  +591
                </span>
              </div>
              <input
                type="tel"
                name="phone"
                maxLength={8}
                value={formData.phone}
                onChange={handleChange}
                placeholder="71234567"
                // Reducido a py-2 y ajustado el padding-left (pl-[76px])
                className={`w-full pl-[76px] pr-3 py-2 text-sm rounded-lg outline-none transition-colors bg-[var(--color-surface)]/20 text-[var(--color-text)] border ${errors.phone ? "border-red-500" : "border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"}`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@empresa.com"
              // Reducido a py-2 px-3
              className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors bg-[var(--color-surface)]/20 text-[var(--color-text)] border ${errors.email ? "border-red-500" : "border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Sector o Industria
            </label>
            <textarea
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Ej. Retail, Minería, Condominios..."
              rows={2} // Reducido a 2 filas para que sea más compacto
              // Reducido a py-2 px-3
              className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors resize-none bg-[var(--color-surface)]/20 text-[var(--color-text)] border ${errors.sector ? "border-red-500" : "border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"}`}
            />
            {errors.sector && (
              <p className="mt-1 text-xs text-red-400">{errors.sector}</p>
            )}
          </div>

          {status === "error" && (
            <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">
              Hubo un problema de conexión. Por favor, intenta de nuevo.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            // Reducido a py-2.5
            className="w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text)]"
          >
            {status === "loading" ? (
              <svg
                className="animate-spin h-5 w-5 text-[var(--color-text)]"
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
              "Regístrate Hoy"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
