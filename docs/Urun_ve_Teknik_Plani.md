# OmniMind — Ürün ve teknik plan

Bu doküman günlük, yapay zeka analizi, müzik önerisi ve ilgili altyapı için **ne yapılacağını** ve **önerilen uygulama sırasını** kayıt altına alır. İlerleyen geliştirmede burayı güncellemek yeterlidir.

---

## 1. Özet ve hedefler

| Başlık | Hedef |
|--------|--------|
| Günlük | Kullanıcı metin yazabilsin; kayıtlar saklansın; ruh hali ile ilişkilensin; ileride haftalık özet/analiz mümkün olsun. |
| Güvenlik | İleride sorun yaşamamak için şifreleme ve veri akışı erken tasarlanacak (detay §3.3). |
| Yapay zeka | Analiz ve öneriler sunucu üzerinden; API anahtarları mobilde olmayacak. |
| Müzik | Spotify zorunlu olmasın; **uygulama içi çalma** öncelikli; arka planda/sayfa değişiminde süreksinlik. |
| Dil | Şimdilik Türkçe; altyapı çok dile uygun (i18n + API locale). |

---

## 2. Mevcut durum (referans)

- **Backend:** .NET 9, `OmniMind.WebApi`, JWT, EF Core + SQL Server, kimlik (`Auth`), **günlük (CQRS + MediatR + AES-GCM şifreleme)** — migration’ı uygulamak için:  
  `dotnet ef migrations add JournalAndUserContentKeys -p OmniMind.Infrastructure -s OmniMind.WebApi`  
  ardından `dotnet ef database update -p OmniMind.Infrastructure -s OmniMind.WebApi`  
  (Komut `backend/OmniMind` klasöründen çalıştırılmalı.) Geliştirme ortamında `appsettings.Development.json` içinde `DataEncryption:MasterKeyBase64` (32 bayt Base64) tanımlı olmalı; üretimde gizli depoda saklayın.
- **Mobil:** Expo, giriş/kayıt/ana sayfa, ortak tema (`src/theme/colors.ts`).
- **Kayıtta:** Kullanım şartları, gizlilik, AI analizi vb. için onay alanları mevcut (backend ile uyumlu genişletilebilir).

---

## 3. Günlük modülü

### 3.1 Kullanıcı özellikleri (ürün)

- [ ] Yeni günlük oluşturma (metin, tarih/saat otomatik veya düzenlenebilir).
- [ ] İsteğe bağlı: o günkü **ruh hali** seçimi (mevcut landing’deki chip mantığı ile uyumlu olabilir).
- [ ] Günlük listesi (tarihe göre; basit filtre: son 7 gün / tümü).
- [ ] Günlük detay / düzenleme / silme (silme politikası: yumuşak silme veya kalıcı — karar).
- [ ] Taslak / çevrimdışı (isteğe bağlı faz 2): yerelde tutup bağlantı gelince senkron.

### 3.2 Veri modeli (taslak)

Sunucuda örnek varlıklar (isimler projeye göre netleştirilir):

- `JournalEntry`: `Id`, `UserId`, `CreatedAt`, `UpdatedAt`, `Mood` (nullable enum veya string), `Title` (opsiyonel), `BodyCipher` veya `Body` + şifreleme katmanı, `EncryptionVersion` (ileride anahtar rotasyonu için).
- İleride: `JournalAnalysis`: günlük veya dönem bazlı AI çıktısı, model sürümü, oluşturulma zamanı.

### 3.3 Şifreleme (notlar — uygulama öncesi karar)

- **Minimum:** TLS, veritabanı/disk şifreleme, günlük içeriğinin loglara düşmemesi.
- **Hedef:** Uygulama katmanında içerik için **AES-GCM** (veya eşdeğeri); kullanıcı başına veya giriş bazlı anahtar yönetimi; anahtarların KMS/HSM veya güvenli saklama ile korunması.
- **E2EE + sunucuda tam analiz** birlikte zor; analiz anında metnin işlendiği senaryoda **açık rıza metni** ve isteğe bağlı “AI analizi kapalı” modu düşünülmeli.
- Bu dokümanda kilitlemeden önce: “Parola unutulunca kurtarma” ve “Sunucu analiz edebilsin mi?” sorularına net cevap yazılacak.

### 3.4 API (taslak)

- `POST /api/journal/create` — oluştur.
- `GET /api/journal/list` — sayfalama ile liste.
- `GET /api/journal/{id}` — detay.
- `PUT /api/journal/{id}` — güncelle.
- `DELETE /api/journal/{id}` — sil.

Tümü JWT ile kullanıcıya bağlı.

### 3.5 Haftalık analiz (sonraki faz)

- Haftalık job veya kullanıcı tetiklemeli “Bu haftayı özetle”.
- Girdi: o haftanın günlükleri (ve/veya önceden üretilmiş günlük analizleri).
- Çıktı: özet metin, tema etiketleri, isteğe bağlı müzik öneri parametreleri ile bağlantı.

---

## 4. Yapay zeka entegrasyonu

### 4.1 Prensipler

- Çağrılar **OmniMind.WebApi** (veya ileride ayrı bir worker) üzerinden; **API key sunucuda**.
- Mobil sadece istek gönderir ve sonucu gösterir.
- Türkçe prompt ve çıktı; ileride `Accept-Language` / `locale` ile genişletme.

### 4.2 Senaryolar (MVP → genişleme)

1. **Tek günlük analizi:** özet, duygu tonu (nazik ifade), 1–2 kısa öneri (genel wellness; tıbbi iddia yok).
2. **Haftalık özet** (§3.5).
3. **Müzik önerisi parametreleri:** LLM çıktısı yapılandırılmış alanlar (ör. `energy: low|medium|high`, `genres: []`, `moodTags: []`, `searchQuery: string`) — müzik katmanı bunu kullanır.

### 4.3 Backend bileşenleri (yapılacaklar)

- [ ] Yapılandırma: model sağlayıcı (ör. OpenAI / Azure OpenAI / Anthropic), endpoint, model adı, `appsettings` + gizli ortam değişkenleri.
- [ ] Servis: `IJournalAnalysisService` — giriş metni + ruh hali + dil → JSON veya metin çıktı (tercihen **JSON şeması** ile parse güvenliği).
- [ ] Kota / rate limit (kullanıcı başına günde N istek).
- [ ] İsteğe bağlı: moderasyon / maksimum token / içerik filtresi.
- [ ] Sonuçları DB’de saklama (tekrar göstermek ve maliyeti düşürmek için).

### 4.4 Gizlilik ve ürün metni

- Kayıttaki AI izni ile uyumlu kısa açıklama: verinin modele gittiği anlar.
- Ayarlar: “Yapay zeka ile analiz” aç/kapa (backend bu bayrağa göre reddeder).

---

## 5. Müzik

### 5.1 Hedef deneyim

- Kullanıcı **uygulama içinde** dinler; **giriş/kayıt/günlük/mesajlaşma** ekranları arasında gezerken çalma sürer.
- **Spotify hesabı zorunlu değil.**
- Öneri: ruh hali + (isteğe bağlı) günlük/AI çıktısından “ne dinlensin” kararı.

### 5.2 Teknik (mobil)

- [ ] `expo-av` (veya proje standardına uygun ses paketi) ile merkezi oynatıcı.
- [ ] Oynatıcıyı root layout veya global state ile yaşatmak (navigasyon bağımsız).
- [ ] iOS: Background Audio yetkisi; Android: medya oturumu / foreground service gereksinimlerinin kontrolü.
- [ ] Mini oynatıcı UI (isteğe bağlı): alt barda play/pause, parça adı.

### 5.3 Kaynak stratejisi (yasal sürdürülebilirlik)

- **Kısa vadede:** Sınırlı **lisanslı veya royalty-free** parça listesi (sabit URL veya CDN); AI sadece bu listeden seçim yapar veya listeyi etiketlere göre filtreler.
- **YouTube:** “Uygulama içi her şarkı” yerine isteğe bağlı **harici açma** (MVP); tam uygulama içi deneyle çelişir; ToS ve API kısıtları nedeniyle ana strateji olarak işaretlenmedi.
- **Uzun vade:** Daha geniş katalog için lisans/anlaşma veya kullanıcı dosyası yükleme (ayrı ürün kararı).

### 5.4 Backend / akış

- [ ] Endpoint veya günlük analizi sonrası: `MusicRecommendation` — `trackId` veya `streamUrl` + meta (sadece katalogdaki parçalar için).
- [ ] AI’dan gelen yapılandırılmış alanlar → sunucuda katalog eşlemesi (basit kural + isteğe bağlı ikinci LLM adımı yok denecek kadar az tutulabilir).

---

## 6. Uluslararasılaşma (i18n)

- [ ] Mobil: `tr` varsayılan; tüm kullanıcı metinleri anahtar dosyalarında (ör. `i18next`).
- [ ] Backend: hata mesajları ve sabit metinler için locale; AI isteğinde `locale` alanı.
- [ ] Kullanıcı profili: `preferredLanguage` (ileride).

---

## 7. İleride: mesajlaşma (kısa not)

- Müzik oynatıcısı global kaldığı sürece mesajlaşma ekranı ile çakışma olmamalı.
- Mesajlaşma için ayrı dokümanda: WebSocket/sinyal, bildirim, moderasyon, şifreleme kararları.

---

## 8. Önerilen uygulama sırası

Aşamaları bu sırayla ilerletmek, bağımlılıkları azaltır.

| Sıra | Konu | Çıktı |
|------|------|--------|
| 1 | Günlük veri modeli + migration + CRUD API | Kayıtlı günlükler |
| 2 | Mobil: günlük yazma / liste / detay | Uçtan uca günlük |
| 3 | Şifreleme kararı dokümante + uygulama (minimum veya hedef seviye) | Güvenlik netliği |
| 4 | AI: tek “günlük analizi” endpoint + mobil “Analiz et” | İlk AI değeri |
| 5 | Müzik: küçük katalog + uygulama içi oynatıcı + basit öneri (kural veya AI parametresi) | Tamamlanmış müzik döngüsü |
| 6 | Haftalık özet | Toplu analiz |
| 7 | i18n altyapısı + ikinci dil denemesi | Genişleme hazırlığı |

---

## 9. Açık kararlar (takip listesi)

- [ ] Şifreleme: sunucunun içeriği çözebilmesi mi, yoksa daha sıkı E2EE mi?
- [ ] Günlük silme: kalıcı mı, yumuşak silme + süre mi?
- [ ] İlk müzik katalogu: kaç parça, dosya nerede host edilecek?
- [ ] LLM sağlayıcısı: OpenAI / Azure / diğer (maliyet ve veri bölgesi)?
- [ ] Analiz başına kullanıcı kotası?

---

## 10. Doküman bakımı

- Her büyük özellik tamamlandığında ilgili bölüme “Tamamlandı” ve tarih eklenebilir.
- Mimari değişince §3.3, §4, §5 güncellenmeli.

*Son güncelleme: planlama amaçlı oluşturuldu; uygulama adımları başladıkça revize edin.*
