import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import { splitFullName } from "../../utils/NameSplitter";

interface FormData {
  fullname: string;
  email: string;
  phone: string;
  company: string;
  jobtitle: string;
}

interface FormErrors {
  fullname?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
}

interface Props {
  callAction: string;
  size?: "md" | "lg";
}

export default function ContactsForm({ callAction, size = "md" }: Props) {
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
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

    if (!formData.fullname.trim())
      newErrors.fullname = "El nombre completo es requerido.";

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
    const { firstNames, lastNames } = splitFullName(formData.fullname);
    const finalJobTitle = formData.jobtitle.trim() || "No especificado";

    try {
      await addDoc(collection(db, "contacts"), {
        firstname: firstNames,
        lastname: lastNames,
        email: formData.email,
        phone: fullPhone,
        company: formData.company,
        jobtitle: finalJobTitle,
        createdAt: serverTimestamp(),
      });

      const res = await fetch("https://createcontact-jszmmxveuq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: firstNames,
          lastname: lastNames,
          email: formData.email,
          phone: `+591${formData.phone}`,
          company: formData.company,
          jobtitle: finalJobTitle,
        }),
      });

      if (!res.ok) throw new Error("Error al registrar");

      setStatus("success");
      setFormData({
        fullname: "",
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

  // Mantiene los mismos márgenes compactos, pero sube el tamaño de la fuente
  const s = {
    md: {
      container: "max-w-md p-4 rounded-2xl",
      formGap: "space-y-3",
      gridGap: "gap-2",
      label: "text-[13px] mb-0.5",
      input: "px-3 py-1.5 text-sm rounded-lg",
      error: "mt-0.5 text-[11px]",
      phonePrefixW: "w-[72px]",
      phonePrefixPl: "pl-[76px]",
      phoneIconText: "text-sm mr-1",
      phoneCodeText: "text-xs",
      button: "mt-2 px-5 py-2 text-sm rounded-lg",
      successBanner: "p-3",
      successIcon: "w-7 h-7 mb-1",
      successText: "text-sm",
    },
    lg: {
      container: "max-w-lg p-5 rounded-2xl", // Mantiene el padding contenido
      formGap: "space-y-3.5", // Espaciado ajustado
      gridGap: "gap-3", // Gap de columnas contenido
      label: "text-[15px] mb-0.5", // Fuente más grande, mismo margen inferor
      input: "px-3.5 py-2 text-base rounded-lg", // Input con fuente base y padding justo
      error: "mt-0.5 text-xs",
      phonePrefixW: "w-[80px]", // Ancho ajustado para el prefijo de país grande
      phonePrefixPl: "pl-[84px]",
      phoneIconText: "text-base mr-1.5",
      phoneCodeText: "text-[13px]",
      button: "mt-2.5 px-5 py-2.5 text-base font-semibold rounded-lg",
      successBanner: "p-4",
      successIcon: "w-8 h-8 mb-1",
      successText: "text-base font-medium",
    },
  }[size];

  const inputClass = (field: keyof FormErrors) =>
    `w-full outline-none transition-colors bg-surface/20 text-text border ${s.input} ${
      errors[field] ? "border-danger" : "border-primary/30 focus:border-primary"
    }`;

  return (
    <div
      className={`animate-item w-full mx-auto border border-primary/20 backdrop-blur-sm relative overflow-hidden bg-transparent text-left ${s.container}`}
    >
      <div
        className={`absolute top-0 left-0 w-full flex flex-col items-center justify-center bg-surface z-20 transition-all duration-500 ease-in-out border-b border-primary ${
          s.successBanner
        } ${
          status === "success"
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div
          className={`rounded-full flex items-center justify-center bg-primary/20 text-primary ${s.successIcon}`}
        >
          <svg
            className="w-[55%] h-[55%]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className={`text-text ${s.successText}`}>
          ¡Súper! Te has unido a la lista.
        </span>
      </div>

      <form onSubmit={handleSubmit} className={s.formGap}>
        <div>
          <label className={`block font-medium text-text ${s.label}`}>
            Nombre Completo
          </label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Daniel Paredes"
            className={inputClass("fullname")}
          />
          {errors.fullname && (
            <p className={`text-danger-light ${s.error}`}>{errors.fullname}</p>
          )}
        </div>

        <div>
          <label className={`block font-medium text-text ${s.label}`}>
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
            <p className={`text-danger-light ${s.error}`}>{errors.email}</p>
          )}
        </div>

        <div>
          <label className={`block font-medium text-text ${s.label}`}>
            Número de Celular
          </label>
          <div className="relative flex items-center">
            <div
              className={`absolute left-0 inset-y-0 flex items-center pl-2 pr-1 border-r border-primary/20 bg-surface/30 rounded-l-lg pointer-events-none justify-center ${s.phonePrefixW}`}
            >
              <span className={s.phoneIconText}>🇧🇴</span>
              <span className={`font-medium text-text ${s.phoneCodeText}`}>
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
              className={`w-full pr-3 outline-none transition-colors bg-surface/20 text-text border ${
                s.phonePrefixPl
              } ${s.input} ${
                errors.phone
                  ? "border-danger"
                  : "border-primary/30 focus:border-primary"
              }`}
            />
          </div>
          {errors.phone && (
            <p className={`text-danger-light ${s.error}`}>{errors.phone}</p>
          )}
        </div>

        <div className={`grid grid-cols-2 ${s.gridGap}`}>
          <div>
            <label className={`block font-medium text-text ${s.label}`}>
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
              <p className={`text-danger-light ${s.error}`}>{errors.company}</p>
            )}
          </div>

          <div>
            <label className={`block font-medium text-text ${s.label}`}>
              Cargo
            </label>
            <input
              type="text"
              name="jobtitle"
              value={formData.jobtitle}
              onChange={handleChange}
              placeholder="Gerente"
              className={inputClass("jobtitle")}
            />
            {errors.jobtitle && (
              <p className={`text-danger-light ${s.error}`}>
                {errors.jobtitle}
              </p>
            )}
          </div>
        </div>

        {status === "error" && (
          <p className="text-[12px] text-danger-light bg-danger-light/10 p-2.5 rounded-lg">
            Hubo un problema de conexión. Por favor, intenta de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`
            cta-gradient-form w-full shadow-sm transition-all duration-300
            hover:scale-[1.01] hover:shadow-md active:scale-[0.99]
            flex justify-center items-center
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
            ${s.button}
          `}
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
            callAction
          )}
        </button>
      </form>
    </div>
  );
}
