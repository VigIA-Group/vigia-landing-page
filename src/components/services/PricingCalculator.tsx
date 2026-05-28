import { useState, useMemo } from "react";

// Tasa de cambio actualizada según tu código anterior
const RATE = 10.4;

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
  const [defaultHorario, setDefaultHorario] = useState<HorarioType>("c");
  const [currency, setCurrency] = useState<"bs" | "usd">("bs");
  const [nextId, setNextId] = useState(3);
  const [cameras, setCameras] = useState<Camera[]>([
    { id: 1, mods: ["01", "03"], horario: "global" },
    { id: 2, mods: ["03"], horario: "global" },
  ]);

  const totals = useMemo(() => {
    const numCameras = cameras.length;
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

    const perCameraDetails = cameras.map((cam) => {
      const nMods = cam.mods.length;
      const baseUsd = nMods === 0 ? 0 : 12 + (nMods - 1) * 6;
      subtotalListaUsd += baseUsd;

      const volDiscountUsd = baseUsd * descVolPercent;
      totalDescVolUsd += volDiscountUsd;
      const afterVolUsd = baseUsd - volDiscountUsd;

      const activeHorario =
        cam.horario === "global" ? defaultHorario : cam.horario;
      const horDiscountRate = getDescHorPercent(activeHorario);
      const horDiscountUsd = afterVolUsd * horDiscountRate;
      totalDescHorUsd += horDiscountUsd;

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

  const formatPrice = (usdAmount: number) => {
    if (currency === "usd") return `$${usdAmount.toFixed(2)}`;
    return `Bs ${(usdAmount * RATE).toFixed(2)}`;
  };

  const addCamera = () => {
    setCameras([...cameras, { id: nextId, mods: [], horario: "global" }]);
    setNextId(nextId + 1);
  };

  const removeCamera = (idToRemove: number) => {
    if (cameras.length <= 1) return;
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

  // AJUSTE: Componente SectionLabel con letras más grandes y claras (sin opacity, peso normal)
  const SectionLabel = ({
    text,
    description,
  }: {
    text: string;
    description?: string;
  }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-text/20 border border-text/30 flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5L4 7L8 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Aumentado tamaño de text-sm a text-base */}
        <span className="text-base font-semibold text-text">{text}</span>
      </div>
      {description && (
        <p className="mt-2 ml-7 text-sm text-muted font-normal leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );

  return (
    <section className="bg-background text-text py-24 px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-5xl mx-auto mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4 text-text tracking-tight">
          Estima tus costos
        </h2>
        {/* AJUSTE: Quitamos font-light y subimos contraste a text-base md:text-lg */}
        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto font-normal leading-relaxed">
          Tu factura mensual dependerá de las cámaras conectadas y los módulos
          de IA activos, sin sorpresas ni costos ocultos.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">
        <div className="flex flex-col w-full">
          <div className="mb-14">
            <SectionLabel
              text="Horario por defecto"
              description="Define el tiempo base de monitoreo para tu red. Las detecciones de IA se realizarán únicamente durante este periodo para todas tus cámaras."
            />
            {/* AJUSTE: ml-6 a ml-7 para alinear con el texto descriptivo */}
            <div className="relative ml-7">
              <select
                value={defaultHorario}
                onChange={(e) =>
                  setDefaultHorario(e.target.value as HorarioType)
                }
                className="w-full px-5 py-3 text-base rounded-lg outline-none transition-colors bg-surface/20 text-text border border-text/30 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="c" className="bg-surface text-text">
                  {" "}
                  Comercial (≤10h/día) — 15% Dcto.
                </option>
                <option value="e" className="bg-surface text-text">
                  {" "}
                  Extendido (11-18h/día) — 8% Dcto.
                </option>
                <option value="247" className="bg-surface text-text">
                  {" "}
                  24/7 (Continuo) — Sin Dcto.
                </option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {/* Cabecera introductoria para la sección de cámaras */}
            <div className="mb-2 border-b border-text/10 pb-6">
              <h3 className="text-2xl font-display font-semibold text-text mb-3">
                Configuración de Cámaras
              </h3>
              {/* AJUSTE: font-light a font-normal y contraste más claro */}
              <p className="text-base text-muted font-normal leading-relaxed">
                Añade las cámaras que tienes en tu negocio. Puedes personalizar
                el nivel de vigilancia y los comportamientos a detectar de forma
                individual según el área (ej. Entrada principal, Almacén,
                Cajas).
              </p>
            </div>

            {cameras.map((cam, index) => {
              const camDetails = totals.perCameraDetails.find(
                (c) => c.id === cam.id,
              );

              return (
                <div key={cam.id} className="relative flex flex-col gap-8 pt-4">
                  <div className="flex items-center justify-between pb-3 border-b border-text/10">
                    <div className="flex items-center gap-4">
                      {/* AJUSTE: text-lg a text-xl font-medium */}
                      <h3 className="text-xl font-display font-medium text-text m-0">
                        Cámara {index + 1}
                      </h3>
                      {/* AJUSTE: text-xs a text-sm font-semibold */}
                      <span className="text-sm font-mono font-semibold text-primary/90 bg-primary/10 px-3 py-1 rounded-full">
                        {camDetails?.finalCamUsd === 0
                          ? "(Sin módulos)"
                          : formatPrice(camDetails?.finalCamUsd || 0)}
                      </span>
                    </div>
                    {cameras.length > 1 && (
                      <button
                        onClick={() => removeCamera(cam.id)}
                        className="text-sm text-danger/80 hover:text-danger transition-colors font-semibold flex items-center gap-1.5"
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div>
                    <SectionLabel
                      text="Horario de Monitoreo"
                      description="Personaliza el horario de esta cámara si requiere un nivel de vigilancia distinto al resto de la red."
                    />
                    <div className="relative ml-7">
                      <select
                        value={cam.horario}
                        onChange={(e) =>
                          updateCameraHorario(
                            cam.id,
                            e.target.value as CamHorarioType,
                          )
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-colors bg-surface/20 text-text border border-text/30 focus:border-primary appearance-none cursor-pointer"
                      >
                        <option value="global" className="bg-surface text-text">
                          {" "}
                          Usar horario por defecto{" "}
                        </option>
                        <option value="c" className="bg-surface text-text">
                          {" "}
                          Comercial (≤10h/día){" "}
                        </option>
                        <option value="e" className="bg-surface text-text">
                          {" "}
                          Extendido (11-18h/día){" "}
                        </option>
                        <option value="247" className="bg-surface text-text">
                          {" "}
                          24/7 (Continuo){" "}
                        </option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
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
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionLabel
                      text="Módulos Activos"
                      description="Elige qué eventos específicos o comportamientos deseas que esta cámara identifique automáticamente."
                    />
                    <div className="flex flex-wrap gap-2.5 ml-7">
                      {MOD_LIST.map((mod) => {
                        const isActive = cam.mods.includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            onClick={() => toggleMod(cam.id, mod.id)}
                            className={`px-4 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
                              isActive
                                ? "bg-primary border-primary text-white font-medium"
                                : "bg-transparent border-text/30 text-text hover:border-text/50 hover:text-text"
                            }`}
                          >
                            {mod.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addCamera}
            className="mt-12 py-2.5 px-6 rounded-full border-2 border-text/20 text-text/90 text-sm font-semibold hover:border-text/40 hover:bg-surface/50 transition-all self-start flex items-center gap-2.5"
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
            Añadir cámara
          </button>
        </div>

        {/* LADO DERECHO: TARJETA DE PRECIO (Sin opacidades en letras oscuras) */}
        <div className="relative w-full lg:sticky lg:top-24 mt-8 lg:mt-0">
          <div className="hidden lg:block absolute top-6 -right-6 bottom-[-1.5rem] left-6 border-2 border-text/10 rounded-2xl z-0 pointer-events-none"></div>

          <div className="relative z-10 bg-text text-background rounded-2xl p-8 shadow-2xl flex flex-col items-start border border-text/20">
            {/* AJUSTE: Aumentado text-[11px] a text-sm y color background sólido/60 (más visible sobre blanco) */}
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-background/60 mb-5">
              Total Mensual Estimado
            </span>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-background transition-all">
                {currency === "usd" ? "$" : "Bs "}
                {currency === "usd"
                  ? totals.finalTotalUsd.toFixed(2)
                  : totals.finalTotalBs.toFixed(2)}
              </span>
              {/* AJUSTE: Subido a text-base font-medium */}
              <span className="text-base font-medium text-background/70">
                / mes
              </span>
            </div>

            <div className="w-full space-y-3.5 pt-6 mt-1 border-t border-background/15 text-[13px]">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-background/60 mb-3">
                Desglose de Precios
              </span>

              {/* AJUSTE GENERAL DESGLOSE: text-[13px] a text-sm, pesos más fuertes y colores oscuros sólidos sobre blanco */}
              <div className="flex justify-between items-center text-background text-sm">
                <span className="font-medium">
                  Subtotal lista ({totals.numCameras} cám.)
                </span>
                <span className="font-mono font-semibold">
                  {formatPrice(totals.subtotalListaUsd)}
                </span>
              </div>

              {totals.totalDescVolUsd > 0 ? (
                <div className="flex justify-between items-center text-primary-dark font-semibold text-sm">
                  <span>Dcto. Volumen (-{totals.descVolPercent * 100}%)</span>
                  <span className="font-mono">
                    -{formatPrice(totals.totalDescVolUsd)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-background/60 text-xs">
                  <span>Dcto. Volumen</span>
                  <span>0% (menos de 5 cám.)</span>
                </div>
              )}

              {totals.totalDescHorUsd > 0 && (
                <div className="flex justify-between items-center text-primary-dark font-semibold text-sm">
                  <span>Dcto. Horarios (Acumulado)</span>
                  <span className="font-mono">
                    -{formatPrice(totals.totalDescHorUsd)}
                  </span>
                </div>
              )}
            </div>

            {/* AJUSTE FINAL: Aumentado text-[11px] a text-sm font-medium y contraste text-background/80 */}
            <div className="mt-8 text-sm font-medium text-background/80 leading-relaxed max-w-[95%]">
              {totals.descVolPercent === 0 ? (
                <span className="text-primary-dark font-semibold">
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
