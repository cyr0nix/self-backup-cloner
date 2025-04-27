# Discord Self-Backup Cloner

Bu gelişmiş araç, Discord sunucularınızın mükemmel kopyalarını oluşturmak için tasarlanmış kusursuz bir çözümdür. Sunucunuzdaki rolleri, kanalları ve izin ayarlarını eksiksiz şekilde kopyalayarak, sunucu yapılandırmanızın tam bir replikasını oluşturmanızı sağlar.

## Özellikler

- **Kapsamlı Rol Kopyalama**: Tüm rol özellikleri, izinleri ve hiyerarşisi kusursuz şekilde korunur
- **Detaylı Kanal Yapılandırması**: Metin, ses kanalları ve kategoriler tüm özellikleriyle birlikte kopyalanır
- **İzin Sistemi Desteği**: Karmaşık izin yapıları eksiksiz olarak aktarılır
- **Everyone Rolü Uyumluluğu**: Temel sunucu izinleri doğru şekilde yapılandırılır
- **Otomatik Yedekleme**: Yapılandırma anında JSON dosyasına kaydedilir
- **Hatasız Geri Yükleme**: Yedekler hedef sunucuya kusursuz şekilde entegre edilir

## Kullanım

### Gereksinimler

```bash
npm install discord.js-selfbot-v13 fs path
```

### Kurulum

1. Depoyu klonlayın:
```bash
git clone https://github.com/cyr0nix/self-backup-cloner.git
cd self-backup-cloner
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. `index.js` dosyasındaki yapılandırma ayarlarını düzenleyin:
```javascript
const config = {
    token: 'self_token',                // Discord self token'ınız
    sourceGuildId: 'çalınacak_sunucu_id', // Kaynak sunucu ID'si
    targetGuildId: 'hedef_sunucu_id'     // Hedef sunucu ID'si
};
```

### Çalıştırma

```bash
node index.js
```

## Teknik Detaylar

### Mimari Yapı

- **ServerBackup Sınıfı**: Tüm yedekleme ve geri yükleme işlemlerini yönetir
- **Modüler Tasarım**: Her bir sunucu öğesi için optimize edilmiş veri yapısı
- **Asenkron İşlem Yönetimi**: Rate limit ve API kısıtlamalarını dikkate alan mimari
- **Kademeli Geri Yükleme**: Sunucu elemanlarının doğru sırayla oluşturulmasını sağlar

### Veri Modeli

```
backupData
├── roles[]           // Rol yapılandırması
├── channels[]        // Kanal yapılandırması
├── everyoneRole{}    // @everyone rol ayarları
└── settings{}        // Genel sunucu ayarları
```

## Güvenlik Bildirimi

Bu araç eğitim ve kişisel kullanım amaçlıdır. Başkalarının sunucularını izinsiz kopyalamak Discord Kullanım Şartları'na aykırıdır. Kullanım sorumluluğu tamamen size aittir.

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni özellik branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull request oluşturun

---

## English Documentation

# Discord Self-Backup Cloner

This advanced tool is a flawless solution designed to create perfect replicas of your Discord servers. By precisely copying roles, channels, and permission settings from your server, it enables you to create an exact replication of your server configuration.

## Features

- **Comprehensive Role Cloning**: All role properties, permissions, and hierarchy are preserved perfectly
- **Detailed Channel Configuration**: Text, voice channels, and categories are copied with all their properties
- **Permission System Support**: Complex permission structures are transferred completely
- **Everyone Role Compatibility**: Basic server permissions are configured correctly
- **Automatic Backup**: Configuration is saved to a JSON file instantly
- **Error-free Restoration**: Backups are perfectly integrated into the target server

## Usage

### Requirements

```bash
npm install discord.js-selfbot-v13 fs path
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cyr0nix/self-backup-cloner.git
cd self-backup-cloner
```

2. Install the required packages:
```bash
npm install
```

3. Edit the configuration settings in the `index.js` file:
```javascript
const config = {
    token: 'self_token',           // Your Discord self token
    sourceGuildId: 'source_guild_id', // Source server ID
    targetGuildId: 'target_guild_id'  // Target server ID
};
```

### Execution

```bash
node index.js
```

## Technical Details

### Architectural Structure

- **ServerBackup Class**: Manages all backup and restoration operations
- **Modular Design**: Optimized data structure for each server element
- **Asynchronous Process Management**: Architecture that takes rate limits and API restrictions into account
- **Gradual Restoration**: Ensures server elements are created in the correct order

### Data Model

```
backupData
├── roles[]           // Role configuration
├── channels[]        // Channel configuration
├── everyoneRole{}    // @everyone role settings
└── settings{}        // General server settings
```

## Security Notice

This tool is for educational and personal use. Copying others' servers without permission violates Discord's Terms of Service. Usage responsibility lies entirely with you.

## Contributing

1. Fork this repo
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Added amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Create a pull request
