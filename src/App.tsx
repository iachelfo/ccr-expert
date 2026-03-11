import { useState } from "react";
import {
  Upload,
  FileText,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Shield,
  Scale,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Menu,
  X,
  Pencil,
  BookOpen,
  ClipboardList,
  Printer,
  Share2,
  ExternalLink,
  Info,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────
type Tab = "dashboard" | "upload" | "review" | "analysis" | "alertDetail" | "report";
type AlertLevel = "critical" | "warning" | "info";

interface Alert {
  code: string;
  title: string;
  level: AlertLevel;
  description: string;
  legalBasis: string;
  value?: string;
  limit?: string;
  contractExcerpt?: string;
  jurisprudence?: string[];
  legalArticles?: { norm: string; text: string }[];
}

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  category: string;
  editable?: boolean;
}

interface AnalysisResult {
  contractId: string;
  contractType: string;
  institution: string;
  date: string;
  amount: string;
  resourceOrigin: string;
  alerts: Alert[];
}

// ─── Mock Data ──────────────────────────────────────
const MOCK_RECENT: {
  id: string;
  type: string;
  institution: string;
  date: string;
  alerts: number;
  status: "irregular" | "regular";
}[] = [
  { id: "40/04911-6", type: "CCB", institution: "Banco do Brasil S.A.", date: "05/03/2026", alerts: 3, status: "irregular" },
  { id: "23/08844-2", type: "CCR", institution: "Sicredi", date: "02/03/2026", alerts: 0, status: "regular" },
  { id: "10/55721-9", type: "CPR-F", institution: "Itau BBA", date: "28/02/2026", alerts: 1, status: "irregular" },
];

const MOCK_FIELDS: ExtractedField[] = [
  { label: "Numero do Contrato", value: "40/04911-6", confidence: 0.98, category: "Identificacao" },
  { label: "Modelo do Contrato", value: "CCB - Cedula de Credito Bancario", confidence: 0.95, category: "Identificacao" },
  { label: "Data de Assinatura", value: "15/01/2024", confidence: 0.92, category: "Identificacao" },
  { label: "Instituicao Financeira", value: "Banco do Brasil S.A.", confidence: 0.99, category: "Identificacao" },
  { label: "Emitente / Tomador", value: "Fazenda Boa Esperanca Ltda.", confidence: 0.88, category: "Identificacao" },
  { label: "CPF/CNPJ", value: "12.345.678/0001-90", confidence: 0.96, category: "Identificacao" },
  { label: "Valor Financiado", value: "R$ 757.000,00", confidence: 0.97, category: "Valores" },
  { label: "Valor da Parcela", value: "R$ 10.487,50", confidence: 0.85, category: "Valores" },
  { label: "Quantidade de Parcelas", value: "108", confidence: 0.93, category: "Valores" },
  { label: "Tarifa de Abertura", value: "R$ 1.200,00", confidence: 0.78, category: "Valores" },
  { label: "Taxa de Juros", value: "14,5% a.a.", confidence: 0.94, category: "Encargos", editable: true },
  { label: "Indexador", value: "CDI + 8,1% a.a.", confidence: 0.72, category: "Encargos", editable: true },
  { label: "Juros de Mora", value: "1,0% a.m.", confidence: 0.91, category: "Encargos" },
  { label: "Multa Moratoria", value: "2,0%", confidence: 0.96, category: "Encargos" },
  { label: "Vencimento Final", value: "10/02/2034", confidence: 0.97, category: "Prazos" },
  { label: "Primeira Parcela", value: "10/02/2025", confidence: 0.90, category: "Prazos" },
  { label: "Carencia", value: "12 meses", confidence: 0.82, category: "Prazos" },
  { label: "Finalidade", value: "Investimento rural - aquisicao de maquinario", confidence: 0.89, category: "Finalidade" },
  { label: "Origem dos Recursos", value: "Nao explicitada (recursos livres)", confidence: 0.65, category: "Finalidade", editable: true },
  { label: "Programa", value: "PRONAMP (inferido)", confidence: 0.58, category: "Finalidade", editable: true },
  { label: "Indicadores Direcionado", value: "SICOR, MCR, PROAGRO mencionados", confidence: 0.87, category: "Finalidade" },
];

const MOCK_ANALYSIS: AnalysisResult = {
  contractId: "40/04911-6",
  contractType: "CCB (Cedula de Credito Bancario)",
  institution: "Banco do Brasil S.A.",
  date: "15/01/2024",
  amount: "R$ 757.000,00",
  resourceOrigin: "Direcionados (PRONAMP)",
  alerts: [
    {
      code: "AC01",
      title: "Juros remuneratorios acima do teto legal",
      level: "critical",
      description: "Taxa de juros remuneratorios de 14,5% a.a. excede o limite legal de 12% a.a. para credito rural.",
      legalBasis: "Art. 5, DL 167/67; REsp 1.112.879/PR",
      value: "14,5% a.a.",
      limit: "12,0% a.a.",
      contractExcerpt: '"...o EMITENTE pagara ao CREDOR juros remuneratorios a taxa de 14,5% (quatorze virgula cinco por cento) ao ano, calculados sobre o saldo devedor..."',
      jurisprudence: [
        "REsp 1.112.879/PR - Rel. Min. Luis Felipe Salomao - \"Os juros remuneratorios do credito rural sujeitam-se aos limites previstos em lei especial, no caso, ao art. 5 do DL 167/67.\"",
        "AgRg no REsp 1.254.312/MS - \"Nao se aplica a Sumula 382/STJ ao credito rural, prevalecendo o teto de 12% a.a. previsto no DL 167/67.\"",
      ],
      legalArticles: [
        { norm: "Art. 5, DL 167/67", text: "As importancias fornecidas pelo financiador vencerao juros as taxas que o Conselho Monetario Nacional fixar e serao exigiveis em 30 de junho e 31 de dezembro ou no vencimento das parcelas." },
        { norm: "Art. 1, Lei 4.829/65", text: "O credito rural sistematizado nos termos desta lei sera distribuido e aplicado de acordo com a politica de desenvolvimento da producao rural do Pais." },
      ],
    },
    {
      code: "AC05",
      title: "Taxa acima do teto do programa PRONAMP",
      level: "critical",
      description: "Taxa de 14,5% a.a. excede o teto do PRONAMP para investimento de 8,5% a.a. (Safra 2024/2025).",
      legalBasis: "Res. CMN 5.080/2023; MCR 6-2",
      value: "14,5% a.a.",
      limit: "8,5% a.a.",
      contractExcerpt: '"...operacao enquadrada no Programa Nacional de Apoio ao Medio Produtor Rural (PRONAMP), com recursos direcionados..."',
      jurisprudence: [
        "REsp 1.112.879/PR - Limites fixados pelo CMN devem ser observados pelas instituicoes financeiras.",
      ],
      legalArticles: [
        { norm: "Res. CMN 5.080/2023", text: "Dispoe sobre as condicoes e os limites de taxas de juros do credito rural." },
        { norm: "MCR 6-2", text: "Taxa de juros para PRONAMP investimento: ate 8,5% a.a. (Plano Safra 2024/2025)." },
      ],
    },
    {
      code: "AA01",
      title: "CCB com indicativos de credito direcionado",
      level: "warning",
      description: 'Contrato formalizado como CCB (recursos livres), porem apresenta indicadores de credito direcionado: mencao a SICOR, finalidade "investimento rural", programa PRONAMP.',
      legalBasis: "Art. 17 DL 167/67; Principio da primazia da realidade",
      contractExcerpt: '"Cedula de Credito Bancario... finalidade: investimento rural para aquisicao de maquinario agricola... registro no SICOR obrigatorio..."',
      jurisprudence: [
        "Principio da primazia da realidade: a natureza juridica do contrato e determinada pelo seu conteudo, nao pela denominacao.",
      ],
      legalArticles: [
        { norm: "Art. 17, DL 167/67", text: "A cedula de credito rural e promessa de pagamento em dinheiro, sem ou com garantia real cedularmente constituida." },
      ],
    },
    {
      code: "AA02",
      title: "Garantias em nivel elevado",
      level: "warning",
      description: "Valor total das garantias (R$ 1.250.000,00) representa 165% do valor financiado.",
      legalBasis: "Art. 51, IV CDC",
      value: "165%",
      limit: "150%",
      contractExcerpt: '"...garantia hipotecaria: imovel rural matricula 12.345... avaliado em R$ 1.250.000,00..."',
      legalArticles: [
        { norm: "Art. 51, IV, CDC", text: "Sao nulas de pleno direito as clausulas que estabelecam obrigacoes consideradas inicuas, abusivas, que coloquem o consumidor em desvantagem exagerada." },
      ],
    },
    {
      code: "INFO",
      title: "Multa moratoria dentro do limite",
      level: "info",
      description: "Multa moratoria de 2% esta dentro do limite legal.",
      legalBasis: "Art. 52, par. 1, CDC",
      value: "2,0%",
      limit: "2,0%",
    },
    {
      code: "INFO",
      title: "Juros de mora dentro do limite",
      level: "info",
      description: "Juros de mora de 1% a.m. estao dentro do limite legal.",
      legalBasis: "Art. 5, par. unico, DL 167/67",
      value: "1,0% a.m.",
      limit: "1,0% a.m.",
    },
  ],
};

// ─── Shared Components ──────────────────────────────

function AlertBadge({ level }: { level: AlertLevel }) {
  const styles = {
    critical: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const labels = { critical: "Critico", warning: "Atencao", info: "Regular" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500";
  const textColor = pct >= 90 ? "text-emerald-700" : pct >= 75 ? "text-amber-700" : "text-red-700";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{pct}%</span>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────
function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total de Analises" value={47} color="bg-blue-600" />
        <StatCard icon={AlertTriangle} label="Irregularidades" value={31} color="bg-red-500" />
        <StatCard icon={Clock} label="Tempo Medio" value="1m 42s" color="bg-violet-500" />
        <StatCard icon={TrendingUp} label="Taxa Deteccao" value="96%" color="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Analises Recentes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar contrato..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {MOCK_RECENT.map((item) => (
            <button key={item.id} onClick={() => onNavigate("analysis")} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left cursor-pointer">
              <div className={`p-2 rounded-lg ${item.status === "irregular" ? "bg-red-50" : "bg-emerald-50"}`}>
                <FileText className={`w-5 h-5 ${item.status === "irregular" ? "text-red-500" : "text-emerald-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.type}</span>
                  <span className="text-gray-500 text-sm">Nr. {item.id}</span>
                </div>
                <p className="text-sm text-gray-500">{item.institution} &middot; {item.date}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.alerts > 0 ? (
                  <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4" /> {item.alerts} alerta{item.alerts > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4" /> Regular
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Upload ─────────────────────────────────────────
function UploadScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProcessing = (fileName: string) => {
    setFile(fileName);
    setProcessing(true);
    setProgress(0);
    const steps = [10, 25, 45, 60, 80, 95, 100];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setProgress(p);
        if (p === 100) setTimeout(() => onNavigate("review"), 600);
      }, (i + 1) * 500);
    });
  };

  if (processing) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Processando Contrato</h3>
          <p className="text-sm text-gray-500 mb-6">{file}</p>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {([
              [10, "Extraindo texto (OCR)"],
              [45, "Identificando tipo de contrato"],
              [60, "Extraindo variaveis"],
              [80, "Classificando recursos"],
              [95, "Analisando conformidade"],
              [100, "Gerando relatorio"],
            ] as [number, string][]).map(([threshold, label]) => (
              <p key={label} className={progress >= threshold ? "text-emerald-600" : ""}>
                {progress >= threshold ? "\u2713" : "\u2026"} {label}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Nova Analise</h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); simulateProcessing("Contrato_CCB_40-04911-6.pdf"); }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"}`}
          onClick={() => simulateProcessing("Contrato_CCB_40-04911-6.pdf")}
        >
          <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
          <p className="text-base font-medium text-gray-700 mb-1">Arraste o contrato aqui ou clique para selecionar</p>
          <p className="text-sm text-gray-400">PDF (ate 50 paginas) ou imagem (JPG, PNG)</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { sigla: "CCB", nome: "Cedula de Credito Bancario" },
            { sigla: "CCR", nome: "Cedula de Credito Rural" },
            { sigla: "CPR", nome: "Cedula de Produto Rural" },
            { sigla: "CPR-F", nome: "CPR Financeira" },
          ].map((c) => (
            <div key={c.sigla} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-sm text-gray-900">{c.sigla}</span>
                <span className="text-xs text-gray-500 ml-1">{c.nome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Field Review Screen (NEW) ──────────────────────
function FieldReview({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [fields, setFields] = useState(MOCK_FIELDS);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const categories = [...new Set(fields.map((f) => f.category))];
  const lowConfCount = fields.filter((f) => f.confidence < 0.75).length;

  const handleSave = (idx: number, newValue: string) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, value: newValue, confidence: 1.0 } : f)));
    setEditingIdx(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revisao de Campos Extraidos</h2>
              <p className="text-sm text-gray-500">
                {fields.length} campos extraidos &middot;{" "}
                {lowConfCount > 0 ? (
                  <span className="text-amber-600 font-medium">{lowConfCount} com baixa confianca</span>
                ) : (
                  <span className="text-emerald-600 font-medium">Todos com alta confianca</span>
                )}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button onClick={() => onNavigate("upload")} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</span>
            </button>
            <button onClick={() => onNavigate("analysis")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Confirmar e Analisar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Revise os campos extraidos antes de prosseguir com a analise. Campos com <strong>baixa confianca</strong> estao destacados em amarelo. Clique no icone de edicao para corrigir valores incorretos.
        </p>
      </div>

      {/* Field categories */}
      {categories.map((cat) => {
        const catFields = fields.map((f, i) => ({ ...f, _idx: i })).filter((f) => f.category === cat);
        return (
          <div key={cat} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{cat}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {catFields.map((field) => {
                const isLow = field.confidence < 0.75;
                const isEditing = editingIdx === field._idx;
                return (
                  <div key={field._idx} className={`px-6 py-4 flex items-center gap-4 ${isLow ? "bg-amber-50/50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            defaultValue={field.value}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(field._idx, e.currentTarget.value);
                              if (e.key === "Escape") setEditingIdx(null);
                            }}
                            className="flex-1 text-sm font-medium text-gray-900 border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button onClick={() => setEditingIdx(null)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancelar</button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{field.value}</p>
                      )}
                    </div>
                    <ConfidenceBar score={field.confidence} />
                    {field.editable && !isEditing && (
                      <button onClick={() => setEditingIdx(field._idx)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {isLow && !field.editable && (
                      <span className="text-xs text-amber-600 font-medium whitespace-nowrap">Verificar</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analysis Results ───────────────────────────────
function AnalysisResults({ onNavigate, onAlertSelect }: { onNavigate: (tab: Tab) => void; onAlertSelect: (idx: number) => void }) {
  const data = MOCK_ANALYSIS;
  const criticals = data.alerts.filter((a) => a.level === "critical");
  const warnings = data.alerts.filter((a) => a.level === "warning");
  const infos = data.alerts.filter((a) => a.level === "info");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">Irregularidades Detectadas</h2>
              <p className="text-sm text-gray-500">{criticals.length} critico(s), {warnings.length} atencao, {infos.length} regular(es)</p>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button onClick={() => onNavigate("report")} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <Eye className="w-4 h-4" /> Ver Contrato
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Dados do Contrato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {([
            ["Nr. Contrato", data.contractId],
            ["Tipo", data.contractType],
            ["Instituicao", data.institution],
            ["Data Assinatura", data.date],
            ["Valor Financiado", data.amount],
            ["Origem dos Recursos", data.resourceOrigin],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <span className="text-gray-500">{label}</span>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Verificacoes de Conformidade</h3>
        {data.alerts.map((alert, i) => {
          const borderColor = { critical: "border-l-red-500", warning: "border-l-amber-500", info: "border-l-emerald-500" }[alert.level];
          const Icon = { critical: AlertCircle, warning: AlertTriangle, info: CheckCircle }[alert.level];
          const iconColor = { critical: "text-red-500", warning: "text-amber-500", info: "text-emerald-500" }[alert.level];
          const hasDetail = alert.contractExcerpt || alert.jurisprudence;

          return (
            <div
              key={i}
              onClick={() => hasDetail && onAlertSelect(i)}
              className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} shadow-sm p-5 ${hasDetail ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{alert.code}</span>
                    <AlertBadge level={alert.level} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  {alert.value && alert.limit && (
                    <div className="flex items-center gap-4 mb-2 text-sm">
                      <span className="text-gray-500">Encontrado: <strong className="text-gray-900">{alert.value}</strong></span>
                      <span className="text-gray-500">Limite: <strong className="text-gray-900">{alert.limit}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-blue-600">
                      <Scale className="w-3.5 h-3.5" />
                      <span>{alert.legalBasis}</span>
                    </div>
                    {hasDetail && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        Ver detalhes <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alert Detail Screen (NEW) ──────────────────────
function AlertDetail({ alertIdx, onBack }: { alertIdx: number; onBack: () => void }) {
  const alert = MOCK_ANALYSIS.alerts[alertIdx];
  const borderColor = { critical: "border-red-500", warning: "border-amber-500", info: "border-emerald-500" }[alert.level];
  const bgColor = { critical: "bg-red-50", warning: "bg-amber-50", info: "bg-emerald-50" }[alert.level];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button + header */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
        <ChevronLeft className="w-4 h-4" /> Voltar para Resultado
      </button>

      <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-6`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-sm text-gray-500">{alert.code}</span>
          <AlertBadge level={alert.level} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h2>
        <p className="text-gray-700">{alert.description}</p>
        {alert.value && alert.limit && (
          <div className="mt-4 flex items-center gap-6">
            <div className="bg-white/80 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">Encontrado</p>
              <p className="text-lg font-bold text-red-700">{alert.value}</p>
            </div>
            <div className="text-gray-300 text-2xl">vs</div>
            <div className="bg-white/80 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">Limite Legal</p>
              <p className="text-lg font-bold text-emerald-700">{alert.limit}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contract excerpt */}
      {alert.contractExcerpt && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Trecho do Contrato
          </h3>
          <blockquote className="border-l-4 border-blue-300 bg-blue-50/50 px-4 py-3 text-sm text-gray-700 italic rounded-r-lg">
            {alert.contractExcerpt}
          </blockquote>
        </div>
      )}

      {/* Legal articles */}
      {alert.legalArticles && alert.legalArticles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-gray-400" /> Fundamentacao Legal
          </h3>
          <div className="space-y-4">
            {alert.legalArticles.map((art, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-blue-700">{art.norm}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-sm text-gray-600">{art.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jurisprudence */}
      {alert.jurisprudence && alert.jurisprudence.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" /> Jurisprudencia
          </h3>
          <div className="space-y-3">
            {alert.jurisprudence.map((j, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-violet-600">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{j}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Report Preview Screen (NEW) ────────────────────
function ReportPreview({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const data = MOCK_ANALYSIS;
  const criticals = data.alerts.filter((a) => a.level === "critical");
  const warnings = data.alerts.filter((a) => a.level === "warning");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Laudo Pericial - ${data.contractType} ${data.contractId}`,
      text: `Relatório de análise de conformidade - ${data.contractType} ${data.contractId}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Link copiado para a área de transferência!");
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copiado para a área de transferência!");
    }
  };

  const handleDownload = (format: "pdf" | "docx") => {
    const reportEl = document.getElementById("report-content");
    if (!reportEl) return;

    const content = reportEl.innerText;
    const blob = new Blob(
      [format === "docx"
        ? `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laudo Pericial - ${data.contractType} ${data.contractId}</title></head><body>${reportEl.innerHTML}</body></html>`
        : content
      ],
      { type: format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laudo_${data.contractType}_${data.contractId}.${format === "pdf" ? "txt" : "doc"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Download iniciado (${format.toUpperCase()})! Em produção, será gerado o ${format.toUpperCase()} formatado.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button onClick={() => onNavigate("analysis")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="sm:ml-auto flex flex-wrap gap-2">
            <button onClick={() => handleDownload("pdf")} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
            <button onClick={() => handleDownload("docx")} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="w-4 h-4" /> Baixar DOCX
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
          </div>
        </div>
      </div>

      {/* Report document */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        {/* Watermark banner (free plan) */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 px-8 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-400 italic">Versao de visualizacao &middot; CCR Expert</span>
          <span className="text-xs text-amber-600 font-medium">Plano Gratuito: relatorio com marca d'agua</span>
        </div>

        {/* Document content */}
        <div id="report-content" className="px-8 sm:px-12 py-10 space-y-8 text-sm text-gray-800 leading-relaxed">
          {/* Title */}
          <div className="text-center border-b border-gray-200 pb-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Relatorio Tecnico</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Analise de Conformidade</h1>
            <h2 className="text-lg text-gray-600 mb-4">Cedula de Credito Bancario Nr. {data.contractId}</h2>
            <p className="text-xs text-gray-400">{data.institution} &middot; Data: {data.date} &middot; Gerado em: 10/03/2026</p>
          </div>

          {/* Section 1: Identification */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">1. Identificacao do Contrato</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-8">
              <div><span className="text-gray-500">Contrato:</span> <strong>{data.contractId}</strong></div>
              <div><span className="text-gray-500">Tipo:</span> <strong>{data.contractType}</strong></div>
              <div><span className="text-gray-500">Instituicao:</span> <strong>{data.institution}</strong></div>
              <div><span className="text-gray-500">Data:</span> <strong>{data.date}</strong></div>
              <div><span className="text-gray-500">Valor:</span> <strong>{data.amount}</strong></div>
              <div><span className="text-gray-500">Emitente:</span> <strong>Fazenda Boa Esperanca Ltda.</strong></div>
            </div>
          </div>

          {/* Section 2: Classification */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">2. Classificacao dos Recursos</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p><strong>Classificacao:</strong> {data.resourceOrigin}</p>
              <p className="mt-2 text-gray-600">O contrato foi formalizado como CCB (recursos livres), porem a analise identificou indicadores de credito direcionado: mencao a SICOR, finalidade de investimento rural, e referencia ao programa PRONAMP.</p>
            </div>
          </div>

          {/* Section 3: Rate check */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">3. Verificacao de Conformidade (Taxas)</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Encargo</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Contratado</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Limite</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Juros remuneratorios</td>
                  <td className="py-2 font-medium text-red-700">14,5% a.a.</td>
                  <td className="py-2">12,0% a.a.</td>
                  <td className="py-2"><span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">IRREGULAR</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Teto PRONAMP</td>
                  <td className="py-2 font-medium text-red-700">14,5% a.a.</td>
                  <td className="py-2">8,5% a.a.</td>
                  <td className="py-2"><span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">IRREGULAR</span></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Juros de mora</td>
                  <td className="py-2">1,0% a.m.</td>
                  <td className="py-2">1,0% a.m.</td>
                  <td className="py-2"><span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">REGULAR</span></td>
                </tr>
                <tr>
                  <td className="py-2">Multa moratoria</td>
                  <td className="py-2">2,0%</td>
                  <td className="py-2">2,0%</td>
                  <td className="py-2"><span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">REGULAR</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Irregularities */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">4. Irregularidades Identificadas</h3>
            <div className="space-y-4">
              {[...criticals, ...warnings].map((alert, i) => (
                <div key={i} className="border-l-4 border-red-400 pl-4">
                  <p className="font-semibold text-gray-900">{alert.code} - {alert.title}</p>
                  <p className="text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-blue-600 text-xs mt-1">Fundamento: {alert.legalBasis}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Conclusion */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">5. Conclusao</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p>A analise do contrato CCB Nr. {data.contractId} identificou <strong>{criticals.length} irregularidade(s) critica(s)</strong> e <strong>{warnings.length} ponto(s) de atencao</strong>. Recomenda-se a revisao contratual com possibilidade de acao revisional para adequacao dos encargos aos limites legais aplicaveis ao credito rural.</p>
            </div>
          </div>

          {/* Section 6: Legal basis */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">6. Fundamentacao Juridica Consolidada</h3>
            <ul className="space-y-1 text-gray-600">
              <li>&bull; Art. 5, Decreto-Lei 167/1967 - Limite de juros para credito rural</li>
              <li>&bull; Lei 4.829/1965 - Institucionalizacao do credito rural</li>
              <li>&bull; Resolucao CMN 5.080/2023 - Manual de Credito Rural</li>
              <li>&bull; Art. 51, IV, CDC - Clausulas abusivas</li>
              <li>&bull; REsp 1.112.879/PR - Juros sujeitos a limites do DL 167/67</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-xs text-gray-400 italic">
              Este relatorio foi gerado automaticamente pelo sistema CCR Expert e tem carater informativo.
              Os resultados devem ser validados por profissional habilitado (perito contabil ou advogado) antes de utilizacao em
              procedimentos judiciais ou extrajudiciais. O sistema nao substitui a analise profissional qualificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAlertIdx, setSelectedAlertIdx] = useState(0);

  const handleAlertSelect = (idx: number) => {
    setSelectedAlertIdx(idx);
    setActiveTab("alertDetail");
  };

  const sidebarTabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "upload", label: "Nova Analise", icon: Upload },
    { id: "review", label: "Revisao", icon: ClipboardList },
    { id: "analysis", label: "Resultado", icon: FileText },
    { id: "report", label: "Relatorio", icon: BookOpen },
  ];

  const tabLabels: Record<Tab, string> = {
    dashboard: "Dashboard",
    upload: "Nova Analise",
    review: "Revisao de Campos",
    analysis: "Resultado",
    alertDetail: "Detalhe do Alerta",
    report: "Relatorio",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">CCR Expert</h1>
              <p className="text-xs text-gray-400">Analisador de Credito Rural</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarTabs.map((tab) => {
            const active = activeTab === tab.id || (activeTab === "alertDetail" && tab.id === "analysis");
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-800 mb-1">Plano Profissional</p>
            <p className="text-xs text-gray-500 mb-3">50 analises/mes &middot; Relatorio completo</p>
            <button className="w-full text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition-colors cursor-pointer">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700 cursor-pointer">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{tabLabels[activeTab]}</h2>
          {activeTab === "dashboard" && (
            <button onClick={() => setActiveTab("upload")} className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" /> Nova Analise
            </button>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "upload" && <UploadScreen onNavigate={setActiveTab} />}
          {activeTab === "review" && <FieldReview onNavigate={setActiveTab} />}
          {activeTab === "analysis" && <AnalysisResults onNavigate={setActiveTab} onAlertSelect={handleAlertSelect} />}
          {activeTab === "alertDetail" && <AlertDetail alertIdx={selectedAlertIdx} onBack={() => setActiveTab("analysis")} />}
          {activeTab === "report" && <ReportPreview onNavigate={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}
