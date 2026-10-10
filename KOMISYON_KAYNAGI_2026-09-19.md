# Trendyol komisyonu: resmi erişim ve pilot kararı — 19 Eylül 2026

## Kesin kaynağa erişim

Trendyol'un [Satıcı Bilgi Merkezi, “Trendyol Komisyonları”](https://akademi.trendyol.com/satici-bilgi-merkezi/detay/trendyol-komisyonlari) sayfası, **Satıcı Paneli → Ticari Şartlar → Komisyon & Vade Tablosu** yolunu veriyor. Doğrudan panel bağlantısı [partner.trendyol.com/incentive](https://partner.trendyol.com/incentive). Panelde kategori filtresini **Tüm Kategoriler** yaparak veya PDF indirerek diğer kategoriler de incelenebilir. Trendyol, kategori, marka, ticari seviye ve varyantın oranı değiştirebildiğini; **komisyon oranlarına KDV dahil olduğunu** açıkça belirtiyor. Bu alan satıcı oturumu gerektirir; kullanıcının hesabı burada açılmadığı için kendisine tanımlı kesin oran okunmadı.

Trendyol'un [Komisyon Tutarı Hesaplama](https://akademi.trendyol.com/satici-bilgi-merkezi/detay/komisyon-tutari-hesaplama) açıklaması: gerçekleşen satış tutarı × komisyon oranı. 100 TL ve %20 örneğinde 20 TL; kampanyalı 90 TL'de 18 TL. [Platform Hizmet Bedeli](https://akademi.trendyol.com/satici-bilgi-merkezi/detay/platform-hizmet-bedeli) sayfası gönderi başına 10,99 TL + KDV, uygun “Bugün Kargoda” gönderisinde 4,99 TL + KDV diyor. Güncel ve uygulanabilir tutar panel ve faturayla yine doğrulanmalı.

[Trendyol Cari Hesap Ekstresi API](https://developers.trendyol.com/docs/cari-hesap-ekstresi-entegrasyonu) teslim edilmiş siparişlerde `commissionRate` ve `commissionAmount` döndürüyor; satış/kupon/indirim/iade `settlements`, platform hizmet bedeli ve stopaj `otherfinancials` altında. **Önceden tüm kategorilerin satıcıya özel güncel oranlarını veren belgelenmiş bir API uç noktası bulunamadı**; güncel tarife panelden alınmalı, gerçek sipariş sonradan API ile doğrulanmalı.

## Tablet örneğinde dış kaynakların çatışması

- [NeSatılır hesaplayıcısı](https://nesatilir.com/Trendyol-Komisyon-Hesaplama): “Elektronik > Bilgisayar Tablet > Tablet” seçince **%6** gösterdi. Kaynağın tarihi ve kullanıcının hesabına uygunluğu belirtilmiyor.
- [Çevrimiçi sözleşme tablosu PDF kopyası](https://netkarim.app/docs/trendyol-komisyon-oranlari-2026.pdf): “Elektronik / Tablet Grubu / Tablet” satırında genel **%8,5 KDV dahil**, seviye 5 **%5,5**, seviye 4 **%6,5**. Belge Trendyol alan adında barındırılmadığı için güncelliği ve hesapta uygulanması teyitsiz.
- Bu oranlar arasındaki fark, fiyat değerlendirmesini anlamlı ölçüde değiştirir. Huawei örneği, **14.499 TL KDV dahil alış**, **16.328 TL satış**, **13,19 TL KDV dahil platform bedeli**, **0 TL kargo**, **%20 alış/satış KDV'si ve alış KDV'sinin indirilmesi** varsayımıyla:

| KDV dahil komisyon oranı | KDV dahil komisyon kesintisi | Stopaj hariç faaliyet katkısı | Stopaj sonrası nakit etkisi* |
| ---: | ---: | ---: | ---: |
| %5,5 | 898,04 TL | 764,81 TL | 628,74 TL |
| %6 | 979,68 TL | 696,78 TL | 560,71 TL |
| %6,5 | 1.061,32 TL | 628,74 TL | 492,68 TL |
| %8,5 | 1.387,88 TL | 356,61 TL | 220,54 TL |

\* Stopaj 136,07 TL; GİB'e göre gelir/kurumlar vergisinden mahsup edilebilir. [GİB bilgi notu](https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Finfografikler%2Fpdfs%2Feticarettevkifat.pdf). Gerçek kargo ve indirimler girilmediğinden bu bir sipariş kesin kârı değildir.

## Uygulama kararı

İlk masaüstü sürümünde komisyon oranı, **kaynak türü** (`referans`, `satıcı paneli`, `gerçek sipariş`) ve **KDV dahil olup olmadığı** ile saklanır. Referans oran ve ürün eşleşmesi doğrulanmadıkça “doğrulanmış fırsat” gösterilmez. KDV indirimi fatura durumuna bağlı ayrı bir seçenektir. Stopaj faaliyet kârından değil nakit görünümünden düşülür.
