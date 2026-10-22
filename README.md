# FOCUSLAB 🌌

> **Minimalist Liquid Glass, Kişisel Çalışma Alanı, YKS Takibi, Sanal Kütüphane & 3D Ağaç Ekosistemi**  
> Derin Oval Geometri, Bağımsız Ayarlar Alanı, Yerinde Yakınlaşan Takvim, Sıfır Dummy Veri (Temiz Durum), 120+ Ürünlü Marketplace & Tek Parça Ambiyans Ses Motoru.

---

## 🌟 Tasarım Felsefesi ve Temel Standartlar

1. **Focuslab Kimliği & İnce Beyaz Halka (Halo)**:
   - Siyah/transparan minimal kutu içinde parlayan zarif beyaz halka.
   - Yapay zeka dashboard klişelerinden, gereksiz rozetlerden, neon çizgilerden ve kafa karıştırıcı ikon kalabalığından tamamen arındırılmıştır.
   - **Navigasyon ve Ayarlar Ayrımı**: Ana navigasyonda yalnızca temel sekmeler (`Ana Sayfa`, `Görevler`, `Etkinlikler`, `To-do`, `Takvim`, `Denemeler`, `Sanal Kütüphane`, `Odaklanma`) yer alır. Ayarlar ise sağ üstte bağımsız ve zarif bir kontrol alanı olarak konumlandırılmıştır.

2. **Gerçek Liquid Glass & Derin Oval Geometri**:
   - `border-radius: 12px` gibi keskin kareler kesinlikle kullanılmamıştır.
   - Paneller `--panel-radius: 38px`, kartlar `--card-radius: 26px`, gezinme çubuğu ve butonlar tam oval capsule (`9999px`) biçimindedir.
   - Optik kırılma (refraction), içsel yansıma ışığı (specular sheen) ve yüksek doygunluklu blur ile modern işletim sistemleri düzeyinde akıcı cam hissiyatı.

3. **Üst Gezinme Çubuğu & Arka Plan Bütünlüğü**:
   - Üst çubukta ekranı boydan boya bölen gri/siyah yatay şerit veya filigran kesinlikle yoktur (`background: transparent !important; border: none !important;`).
   - Sayfa aşağı kaydırıldığında içerik navigasyonun arkasından süzülür ve cam yüzeyin içerisinden optik olarak görünür.

4. **Kusursuz Gündüz (Açık) ve Gece (Koyu) Temaları**:
   - **Gece Modu**: Obsidyen kömür siyahı (`#08090c`), hafif soft koyu gri/lacivert atmosferik dağılım; neon veya göz alıcı LED ışıklardan kaçınılmıştır.
   - **Gündüz Modu**: Seramik soft açık gri/kırık beyaz (`#f4f6fa`), yüksek kontrastlı koyu metin (`#0f172a`), sınırları belli cam paneller. Beyaz üstüne beyaz yazı sorunu tamamen çözülmüştür.
   - Ayarlar menüsünden 9 farklı atmosferik arka plan gradienti (Neutral, Deep Blue, Midnight, Cosmic Violet, Crimson Dusk, Forest Emerald, Ocean Breeze, Graphite Carbon, Soft Purple) seçilebilir.

5. **İlk Giriş Kontrolü (First-time User Flow) & Sıfır Dummy Veri**:
   - Uygulama ilk açıldığında `localStorage` taranır. Kayıtlı veri yoksa şık bir **"İlk Kurulum / Hoş Geldin"** penceresi açılır.
   - Kullanıcı adı, hedef alan (YKS Sayısal/EA/Sözel/Dil/Genel) ve ilk tema tercihi alınır.
   - Kod içine önceden gömülmüş hiçbir yapay/sahte deneme veya görev verisi bulunmaz; kullanıcı tertemiz, sıfır istatistikli bir çalışma alanına başlar.

6. **Kalıcı Yerel Depolama (Data Persistence) & Veri Sıfırlama**:
   - Kullanıcının girdiği tüm görevler, serbest boyutlar, etkinlikler, yapılacaklar, YKS netleri, ağaç gelişimi ve puanlar anlık olarak `localStorage` (`focuslab_v1_data`) alanına kaydedilir. Sayfa yenilendiğinde hiçbir veri kaybolmaz.
   - Ayarlar sayfasının en altında yer alan **"Tüm Verileri Temizle ve Sıfırla"** butonuyla istendiğinde onay alınarak cihazdaki tüm veriler silinip ilk kurulum ekranına dönülebilir.
   - Tarayıcıdan hiçbir gereksiz izin (konum, bildirim vb.) talep edilmez.

7. **Ayrık, Serbest Boyutlandırılabilir Görev Blokları (Grid'siz, Akıcı Resize)**:
   - Görev kutuları birbirine yapışık değildir (`gap: 1.5rem` ferah nefes alanı).
   - Sol tarafta kaba renk şeritleri bulunmaz; seçilen renk tüm kartın cam atmosferine hafif ve zarif bir parlaklık kazandırır.
   - Kart üzerinde başlangıçta yalnızca başlık, durum, süre ve üç nokta (`...`) yer alır. Detaylar kartın altında açılıp resize alanını tıkamaz.
   - Sağ alttaki tutamaçtan `requestAnimationFrame` ve pointer events desteğiyle yağ gibi akıcı ve serbestçe (grid snapping olmadan) istenen boyuta çekilebilir.
   - Üç noktaya (`...`) tıklandığında Liquid Glass **Görev Detay Paneli** açılarak alt görevler (to-do checklist), açıklamalar ve süreler yönetilir.

8. **Takvim (Yerinde Yakınlaşan Gün Kutucuğu — Modal / Sayfa Değişimi Yok)**:
   - Aylık 7 sütunlu klasik takvim matrisi ekranda kalmaya devam eder.
   - Bir güne tıklandığında sayfa değişmez veya pop-up modal fırlamaz; seçilen gün **aynı panel içerisinde etrafındaki kutucuklardan daha büyük bir şekilde yaklaşır** (`col-span-3 row-span-2`).
   - Yakınlaşan günün üstündeki butonlarla:
     - **1. Önizleme:** O güne ait ana sayfadakiyle birebir aynı görsel dilde mini görev kartları tablosu (dokunulduğunda işlem yapmayan görsel önizleme).
     - **2. Saatli Plan:** `08:00` ile `22:00` arasındaki saatlerin dikey olarak dizildiği ve görevlerin saatlere göre sıralandığı liste (fare tekerleğiyle kaydırılabilir).
   - Sağ üstteki `[ ✕ ]` butonuyla anında normal gün kutucuğuna geri dönülür.

9. **Sanal Kütüphane (Immersive Fullscreen Study Room)**:
   - *"Kütüphaneye Geç & Etüde Başla"* butonuyla dikkat dağıtıcı tüm dış menüler gizlenir.
   - Çıkışta *"Kütüphaneden çıkılsın ve çalışma süresi durdurulsun mu?"* onay penceresi sorulur.
   - Doğa manzaraları arasından seçim yapılabilir veya **"Dışarıdan Yükle"** butonuyla bilgisayardan özel görsel (JPG/PNG/WEBP) eklenebilir.
   - Saat, **derin oval motion blur'lu Liquid Glass panelin** içerisinde yer alır; varsayılan olarak `HH:MM` gösterir, altında kullanıcı adı ve çalışma durumu yer alır.
   - **Kütüphane İçi Yüzen Müzik Çekmecesi**: Müzik butonuna basıldığında kütüphane kapanmaz veya başka sekmeye geçmez; kütüphane içinde yüzen bağımsız bir panel açılır. Dış müzik içeri girildiğinde otomatik durur.
   - **Kütüphane Ayarları**: Saniyeyi açıp kapatma (`HH:MM:SS`), dijital/analog saat tipi ve kullanıcı adı yönetimi.

10. **Spotify Stili Tek Parça Ambiyans Ses Sistemi**:
    - Ambiyans sesleri kesinlikle aynı anda üst üste binip gürültü yapmaz. Yeni ses seçildiğinde önceki ses anında durur ve temizlenir.
    - 10 farklı sentetik ortam sesi: Lo-Fi Piyano, Gece Yağmuru, Okyanus Dalgaları, Dağ Rüzgarı, Orman & Nehir, Şömine, Kafe, Gök Gürültüsü, Dingin Gece, 432Hz Kozmik Odak Dalgası.
    - Süre zamanlayıcı (15, 25, 45, 60 dk veya süresiz), ses seviyesi ve ekranın sağ altında sabit duran evrensel mini oynatıcı.

11. **YKS Deneme Takibi (TYT & AYT Net Analizi)**:
    - TYT (120 Soru) ve AYT (80 Soru) sekmeleri.
    - Doğru ve Yanlış sayılarına göre otomatik ÖSYM net hesabı (`Net = Doğru - Yanlış / 4`).
    - Geçmiş denemeler listesi ve görsel net yükseliş sütun grafiği.
    - YKS hedef sıralama, hedef puan ve hedef üniversite/bölüm kartı.

12. **3D Odak Ağacı Simülasyonu, 120+ Marketplace & Satın Alma Vitrini**:
    - Yalnızca kullanıcının gerçekte tamamladığı odaklanma dakikalarına göre dallanıp yeşillenen 3D fraktal canvas ağacı ve gün gün gerçek geçmiş (Bugün, Dün, 2 Gün Önce).
    - Odaklandıkça kazanılan Focus Coin ekonomisi.
    - Temiz beyaz kartlar üzerinde 7 kategoride (Masa, Teknoloji, Dekorasyon, Bitkiler, Kitaplar, Aksesuarlar, Çalışma Ekipmanları) 120'den fazla ürün.
    - Sepet sistemi ve satın alım sonrası **"Satın Alındı! 🎉"** vitrin kartı (sonraki ürüne dokunarak geçiş imkanı).
    - 4 parçayı toplayarak Efsanevi Mekanik Klavye Seti birleştirme (Crafting).

13. **Sol Altta Sabit Yapay Zeka Danışmanı**:
    - Ayrı bir sayfa yerine sol altta her zaman duran minimal bot butonu.
    - Tıklandığında cam çekmece açılır; sınav stratejisi, ders planı ve odaklanma tavsiyeleri sunar.

---

## 🚀 Başlatma

Uygulama sıfır harici bağımlılıkla (Node.js/npm veya sunucu gerektirmeden) tamamen tarayıcıda çalışır.

1. Klasördeki [**`index.html`**](file:///C:/Users/samet/.gemini/antigravity/scratch/lumina-flow/index.html) dosyasını herhangi bir web tarayıcısında açın.
2. Veya Windows için hazırlanmış [**`start-app.bat`**](file:///C:/Users/samet/.gemini/antigravity/scratch/lumina-flow/start-app.bat) dosyasına çift tıklayın.
