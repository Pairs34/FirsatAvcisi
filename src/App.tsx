import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Link2,
  Pause,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { calculateProfit } from './domain/profit';
import { newOpportunity, seedWorkspace } from './domain/seed';
import type { CommissionSource, MatchStatus, Opportunity, WorkspaceData } from './domain/types';

const OFFICIAL_COMMISSION = 'https://akademi.trendyol.com/satici-bilgi-merkezi/detay/trendyol-komisyonlari';
const SELLER_TERMS = 'https://partner.trendyol.com/incentive';
const OFFICIAL_CALC = 'https://akademi.trendyol.com/satici-bilgi-merkezi/detay/komisyon-tutari-hesaplama';
const FINANCE_API = 'https://developers.trendyol.com/docs/cari-hesap-ekstresi-entegrasyonu';

const currency = (value: number) => new Intl.NumberFormat('tr-TR', {
  style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number.isFinite(value) ? value : 0);

const percentage = (value: number) => `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value)}%`;

function loadLocal(): WorkspaceData | null {
  try {
    const stored = localStorage.getItem('firsat-avcisi-v1');
    return stored ? JSON.parse(stored) as WorkspaceData : null;
  } catch {
    return null;
  }
}

function openUrl(url: string) {
  if (!url.startsWith('https://')) return;
  if (window.desktop) window.desktop.openExternal(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}

type Screen = 'overview' | 'calculator' | 'sources';

function latestQuote(item: Opportunity): Opportunity {
  return item.observedPurchaseGross && item.observedPurchaseGross > 0
    ? { ...item, purchaseGross: item.observedPurchaseGross }
    : item;
}

function NumberField({
  label,
  value,
  onChange,
  suffix = '₺',
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          className="pr-10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
    </div>
  );
}

function StatusBadge({ item, minProfit }: { item: Opportunity; minProfit: number }) {
  const result = calculateProfit(latestQuote(item), minProfit);
  if (item.watchStatus === 'paused') {
    return <Badge variant="secondary"><Pause className="size-3" /> Duraklatıldı</Badge>;
  }
  if (item.matchStatus === 'mismatch') {
    return <Badge variant="danger"><CircleAlert className="size-3" /> Eşleşmedi</Badge>;
  }
  if (item.matchStatus !== 'verified' || item.commissionSource === 'reference') {
    return <Badge variant="warning"><Clock3 className="size-3" /> Teyit bekliyor</Badge>;
  }
  return result.hasOpportunity
    ? <Badge variant="success"><Check className="size-3" /> Fırsat</Badge>
    : <Badge variant="danger"><ArrowDownRight className="size-3" /> Eşik altında</Badge>;
}

export default function App() {
  const [data, setData] = useState<WorkspaceData>(seedWorkspace);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('overview');
  const [query, setQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Yerel çalışma alanı');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = window.desktop ? await window.desktop.load() : loadLocal();
        if (active && stored?.version === 1 && Array.isArray(stored.opportunities)) setData(stored);
      } catch {
        if (active) setSaveStatus('Veri okunamadı');
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaveStatus('Kaydediliyor…');
    const timer = window.setTimeout(async () => {
      try {
        if (window.desktop) await window.desktop.save(data);
        else localStorage.setItem('firsat-avcisi-v1', JSON.stringify(data));
        setSaveStatus('Kaydedildi');
      } catch {
        setSaveStatus('Kaydetme hatası');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [data, ready]);

  const selected = data.opportunities.find(item => item.id === data.selectedId) ?? data.opportunities[0];
  const inputResult = useMemo(() => selected ? calculateProfit(selected, data.minProfit) : null, [selected, data.minProfit]);
  const result = useMemo(() => selected ? calculateProfit(latestQuote(selected), data.minProfit) : null, [selected, data.minProfit]);
  const filtered = data.opportunities.filter(item =>
    `${item.name} ${item.brand} ${item.category}`.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')),
  );
  const activeCount = data.opportunities.filter(item => item.watchStatus === 'active').length;
  const confirmedCount = data.opportunities.filter(item => calculateProfit(latestQuote(item), data.minProfit).hasOpportunity).length;
  const referenceCount = data.opportunities.filter(item => item.commissionSource === 'reference').length;

  function updateSelected(patch: Partial<Opportunity>) {
    if (!selected) return;
    setData(previous => ({
      ...previous,
      opportunities: previous.opportunities.map(item => item.id === selected.id ? { ...item, ...patch } : item),
    }));
  }

  function addItem() {
    const item = newOpportunity();
    setData(previous => ({ ...previous, opportunities: [item, ...previous.opportunities], selectedId: item.id }));
    setScreen('calculator');
    setShowEditor(true);
  }

  const screenLabel = screen === 'overview' ? 'Genel bakış' : screen === 'calculator' ? 'Kâr hesaplayıcı' : 'Kaynaklar';

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="border-b border-sidebar-border px-4 py-5">
          <p className="text-sm font-semibold tracking-tight">Fırsat Avcısı</p>
          <p className="mt-1 text-xs text-muted-foreground">HB alış · TY satış analizi</p>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          <NavButton active={screen === 'overview'} onClick={() => setScreen('overview')} icon={<Activity className="size-4" />}>
            Genel bakış
          </NavButton>
          <NavButton active={screen === 'calculator'} onClick={() => setScreen('calculator')} icon={<Calculator className="size-4" />}>
            Kâr hesaplayıcı
          </NavButton>
          <NavButton active={screen === 'sources'} onClick={() => setScreen('sources')} icon={<BookOpen className="size-4" />}>
            Kaynaklar
          </NavButton>
        </nav>

        <div className="mt-auto space-y-3 border-t border-sidebar-border p-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Eye className="mt-0.5 size-3.5 shrink-0" />
            <span>{activeCount} ürün izleniyor · fiyatlar manuel</span>
          </div>
          <p className="text-xs text-muted-foreground">v0.1 · {saveStatus}</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b px-6">
          <p className="text-sm text-muted-foreground">
            Çalışma alanı <span className="mx-1.5 text-zinc-300">/</span>
            <span className="font-medium text-foreground">{screenLabel}</span>
          </p>
          <Button size="sm" onClick={addItem}>
            <Plus className="size-4" /> Yeni ürün
          </Button>
        </header>

        {screen === 'sources' ? (
          <SourcesScreen />
        ) : (
          <div className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {screen === 'overview' ? 'Ürün fırsatları' : 'Kâr hesaplayıcı'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeCount} aktif · {confirmedCount} fırsat · {referenceCount} teyit bekliyor · eşik {currency(data.minProfit)}
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
              <Card className="shadow-none">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle>Ürün listesi</CardTitle>
                    <CardDescription>{data.opportunities.length} kayıt</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={addItem}>
                    <Plus className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Ürün, marka veya kategori"
                    />
                  </div>
                  <ScrollArea className="h-[420px] rounded-md border">
                    {filtered.length ? (
                      <div className="divide-y">
                        {filtered.map(item => {
                          const p = calculateProfit(latestQuote(item), data.minProfit);
                          const selectedRow = item.id === selected?.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setData(prev => ({ ...prev, selectedId: item.id }))}
                              className={cn(
                                'flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60',
                                selectedRow && 'bg-muted',
                              )}
                            >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-semibold">
                                {item.brand ? item.brand.slice(0, 1).toLocaleUpperCase('tr-TR') : '?'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{item.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {item.category || 'Kategori yok'} · {item.brand || 'Marka yok'}
                                </p>
                                <div className="mt-2">
                                  <StatusBadge item={item} minProfit={data.minProfit} />
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className={cn('text-sm font-medium', p.operatingProfit >= 0 ? 'text-foreground' : 'text-destructive')}>
                                  {currency(p.operatingProfit)}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{percentage(p.marginPercent)} marj</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="p-8 text-center text-sm text-muted-foreground">Aramayla eşleşen ürün yok.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {selected && result ? (
                <Card className="shadow-none">
                  <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>Fırsat analizi</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{selected.name}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
                      Düzenle
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {selected.observedPurchaseGross ? 'Son HB gözlemiyle kâr' : 'Girilen alışla kâr'}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className={cn('text-2xl font-semibold tracking-tight', result.operatingProfit < 0 && 'text-destructive')}>
                          {currency(result.operatingProfit)}
                        </p>
                        {result.operatingProfit >= 0
                          ? <ArrowUpRight className="size-5 text-muted-foreground" />
                          : <ArrowDownRight className="size-5 text-destructive" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">KDV mahsuplaşması sonrası · stopaj kâr gideri değil</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Alış · KDV dahil</p>
                        <p className="mt-1 font-medium">{currency(result.finalPurchaseGross)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satış · KDV dahil</p>
                        <p className="mt-1 font-medium">{currency(result.finalSaleGross)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                      <Info className="mt-0.5 size-3.5 shrink-0" />
                      <p>
                        {selected.commissionSource === 'reference'
                          ? 'Komisyon oranı referans veridir. Panel oranı teyit edilmeden fırsat uyarısı oluşmaz.'
                          : selected.matchStatus !== 'verified'
                            ? 'Ürün eşleşmesi henüz teyit edilmedi. Barkod ve paket içeriğini kontrol edin.'
                            : result.hasOpportunity
                              ? 'Kâr eşiği geçildi. Alış fiyatı ve stok güncelliğini tekrar kontrol edin.'
                              : 'Bu senaryo belirlediğiniz kâr eşiğinin altında kalıyor.'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => setScreen('calculator')}>
                        Hesabı aç
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => openUrl(SELLER_TERMS)}>
                        Komisyonu doğrula <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {selected && inputResult ? <QuoteContext item={selected} historicalProfit={inputResult.operatingProfit} /> : null}

            {selected && result ? (
              <Card className="shadow-none">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Kesinti dökümü</CardTitle>
                    <CardDescription>Şeffaf maliyet kırılımı</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <ShieldCheck className="size-3.5" />
                    {selected.commissionSource === 'reference'
                      ? 'Referans oran'
                      : selected.commissionSource === 'panel'
                        ? 'Panelden girildi'
                        : 'Sipariş kaydı'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric label="Brüt fiyat farkı" value={result.grossSpread} icon={<TrendingUp className="size-4" />} />
                    <Metric label="Komisyon · KDV dahil" value={-result.commissionGross} icon={<ArrowDownRight className="size-4" />} />
                    <Metric
                      label="Kargo + platform + paket"
                      value={-(selected.shippingGross + selected.serviceGross + selected.packagingGross)}
                      icon={<ArrowDownRight className="size-4" />}
                    />
                    <Metric label="Stopaj · mahsup edilebilir" value={-result.withholding} icon={<Wallet className="size-4" />} muted />
                  </div>
                  <Separator />
                  <p className="flex gap-2 text-xs text-muted-foreground">
                    <Info className="size-3.5 shrink-0" />
                    Kâr, maliyet ve giderlerin indirilebilir KDV’si dikkate alınarak hesaplanır. Stopaj yalnız nakit görünümünü etkiler.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {screen === 'calculator' && selected && inputResult ? (
              <Card className="shadow-none">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Ürün ve maliyet bilgileri</CardTitle>
                    <CardDescription>Senaryo girdileri</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openUrl(OFFICIAL_COMMISSION)}>
                    Trendyol açıklaması <ExternalLink className="size-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <NumberField label="HB alış · KDV dahil" value={selected.purchaseGross} onChange={purchaseGross => updateSelected({ purchaseGross })} />
                    <NumberField label="TY satış · KDV dahil" value={selected.saleGross} onChange={saleGross => updateSelected({ saleGross })} />
                    <NumberField label="Komisyon oranı · KDV dahil" value={selected.commissionPercent} onChange={commissionPercent => updateSelected({ commissionPercent })} suffix="%" />
                    <NumberField label="Kargo · KDV dahil" value={selected.shippingGross} onChange={shippingGross => updateSelected({ shippingGross })} />
                    <NumberField label="Platform bedeli · KDV dahil" value={selected.serviceGross} onChange={serviceGross => updateSelected({ serviceGross })} />
                    <NumberField label="Paketleme · KDV dahil" value={selected.packagingGross} onChange={packagingGross => updateSelected({ packagingGross })} />
                    <NumberField label="Satıcının karşıladığı indirim" value={selected.sellerDiscountGross} onChange={sellerDiscountGross => updateSelected({ sellerDiscountGross })} />
                    <NumberField
                      label="Kart kampanyası indirimi"
                      value={selected.cardDiscountGross}
                      onChange={cardDiscountGross => updateSelected({ cardDiscountGross })}
                      hint="Yalnız alışta fiilen uygulanmışsa dahil edin."
                    />
                  </div>

                  <div className="flex flex-wrap gap-5">
                    <ToggleRow
                      checked={selected.cardDiscountConfirmed}
                      onChange={cardDiscountConfirmed => updateSelected({ cardDiscountConfirmed })}
                      label="Kart indirimini alış maliyetine uygula"
                    />
                    <ToggleRow
                      checked={selected.inputVatDeductible}
                      onChange={inputVatDeductible => updateSelected({ inputVatDeductible })}
                      label="HB alış faturasındaki KDV indirilebilir"
                    />
                    <ToggleRow
                      checked={selected.commissionVatIncluded}
                      onChange={commissionVatIncluded => updateSelected({ commissionVatIncluded })}
                      label="Komisyon oranına KDV dahil"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <NumberField label="Alış KDV oranı" value={selected.purchaseVatPercent} onChange={purchaseVatPercent => updateSelected({ purchaseVatPercent })} suffix="%" />
                    <NumberField label="Satış KDV oranı" value={selected.saleVatPercent} onChange={saleVatPercent => updateSelected({ saleVatPercent })} suffix="%" />
                    <NumberField label="Güncel HB gözlemi · KDV dahil" value={selected.observedPurchaseGross ?? 0} onChange={observedPurchaseGross => updateSelected({ observedPurchaseGross })} />
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <NumberField label="Kâr eşiği" value={data.minProfit} onChange={minProfit => setData(previous => ({ ...previous, minProfit }))} />
                    <SummaryStat label="Başa baş satış" value={inputResult.breakEvenSaleGross === null ? 'Hesaplanamıyor' : currency(inputResult.breakEvenSaleGross)} />
                    <SummaryStat label="Stopaj sonrası nakit" value={currency(inputResult.afterWithholding)} />
                    <SummaryStat label="KDV bakiyesi" value={currency(inputResult.vatBalance)} />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </main>

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü düzenle</DialogTitle>
            <DialogDescription>Kimlik, bağlantı ve doğrulama alanları</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Ürün adı" value={selected.name} onChange={name => updateSelected({ name })} />
                <TextField label="Marka" value={selected.brand} onChange={brand => updateSelected({ brand })} />
                <TextField label="Kategori" value={selected.category} onChange={category => updateSelected({ category })} />
                <TextField label="Barkod / EAN" value={selected.barcode} onChange={barcode => updateSelected({ barcode })} placeholder="Eşleşme doğrulaması için" />
                <TextField label="Hepsiburada bağlantısı" value={selected.hepsiburadaUrl} onChange={hepsiburadaUrl => updateSelected({ hepsiburadaUrl })} />
                <TextField label="Trendyol bağlantısı" value={selected.trendyolUrl} onChange={trendyolUrl => updateSelected({ trendyolUrl })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Komisyon kaynağı</Label>
                  <Select value={selected.commissionSource} onValueChange={value => updateSelected({ commissionSource: value as CommissionSource })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reference">Referans / tahmin</SelectItem>
                      <SelectItem value="panel">Satıcı panelinden teyit ettim</SelectItem>
                      <SelectItem value="settlement">Gerçek sipariş kaydı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ürün eşleşmesi</Label>
                  <Select value={selected.matchStatus} onValueChange={value => updateSelected({ matchStatus: value as MatchStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unverified">Henüz doğrulanmadı</SelectItem>
                      <SelectItem value="verified">Barkod + paket içeriği aynı</SelectItem>
                      <SelectItem value="mismatch">Farklı ürün / varyant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>İzleme durumu</Label>
                  <Select value={selected.watchStatus} onValueChange={value => updateSelected({ watchStatus: value as Opportunity['watchStatus'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="paused">Duraklatıldı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TextField label="Talep sinyali" value={selected.demand} onChange={demand => updateSelected({ demand })} placeholder="Örn. 3 günde 1B+ satış" />
              </div>
              <div className="space-y-2">
                <Label>Not ve kaynak açıklaması</Label>
                <textarea
                  value={selected.note}
                  onChange={event => updateSelected({ note: event.target.value })}
                  rows={4}
                  className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter className="sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Veriler yalnız bu cihazda saklanır.
            </p>
            <Button onClick={() => setShowEditor(false)}>
              Kaydet ve kapat <Check className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Metric({
  label,
  value,
  icon,
  muted = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="flex size-8 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className={cn('mt-1 text-sm font-medium', value < 0 && !muted && 'text-destructive')}>{currency(value)}</p>
      </div>
    </div>
  );
}

function QuoteContext({ item, historicalProfit }: { item: Opportunity; historicalProfit: number }) {
  if (!item.observedPurchaseGross || item.observedPurchaseGross <= 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 font-medium">
        <CircleAlert className="size-4" />
        Fiyat fırsatı değişti
      </div>
      <p className="text-xs text-amber-900/80 sm:max-w-2xl">
        Son HB gözlemi {item.observedAt}: <strong>{currency(item.observedPurchaseGross)}</strong>.
        Yukarıdaki karar hesabı bu fiyattan yapılır. {currency(item.purchaseGross)} geçmiş alışla stoktaki ürünün tahmini kârı{' '}
        <strong>{currency(historicalProfit)}</strong>.
      </p>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <Checkbox checked={checked} onCheckedChange={value => onChange(value === true)} />
      <span>{label}</span>
    </label>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function SourcesScreen() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Kaynaklar ve komisyon</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Tahmini oranla başlayın; karar vermeden önce hesabınıza özel tarifeyi Trendyol’dan doğrulayın.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardHeader>
            <CardDescription>01 · Resmi kaynak</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Satıcı Paneli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Güncel komisyon ve vade oranları Ticari Şartlar’da. Kategori filtresi ve ticari seviye tarifeyi etkiler.
            </p>
            <Button className="w-full" onClick={() => openUrl(SELLER_TERMS)}>
              Satıcı paneline git <ArrowUpRight className="size-4" />
            </Button>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link2 className="size-3.5" /> partner.trendyol.com/incentive
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardDescription>02 · Hesaplama kuralı</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-4" /> Komisyon KDV dahil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Oran komisyon KDV’sini içerir. Komisyon, gerçekleşen satış tutarı × oran üzerinden hesaplanır.
            </p>
            <Button variant="outline" className="w-full" onClick={() => openUrl(OFFICIAL_CALC)}>
              Resmi örneği oku <ArrowUpRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardDescription>03 · Gerçekleşen sipariş</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" /> Finans API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Teslim edilen siparişlerde <code className="rounded bg-muted px-1 py-0.5 text-xs">commissionRate</code> ve tutar alanları kesin kayıttır.
            </p>
            <Button variant="outline" className="w-full" onClick={() => openUrl(FINANCE_API)}>
              API dokümanını aç <ArrowUpRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-amber-200 bg-amber-50">
        <CardContent className="flex gap-3 p-5">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-800" />
          <div>
            <h3 className="text-sm font-semibold text-amber-950">Neden internette farklı rakamlar görünüyor?</h3>
            <p className="mt-1 text-sm text-amber-900/80">
              Üçüncü taraf hesaplayıcılar ile satıcı sözleşmesi tabloları farklı oran gösterebilir. Bu yüzden uygulama referans oranı otomatik olarak doğrulanmış saymaz.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5" />
        Canlı fiyat taraması bu sürümde bağlı değildir. Gözlemler ve komisyon durumu elle güncellenir.
      </p>
    </div>
  );
}
