# OmniMind — Gizlilik Politikası

**Son güncelleme:** 14 Nisan 2026

Bu metin, **OmniMind** mobil uygulamasının (“Uygulama”) Google Play üzerinden dağıtımı ve 6698 sayılı **Kişisel Verilerin Korunması Kanunu** (“KVKK”) kapsamında kullanıcıların bilgilendirilmesi amacıyla hazırlanmıştır.

> **Önemli:** Aşağıdaki `[DOLDURUN]` ile işaretli alanları kendi tüzel/gerçek kişi unvanınız, adresiniz ve iletişim e-postanız ile değiştirin. Play Console’da Gizlilik politikası URL’si olarak bu metnin yayınlandığı **herkese açık bir web adresi** kullanmalısınız (ör. şirket siteniz, GitHub Pages veya statik hosting).

---

## 1. Veri sorumlusu

| Alan | Değer |
|------|--------|
| Ticari unvan / ad | `[DOLDURUN]` |
| Adres | `[DOLDURUN]` |
| E-posta (başvuru ve talepler) | `[DOLDURUN]` |

KVKK uyarınca veri sorumlusu yukarıdaki tüzel/gerçek kişidir.

---

## 2. Uygulamanın kısa tanımı

OmniMind; kullanıcıların **günlük metinleri** ve isteğe bağlı **ruh hali** bilgisini kaydetmesine, listelemesine ve düzenlemesine olanak tanıyan bir uygulamadır. İsteğe bağlı olarak, kullanıcı tetiklediğinde günlük metnine dayalı **yapay zekâ destekli kısa yorum** ve **müzik önerisi metni** üretilebilir.

---

## 3. İşlenen kişisel veriler ve amaçları

### 3.1. Hesap ve kimlik doğrulama

| Veri | Kaynak | Amaç | Hukuki sebep (KVKK) |
|------|--------|------|---------------------|
| E-posta, kullanıcı adı, parola (sunucuda güvenli şekilde saklanır; Uygulama parolayı düz metin olarak saklamaz) | Kayıt / giriş | Hesap oluşturma, oturum açma, güvenlik | Sözleşmenin kurulması ve ifası; meşru menfaat |
| İsteğe bağlı görünen ad | Kayıt | Uygulama içinde gösterim | Sözleşmenin ifası |
| Oturum jetonu (`accessToken`), son kullanma bilgisi, kullanıcı tanımlayıcıları, e-posta ve kullanıcı adı (özet) | Sunucu yanıtı | Oturumun sürdürülmesi | Sözleşmenin ifası |

**Cihazda yerel saklama:** Oturum bilgileri ve kimlik doğrulama için gerekli veriler, cihazınızda **AsyncStorage** ile saklanabilir (ör. erişim jetonu, kullanıcı kimliği, e-posta, kullanıcı adı). Bu veriler yalnızca Uygulamanın çalışması için kullanılır; üçüncü taraflara satılmaz.

### 3.2. Günlük içeriği

| Veri | Amaç | Hukuki sebep |
|------|------|--------------|
| Günlük başlığı (isteğe bağlı), gövde metni, ruh hali etiketi, oluşturulma/güncellenme zamanı | Hizmetin sunulması, senkronizasyon, düzenleme ve silme | Sözleşmenin ifası |
| İsteğe bağlı olarak kaydedilen yapay zekâ yorumu ve müzik önerisi metni | Özelliğin sunulması | Açık rıza (kayıtta “Yapay zekâ ile günlüklerimin analiz edilmesine izin ver” seçeneği işaretlenmişse) ve/veya sözleşmenin ifası |

### 3.3. Kayıtta işaretlenen tercihler (rıza kayıtları)

Kayıt sırasında işaretlediğiniz seçeneklere bağlı olarak sunucuda **onay türleri** (ör. kullanım şartları, gizlilik politikası, yapay zekâ analizi, anonim paylaşım, kişiselleştirilmiş öneri/bildirim) kaydedilebilir. Amaç, yükümlülüklerin ispatı ve tercihlere uygun hizmettir.

### 3.4. Uygulama tercihleri (kişisel veri niteliği taşımayabilir)

Tema (açık/koyu) gibi yalnızca cihazda tutulan tercihler, sunucuya gönderilmeden **yalnızca cihazda** saklanabilir.

---

## 4. Yapay zekâ ve üçüncü taraf hizmetler

### 4.1. Günlük taslağı analizi (isteğe bağlı)

“Yorum yap” benzeri bir özellik kullandığınızda, günlük **metniniz** ve isteğe bağlı **ruh hali** bilgisi, OmniMind **arka uç sunucuları** üzerinden, yapılandırmaya bağlı olarak **OpenAI uyumlu bir API** (ör. OpenAI veya Groq gibi) ile paylaşılabilir. Bu işlem yalnızca siz özelliği kullandığınızda ve ilgili onaylarınız çerçevesinde gerçekleşir.

- **Aktarılan veri:** Analiz için gerekli metin ve ruh hali.  
- **Amaç:** Kısa yorum ve müzik önerisi metni üretmek.  
- **Üçüncü taraf gizlilik politikaları:** Kullandığınız dağıtımda hangi sağlayıcının etkin olduğunu veri sorumlusu belirler; ilgili sağlayıcının (ör. OpenAI, Groq) güncel politikalarını incelemeniz önerilir.

### 4.2. Apple iTunes Search API (müzik önizlemesi)

Müzik önizleme özelliği, cihazınızdan **Apple iTunes Arama API**’sine (`itunes.apple.com`) sorgu gönderebilir. Bu sırada arama terimi olarak önerilen parça bilgisi kullanılır. Apple’ın veri uygulamaları için [Apple’ın gizlilik bilgileri](https://www.apple.com/legal/privacy/) geçerlidir.

### 4.3. Harici bağlantılar

Uygulama, Spotify veya YouTube gibi hizmetlere yönlendirme yapabilir. Bu sitelerdeki işlemler kendi gizlilik politikalarına tabidir.

---

## 5. Kişisel verilerin aktarılması

- Verileriniz öncelikle **veri sorumlusunun** kontrolündeki sunucu ve veri tabanında işlenir.  
- İsteğe bağlı yapay zekâ analizi kapsamında, yukarıda belirtilen **yurt içi veya yurt dışı** yapay zekâ altyapı sağlayıcılarına aktarım söz konusu olabilir. Bu durumda KVKK **m. 9** (yeterli önlemler ve açık rıza gereksinimleri) ve ilgili mevzuat çerçevesinde hareket edilir; kullanıcı onay ekranları bu çerçevede tasarlanmıştır.

---

## 6. Saklama süresi

Kişisel veriler, ilgili mevzuatta öngörülen süreler veya işleme amacının gerektirdiği süre boyunca saklanır; amaç ortadan kalktığında silinir, yok edilir veya anonim hale getirilir. Günlük ve hesap verileri için net süreleri veri sorumlusu iç prosedürlerinde ve/veya ayrı bir veri saklama politikasında belirler; talep halinde `[DOLDURUN]` iletişim adresinden bilgi verilir.

---

## 7. Güvenlik

Parola ve oturum güvenliği için endüstri standardı yöntemler (ör. güvenli iletim, sunucu tarafında parola özetleme — uygulamanızın gerçek uygulamasına uygun şekilde) hedeflenir. İnternet üzerinden veri iletimi daima risk içerir; cihazınızı ve hesap bilgilerinizi korumanız önemlidir.

---

## 8. KVKK kapsamındaki haklarınız

KVKK’nın **11. maddesi** uyarınca veri sorumlusuna başvurarak:

- Kişisel verilerinizin işlenip işlenmediğini öğrenme,  
- İşlenmişse buna ilişkin bilgi talep etme,  
- İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,  
- Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,  
- Eksik veya yanlış işlenmişse düzeltilmesini isteme,  
- KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,  
- Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,  
- Münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,  
- Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme  

haklarına sahipsiniz.

Başvurularınızı `[DOLDURUN]` e-posta adresine iletebilirsiniz. Başvuru formu ve süreler için Veri Sorumlusuna Başvuru Usul ve Esasları’na uygun hareket edilir.

---

## 9. Çocukların gizliliği

OmniMind, bilerek 13 yaş altı (veya bulunduğunuz ülkede geçerli olan eşik yaş) çocuklardan kişisel veri toplamayı hedeflemez. Ebeveyn veya vasiler, böyle bir veri toplandığına inanıyorsa `[DOLDURUN]` adresinden iletişime geçebilir.

---

## 10. Politika değişiklikleri

Bu politika güncellenebilir. Önemli değişikliklerde Uygulama içi bildirim veya e-posta ile bilgilendirme yapılabilir. Play Store’daki bağlantının güncel sürüme işaret etmesi veri sorumlusunun sorumluluğundadır.

---

## 11. Google Play ve veri güvenliği formu

Play Console’da “Uygulama içeriği” ve “Veri güvenliği” bölümlerini doldururken:

- **Toplanan veri türleri:** Hesap kimliği (e-posta, kullanıcı adı), kullanıcı tarafından sağlanan içerik (günlük metni, başlık, ruh hali), kimlik doğrulama bilgisi (oturum), isteğe bağlı AI çıktıları.  
- **Veri paylaşımı:** İsteğe bağlı AI için üçüncü taraf model sağlayıcı; müzik için Apple iTunes API; kullanıcıyı harici tarayıcıya gönderme (Spotify/YouTube).  
- **Şifreleme:** İletimde HTTPS kullanımı (sunucu yapılandırmanıza bağlı) ve cihazda yerel depolama uygulama güvenlik modeline tabidir.

Bu liste özet niteliğindedir; Play formundaki her soruyu kendi altyapınıza göre doğrulayın.

---

## 12. İletişim

Sorularınız için: `[DOLDURUN]` (e-posta).

---

*Bu metin bilgilendirme amaçlıdır ve hukuki tavsiye yerine geçmez. Yayınlamadan önce bir hukuk danışmanı ile gözden geçirmeniz önerilir.*
