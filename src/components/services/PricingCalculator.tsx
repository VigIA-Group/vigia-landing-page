import React, { useState, useMemo } from "react";

const RATE = 10.2;

const MOD_LIST = [
  { id: "01", label: "OCR y Códigos" },
  { id: "02", label: "Clasificación" },
  { id: "03", label: "Intrusión" },
  { id: "04", label: "Robos/Abandono" },
  { id: "05", label: "Caídas" },
  { id: "06", label: "Análisis Personas" },
];

type HorarioType = "c" | "e" | "247";
type CamHorarioType = "global" | HorarioType;

interface Camera {
  id: number;
  mods: string[];
  horario: CamHorarioType;
}

export default function PricingCalculator() {
  // Estado Inicial
  const [defaultHorario, setDefaultHorario] = useState<HorarioType>("c");
  const [currency, setCurrency] = useState<"bs" | "usd">("bs");
  const [nextId, setNextId] = useState(3);
  const [cameras, setCameras] = useState<Camera[]>([
    { id: 1, mods: ["01", "03"], horario: "global" },
    { id: 2, mods: ["03"], horario: "global" },
  ]);

  // --- LÓGICA DE PRECIOS POR CÁMARA ---
  const totals = useMemo(() => {
    const numCameras = cameras.length;

    // 1. Descuento por Volumen (Depende del total de cámaras)
    let descVolPercent = 0;
    if (numCameras >= 61) descVolPercent = 0.25;
    else if (numCameras >= 31) descVolPercent = 0.2;
    else if (numCameras >= 16) descVolPercent = 0.15;
    else if (numCameras >= 5) descVolPercent = 0.1;

    let subtotalListaUsd = 0;
    let totalDescVolUsd = 0;
    let totalDescHorUsd = 0;
    let finalTotalUsd = 0;

    const getDescHorPercent = (h: string) => {
      if (h === "c") return 0.15;
      if (h === "e") return 0.08;
      return 0; // 24/7
    };

    // 2. Cálculo cámara por cámara
    const perCameraDetails = cameras.map((cam) => {
      const nMods = cam.mods.length;

      // Precio Base de la cámara (12$ base con 1 mod, +6$ por mod extra)
      const baseUsd = nMods === 0 ? 0 : 12 + (nMods - 1) * 6;
      subtotalListaUsd += baseUsd;

      // Aplicar descuento por volumen a esta cámara
      const volDiscountUsd = baseUsd * descVolPercent;
      totalDescVolUsd += volDiscountUsd;
      const afterVolUsd = baseUsd - volDiscountUsd;

      // Aplicar descuento por horario a esta cámara
      const activeHorario =
        cam.horario === "global" ? defaultHorario : cam.horario;
      const horDiscountRate = getDescHorPercent(activeHorario);
      const horDiscountUsd = afterVolUsd * horDiscountRate;
      totalDescHorUsd += horDiscountUsd;

      // Precio final de la cámara
      const finalCamUsd = afterVolUsd - horDiscountUsd;
      finalTotalUsd += finalCamUsd;

      return {
        ...cam,
        baseUsd,
        finalCamUsd,
      };
    });

    return {
      numCameras,
      subtotalListaUsd,
      descVolPercent,
      totalDescVolUsd,
      totalDescHorUsd,
      finalTotalUsd,
      finalTotalBs: finalTotalUsd * RATE,
      perCameraDetails,
    };
  }, [cameras, defaultHorario]);

  // Ayudante de formateo
  const formatPrice = (usdAmount: number) => {
    if (currency === "usd") return `$${usdAmount.toFixed(2)}`;
    return `Bs ${(usdAmount * RATE).toFixed(2)}`;
  };

  // --- HANDLERS ---
  const addCamera = () => {
    setCameras([...cameras, { id: nextId, mods: [], horario: "global" }]);
    setNextId(nextId + 1);
  };

  const removeCamera = (idToRemove: number) => {
    if (cameras.length <= 1) return; // Mínimo 1 cámara
    setCameras(cameras.filter((c) => c.id !== idToRemove));
  };

  const toggleMod = (camId: number, modId: string) => {
    setCameras(
      cameras.map((c) => {
        if (c.id === camId) {
          const hasMod = c.mods.includes(modId);
          return {
            ...c,
            mods: hasMod
              ? c.mods.filter((m) => m !== modId)
              : [...c.mods, modId],
          };
        }
        return c;
      }),
    );
  };

  const updateCameraHorario = (camId: number, newHorario: CamHorarioType) => {
    setCameras(
      cameras.map((c) => (c.id === camId ? { ...c, horario: newHorario } : c)),
    );
  };

  return (
    <section className="bg-background text-text py-24 px-6 relative overflow-hidden font-sans">
      {/* Glow / Decoración de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-5xl mx-auto mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4 text-text tracking-tight">
          Estima tus costos
        </h2>
        <p className="text-sm md:text-base text-muted max-w-xl mx-auto font-light">
          Tu factura mensual dependerá de las cámaras conectadas y los módulos
          de IA activos, sin sorpresas ni costos ocultos.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
        {/* LADO IZQUIERDO: CONTROLES */}
        <div className="flex flex-col gap-6 w-full">
          {/* Horario por Defecto Global */}
          <div className="bg-surface-2 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-text">
                Horario por defecto
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Este horario se aplicará a todas las cámaras a menos que
              especifiques lo contrario en una cámara particular.
            </p>
            <div className="relative">
              <select
                value={defaultHorario}
                onChange={(e) =>
                  setDefaultHorario(e.target.value as HorarioType)
                }
                className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-colors bg-surface/50 text-text border border-primary/30 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="c" className="bg-surface text-text">
                  Comercial (≤10h/día) — 15% Dcto.
                </option>
                <option value="e" className="bg-surface text-text">
                  Extendido (11-18h/día) — 8% Dcto.
                </option>
                <option value="247" className="bg-surface text-text">
                  24/7 (Continuo) — Sin Dcto.
                </option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* LISTA DE CÁMARAS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-text">
                Tus Cámaras ({totals.numCameras})
              </span>
            </div>

            {cameras.map((cam, index) => {
              const camDetails = totals.perCameraDetails.find(
                (c) => c.id === cam.id,
              );

              return (
                <div
                  key={cam.id}
                  className="bg-surface border border-text/10 rounded-xl p-5 transition-colors hover:border-text/20"
                >
                  {/* Cabecera Cámara */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-text/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold text-text">
                        Cámara {index + 1}
                      </span>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {camDetails?.finalCamUsd === 0
                          ? "Sin módulos"
                          : formatPrice(camDetails?.finalCamUsd || 0)}
                      </span>
                    </div>
                    {cameras.length > 1 && (
                      <button
                        onClick={() => removeCamera(cam.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-danger/70 hover:bg-danger/10 hover:text-danger transition-colors"
                        title="Eliminar cámara"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Select Módulos */}
                    <div>
                      <span className="block text-xs text-muted mb-2 uppercase tracking-wider font-semibold">
                        Módulos Activos
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {MOD_LIST.map((mod) => {
                          const isActive = cam.mods.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              onClick={() => toggleMod(cam.id, mod.id)}
                              className={`px-2.5 py-1 text-[11px] rounded-md border transition-all duration-200 ${
                                isActive
                                  ? "bg-primary border-primary text-text shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                  : "bg-surface-2 border-text/10 text-muted hover:border-text/30 hover:text-text"
                              }`}
                            >
                              {mod.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Select Horario Específico */}
                    <div>
                      <span className="block text-xs text-muted mb-2 uppercase tracking-wider font-semibold">
                        Horario de Monitoreo
                      </span>
                      <div className="relative">
                        <select
                          value={cam.horario}
                          onChange={(e) =>
                            updateCameraHorario(
                              cam.id,
                              e.target.value as CamHorarioType,
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-md outline-none transition-colors bg-surface-2 text-text border border-text/10 focus:border-primary appearance-none cursor-pointer"
                        >
                          <option
                            value="global"
                            className="bg-surface text-text"
                          >
                            Usar horario por defecto
                          </option>
                          <option value="c" className="bg-surface text-text">
                            Comercial (≤10h/día)
                          </option>
                          <option value="e" className="bg-surface text-text">
                            Extendido (11-18h/día)
                          </option>
                          <option value="247" className="bg-surface text-text">
                            24/7 (Continuo)
                          </option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {/* Advertencia si difiere del global */}
                      {cam.horario !== "global" && (
                        <p className="mt-1.5 text-[10px] text-orange-400/90 flex items-start gap-1 leading-tight">
                          <svg
                            className="w-3 h-3 flex-shrink-0 mt-[1px]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Este horario está afectando únicamente a esta cámara.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addCamera}
            className="w-full py-3 mt-2 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar nueva cámara
          </button>
        </div>

        {/* LADO DERECHO: TARJETA DE PRECIO (Fija en Desktop) */}
        <div className="relative w-full lg:sticky lg:top-24">
          <div className="hidden lg:block absolute top-6 -right-6 bottom-[-1.5rem] left-6 border-2 border-text/10 rounded-2xl z-0 pointer-events-none"></div>

          <div className="relative z-10 bg-text text-background rounded-2xl p-8 shadow-2xl flex flex-col items-start border border-text/20">
            {/* Moneda Toggle */}
            <div className="absolute top-6 right-6 flex bg-background/10 rounded-lg p-0.5 border border-background/20">
              <button
                onClick={() => setCurrency("bs")}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  currency === "bs"
                    ? "bg-background text-text shadow-sm"
                    : "text-background/60 hover:text-background"
                }`}
              >
                Bs
              </button>
              <button
                onClick={() => setCurrency("usd")}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  currency === "usd"
                    ? "bg-background text-text shadow-sm"
                    : "text-background/60 hover:text-background"
                }`}
              >
                USD
              </button>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/50 mb-4">
              Total Mensual Estimado
            </span>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-background transition-all">
                {currency === "usd" ? "$" : "Bs "}
                {currency === "usd"
                  ? totals.finalTotalUsd.toFixed(2)
                  : totals.finalTotalBs.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-background/60">
                / mes
              </span>
            </div>

            <div className="text-xs font-mono text-background/60 mb-8 border border-background/20 px-3 py-1 rounded-full transition-all">
              ≈{" "}
              {currency === "usd"
                ? `Bs ${totals.finalTotalBs.toFixed(2)}`
                : `$ ${totals.finalTotalUsd.toFixed(2)} USD`}
            </div>

            {/* Desglose de Precios */}
            <div className="w-full space-y-3 pt-6 border-t border-background/15 text-[13px]">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-background/40 mb-2">
                Desglose de Precios
              </span>

              <div className="flex justify-between items-center text-background/80">
                <span>Subtotal lista ({totals.numCameras} cám.)</span>
                <span className="font-mono">
                  {formatPrice(totals.subtotalListaUsd)}
                </span>
              </div>

              {totals.totalDescVolUsd > 0 ? (
                <div className="flex justify-between items-center text-primary-dark font-medium">
                  <span>Dcto. Volumen (-{totals.descVolPercent * 100}%)</span>
                  <span className="font-mono">
                    -{formatPrice(totals.totalDescVolUsd)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-background/40 text-xs">
                  <span>Dcto. Volumen</span>
                  <span>{"0% (< 5 cám.)"}</span>
                </div>
              )}

              {totals.totalDescHorUsd > 0 && (
                <div className="flex justify-between items-center text-primary-dark font-medium">
                  <span>Dcto. Horarios (Acumulado)</span>
                  <span className="font-mono">
                    -{formatPrice(totals.totalDescHorUsd)}
                  </span>
                </div>
              )}
            </div>

            {/* Hint Final */}
            <div className="mt-8 text-[11px] text-background/50 leading-relaxed max-w-[90%]">
              {totals.descVolPercent === 0 ? (
                <span className="text-primary-dark/80 font-medium">
                  Agrega hasta 5 cámaras para tu primer nivel de descuento por
                  volumen.
                </span>
              ) : (
                `¡Excelente! Has alcanzado un ${totals.descVolPercent * 100}% de descuento por volumen.`
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
