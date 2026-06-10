import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  jobtitle: string;
}

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    jobtitle: "",
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

    if (!formData.firstname.trim())
      newErrors.firstname = "El nombre es requerido.";

    if (!formData.lastname.trim())
      newErrors.lastname = "El apellido es requerido.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "El correo es requerido.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Correo electrónico inválido.";

    const phoneRegex = /^[67]\d{7}$/;
    if (!formData.phone) newErrors.phone = "El número es requerido.";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Ingrese celular válido (8 dígitos).";

    if (!formData.company.trim())
      newErrors.company = "La empresa es requerida.";

    if (!formData.jobtitle.trim())
      newErrors.jobtitle = "El cargo es requerido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const fullPhone = `+591 ${formData.phone}`;

    try {
      // 1. Save to Firebase "contacts" collection
      await addDoc(collection(db, "contacts"), {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: fullPhone,
        company: formData.company,
        jobtitle: formData.jobtitle,
        createdAt: serverTimestamp(),
      });

      const res = await fetch("https://createcontact-jszmmxveuq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: `+591${formData.phone}`,
          company: formData.company,
          jobtitle: formData.jobtitle,
        }),
      });

      if (!res.ok) throw new Error("Error al registrar");

      setStatus("success");
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        company: "",
        jobtitle: "",
      });
    } catch (error: any) {
      console.error("Error al guardar contacto:", error);
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-3 py-1.5 text-sm rounded-lg outline-none transition-colors bg-surface/20 text-text border ${
      errors[field] ? "border-danger" : "border-primary/30 focus:border-primary"
    }`;

  return (
    <div className="animate-item w-full max-w-md mx-auto p-4 md:p-4 rounded-2xl border border-primary/20 backdrop-blur-sm relative overflow-hidden bg-transparent text-left">
      {/* Success banner */}
      <div
        className={`absolute top-0 left-0 w-full p-3 flex flex-col items-center justify-center bg-surface z-20 transition-all duration-500 ease-in-out border-b border-primary ${
          status === "success"
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
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
        {/* Nombre + Apellido — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[13px] font-medium mb-0.5 text-text">
              Nombre
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Jane"
              className={inputClass("firstname")}
            />
            {errors.firstname && (
              <p className="mt-0.5 text-[11px] text-danger-light">
                {errors.firstname}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-0.5 text-text">
              Apellido
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Doe"
              className={inputClass("lastname")}
            />
            {errors.lastname && (
              <p className="mt-0.5 text-[11px] text-danger-light">
                {errors.lastname}
              </p>
            )}
          </div>
        </div>

        {/* Email — full width */}
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
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="mt-0.5 text-[11px] text-danger-light">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone — full width with prefix */}
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
              className={`w-full pl-[76px] pr-3 py-1.5 text-sm rounded-lg outline-none transition-colors bg-surface/20 text-text border ${
                errors.phone
                  ? "border-danger"
                  : "border-primary/30 focus:border-primary"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-0.5 text-[11px] text-danger-light">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Empresa + Cargo — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[13px] font-medium mb-0.5 text-text">
              Empresa
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme S.A."
              className={inputClass("company")}
            />
            {errors.company && (
              <p className="mt-0.5 text-[11px] text-danger-light">
                {errors.company}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-0.5 text-text">
              Cargo
            </label>
            <input
              type="text"
              name="jobtitle"
              value={formData.jobtitle}
              onChange={handleChange}
              placeholder="CEO"
              className={inputClass("jobtitle")}
            />
            {errors.jobtitle && (
              <p className="mt-0.5 text-[11px] text-danger-light">
                {errors.jobtitle}
              </p>
            )}
          </div>
        </div>

        {/* Error general */}
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            "Reserva un Espacio"
          )}
        </button>
      </form>
    </div>
  );
}
