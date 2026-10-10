# Sürekli izleme akışı için ilk canlı test — 19 Eylül 2026

## Doğrulanan veri akışı

1. Trendyol'un [Çok Satanlar](https://www.trendyol.com/cok-satanlar?categoryId=104593&type=bestSeller&webGenderId=1) sayfasında Spor&Outdoor kategorisi seçildi. Sayfa yüklenince ürün bağlantıları okunabildi. Sayfadaki ayrı sekmeler “En Çok Satılanlar”, “En Çok Tekrar Satın Alınanlar”, “En Çok Ziyaret Edilenler”, “En Çok Favorilenenler” ve “En Çok Değerlendirilenler”. Satış sinyali için ilk sekme esas alınmalı. Trendyol'un [açıklaması](https://www.trendyol.com/s/kampanya-detaylari), “En Çok Satanlar”ı ilgili kategori/marka/mağazanın son 30 gündeki en çok satanları olarak tanımlıyor. Bu bir sıralama sinyali; adet bazlı satış verisi değildir.
2. Görünen ilk 20 üründen [Stanley The Transit Fliptop Mug 0,47 L Pudra](https://www.trendyol.com/stanley/the-transit-fliptop-mug-0-47-l-termos-kupa-bardak-matara-pudra-p-1142294092) açıldı. Ürün sayfasında “Mug kategorisinde En Çok Satılan #1” ve **1.989 TL** fiyat görüldü.
3. [Hepsiburada araması](https://www.hepsiburada.com/ara?q=Stanley+The+Transit+Fliptop+Mug+0.47+Pudra) aynı adla yapıldı. İlk sonuçlar içinde **875 TL'lik AeroLight Transit** ve **2.079,20 TL'lik The Transit Fliptop Mug 0,47 L Rose** vardı. AeroLight farklı seridir; 875 TL'yi 1.989 TL ile eşleştirmek yanlış pozitif fırsat üretir. Rose ilanın renk/barkod eşleşmesi ayrıca doğrulanmalı. Görünen 2.079,20 TL alış fiyatı, 1.989 TL satış fiyatından **90,20 TL yüksek**; komisyon ve diğer giderler eklenmeden bile fırsat değil. Rose ilanda “Ek 200 TL Kupon” etiketi vardı; kupon koşulu ve uygulanan tutar doğrulanmadığından fiyattan düşülmedi.

Bu test, “Trendyol talep sinyali → HB eşleştirme → maliyet filtresi” zincirinin elle uygulanabildiğini ve ürün adı benzerliğinin tek başına eşleştirme için yetersiz olduğunu gösterir. Sürekli, otomatik ve izinli veri erişimi henüz doğrulanmadı.

## İkinci gözlem: satış ve ilgi sinyalleri

Aynı [Spor&Outdoor çok satanlar ekranında](https://www.trendyol.com/cok-satanlar?categoryId=104593&type=bestSeller&webGenderId=1) 19 Eylül'de seçili sekmenin **En Çok Satılanlar** olduğu doğrulandı. Stanley The Transit Fliptop Mug Pudra kartı #2 sırasını ve “3 günde 1B+ ürün satıldı”, “4,4B kişinin sepetinde”, “52,6B kişi favoriledi”, “24 saatte 9B kişi inceledi”, 4,6 puan ve 273 değerlendirme ifadelerini gösterdi. Bunlar platformun kart üzerinde yayımladığı yaklaşık göstergelerdir; bağımsız doğrulanmış satış kaydı veya gelecekteki satış garantisi değildir. Aynı kategorinin **En Çok Favorilenenler** sekmesindeki ilk 20 ürün farklıydı; Stanley AeroLight Pembe burada görünürken, bu iki Stanley varyantı birbirinin yerine kullanılamaz.

Talep modeli için satış sırası ve kısa dönem satış ifadesi birincil; sepete ekleme, favori ve görüntülenme ikincil; yorum sayısı ve puanı kalite/geçmiş ilgiyi değerlendiren yardımcı sinyal olmalı. Farklı zamanlarda alınan anlık görüntülerde sinyallerin değişimi de tutulmalı. Tek bir yüksek favori veya yorum sayısı satış adedi sayılmamalı.

[HB kampanyalar sayfası](https://www.hepsiburada.com/kampanyalar) aynı gün sepette yüzde indirim, eşikli indirim ve çoklu alım teklifleri gösterdi. Böylece ikinci keşif yolu da mümkün: **HB kampanyalı ürün → Trendyol talep ve satış fiyatı doğrulaması**. Kampanya kartı yalnızca aday üretir; ilgili ürün/satıcı, sepet eşiği, birleşebilirlik ve gerçekten uygulanmış ödeme tutarı görülmeden alış maliyeti azaltılmaz. Önceki HB Stanley aramasındaki 2.079,20 TL kart tutarı, ilan açılınca seçili Hepsiburada satıcısında 2.599 TL olarak göründü; satıcı ve karar anındaki ürün sayfası fiyatı ayrı kaydedilmeli.

## Önerilen izleme kuralı

- Her başarılı Trendyol taramasında kategori, sıralama türü, konum, ürün URL'si ve zamanı kaydet. Kategorideki yeni SKU'ları aday havuzuna ekle.
- EAN/GTIN ya da üretici model kodu, kapasite, renk ve paket adedi doğrulanana kadar HB sonucunu “inceleme gerekli” tut. Eşleşen HB ilanının fiyatını ve stok durumunu izle; aynı ürünü her seferinde yeniden arama.
- Ürün iki ardışık **başarılı** Trendyol taramasında izlenen listenin dışındaysa yoğun HB takibini durdur. Başarısız veya boş taramayı listeden çıkma sayma. Ürün yeniden girerse takibi aç. Liste dışına çıkış ayrıca kullanıcıya özetlenebilir.
- Kâr hesaplarını **kampanyasız** ve **doğrulanmış kampanyalı** olarak ayrı göster. Visa benzeri tek kullanımlık indirimlerde kart, kategori, alt limit, süre, kullanım hakkı ve ödeme sayfasındaki gerçek indirim gerekir. Sipariş indirimi her ürüne ayrı ayrı yazılmaz. Sonradan kazanılan puan/iade, anlık nakit indirimi olarak sayılmaz.
- Telegram bildirimi için aynı fırsata tekrar mesaj yollamayı sınırlayıp ancak fiyat/kâr anlamlı değişirse yeniden bildir. Mesajda ürün varyantı, kaynak bağlantıları, fiyat zamanı, varsayılan kesintiler, tahmini kâr, kârsızlık sınırı ve güven düzeyi bulunmalı.

## Sınır

Trendyol'un [satıcı buybox servisi](https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-buybox-kontrol-servisi) satıcının kendi ürün barkodlarının buybox bilgisine yöneliktir; genel bir çok satanlar API'si olarak varsayılamaz. Üretim sürümünden önce liste erişiminin kullanım koşulları, sürekliliği, veri doğruluğu ve gerçek satıcı kesintileri küçük bir gözlem pilotunda ölçülmeli.
