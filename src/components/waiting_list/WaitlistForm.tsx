import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Función para obtener un color de fondo basado en el correo
const getAvatarColor = (email: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const charCode = email.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

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
  const [recentUsers, setRecentUsers] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Efecto para animaciones GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".animate-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", // La animación inicia cuando el 85% superior del elemento entra en el viewport
        },
      });
    }, containerRef);

    return () => ctx.revert(); // Limpieza para Astro/React
  }, []);

  // Efecto para restaurar el estado de éxito
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === "success") {
      timer = setTimeout(() => setStatus("idle"), 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  // Efecto para recuperar a las personas en la lista
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const q = query(
          collection(db, "waitlist"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const querySnapshot = await getDocs(q);
        const users: string[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().email) users.push(doc.data().email);
        });
        // Si no hay datos, añadimos algunos de prueba solo para el diseño inicial,
        // puedes quitar este fallback si tienes datos reales.
        setRecentUsers(
          users.length > 0
            ? users
            : ["juan@mail.com", "ana@mail.com", "carlos@mail.com"],
        );
      } catch (error) {
        console.error("Error al obtener la lista de espera:", error);
      }
    };
    fetchWaitlist();
  }, [status]); // Volvemos a hacer fetch cuando status cambie (ej: nuevo registro)

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
    <div
      ref={containerRef}
      className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
    >
      {/* Lado Izquierdo: Textos y Beneficios */}
      <div className="flex flex-col justify-center">
        <h2 className="animate-item text-3xl font-display font-bold mb-3 text-text">
          {data.title}
        </h2>
        <p className="animate-item mb-6 text-sm text-muted">
          {data.description}
        </p>

        <ul className="animate-item space-y-3 text-sm text-text/85">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>{data.benefit.priority_access}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>{data.benefit.discount}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>{data.benefit.exclusive_content}</span>
          </li>
        </ul>

        {/* Sección de Avatares */}
        {recentUsers.length > 0 && (
          <div className="animate-item mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              {recentUsers.map((email, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-text text-xs font-bold border-2 border-text shadow-sm ${getAvatarColor(email)}`}
                  title={email}
                >
                  {email.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text">
                + 50
              </span>
              <span className="text-xs text-muted">
                en lista de espera
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lado Derecho: Formulario (Ahora más compacto) */}
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

        {/* Reducimos el space-y de 4 a 3 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[13px] font-medium mb-0.5 text-text">
              Número de Celular
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-0 inset-y-0 flex items-center pl-2 pr-1 border-r border-primary/20 bg-surface/30 rounded-l-lg pointer-events-none w-[72px] justify-center">
                <span className="text-sm mr-1">🇧🇴</span>
                <span className="text-xs font-medium text-text">
                  +591
                </span>
              </div>
              {/* Padding ajustado en py-1.5 */}
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
              <p className="mt-0.5 text-[11px] text-danger-light">{errors.phone}</p>
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
              <p className="mt-0.5 text-[11px] text-danger-light">{errors.email}</p>
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
              <p className="mt-0.5 text-[11px] text-danger-light">{errors.sector}</p>
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
    </div>
  );
}
