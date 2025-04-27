const Discord = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

const client = new Discord.Client();
const config = {
    token: 'self_token',
    sourceGuildId: 'çalınacak_sunucu_id',
    targetGuildId: 'hedef_sunucu_id'
};

class ServerBackup {
    constructor() {
        this.backupData = {
            roles: [],
            channels: [],
            // emojis: [],
            settings: {}
        };
    }

    async captureGuildData(guild) {
        console.log(`"${guild.name}" sunucusu için kapsamlı veri toplama başlatıldı...`);

        this.backupData.guildId = guild.id;

        const everyoneRole = guild.roles.everyone;
        this.backupData.everyoneRole = {
            permissions: everyoneRole.permissions.bitfield,
            color: everyoneRole.color,
            hoist: everyoneRole.hoist,
            mentionable: everyoneRole.mentionable
        };

        guild.roles.cache.forEach(role => {
            if (role.name !== '@everyone') {
                this.backupData.roles.push({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor,
                    hoist: role.hoist,
                    permissions: role.permissions.bitfield,
                    mentionable: role.mentionable,
                    position: role.position
                });
            }
        });

        guild.channels.cache.forEach(channel => {
            const channelData = {
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentId: channel.parent ? channel.parent.id : null,
                permissionOverwrites: []
            };

            channel.permissionOverwrites.cache.forEach(overwrite => {

                const isEveryoneRole = overwrite.id === guild.id;

                channelData.permissionOverwrites.push({
                    id: overwrite.id,
                    type: overwrite.type,
                    allow: overwrite.allow.bitfield,
                    deny: overwrite.deny.bitfield,
                    isEveryoneRole: isEveryoneRole
                });
            });

            if (channel.type === 'GUILD_TEXT') {
                channelData.topic = channel.topic;
                channelData.nsfw = channel.nsfw;
                channelData.rateLimitPerUser = channel.rateLimitPerUser;
            } else if (channel.type === 'GUILD_VOICE') {
                channelData.bitrate = channel.bitrate;
                channelData.userLimit = channel.userLimit;
            }

            this.backupData.channels.push(channelData);
        });

        // guild.emojis.cache.forEach(emoji => {
        //     this.backupData.emojis.push({
        //         name: emoji.name,
        //         url: emoji.url
        //     });
        // });

        this.backupData.settings = {
            name: guild.name,
            icon: guild.iconURL({ format: 'png', dynamic: true, size: 1024 }),
            verificationLevel: guild.verificationLevel,
            explicitContentFilter: guild.explicitContentFilter,
            defaultMessageNotifications: guild.defaultMessageNotifications
        };

        console.log('Veri toplama süreci tamamlandı.');
        return this.backupData;
    }

    async restoreToGuild(guild) {
        console.log(`"${guild.name}" sunucusuna sistematik geri yükleme başlatıldı...`);

        await guild.setName(this.backupData.settings.name);
        if (this.backupData.settings.icon) {
            await guild.setIcon(this.backupData.settings.icon);
        }

        try {
            const everyoneRole = guild.roles.everyone;
            await everyoneRole.setPermissions(BigInt(this.backupData.everyoneRole.permissions));
            console.log('@everyone rolü güncellendi.');
        } catch (error) {
            console.error('Hata: @everyone rolü güncellenemedi:', error);
        }

        const roleMap = new Map();
        const sortedRoles = [...this.backupData.roles].sort((a, b) => a.position - b.position);

        for (const roleData of sortedRoles) {
            try {
                const createdRole = await guild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    hoist: roleData.hoist,
                    permissions: roleData.permissions,
                    mentionable: roleData.mentionable,
                    position: roleData.position
                });
                roleMap.set(roleData.id, createdRole.id);
                console.log(`Rol oluşturuldu: ${roleData.name}`);

                await new Promise(resolve => setTimeout(resolve, 1000)); 
            } catch (error) {
                console.error(`Rol oluşturma hatası (${roleData.name}):`, error);
            }
        }

        await Promise.all(guild.channels.cache.map(channel => channel.delete()));

        const categoryChannels = this.backupData.channels.filter(c => c.type === 'GUILD_CATEGORY');
        const categoryMap = new Map();

        for (const categoryData of categoryChannels) {
            try {
                const permissionOverwrites = this.preparePermissionOverwrites(categoryData.permissionOverwrites, roleMap);

                const createdCategory = await guild.channels.create(categoryData.name, {
                    type: 'GUILD_CATEGORY',
                    position: categoryData.position,
                    permissionOverwrites: permissionOverwrites
                });

                categoryMap.set(categoryData.id, createdCategory.id);
                console.log(`Kategori oluşturuldu: ${categoryData.name}`);
            } catch (error) {
                console.error(`Kategori oluşturma hatası (${categoryData.name}):`, error);
            }
        }

        const standardChannels = this.backupData.channels.filter(c => c.type !== 'GUILD_CATEGORY');

        for (const channelData of standardChannels) {
            try {
                const permissionOverwrites = this.preparePermissionOverwrites(channelData.permissionOverwrites, roleMap);

                const channelOptions = {
                    type: channelData.type,
                    topic: channelData.topic,
                    nsfw: channelData.nsfw,
                    bitrate: channelData.bitrate,
                    userLimit: channelData.userLimit,
                    rateLimitPerUser: channelData.rateLimitPerUser,
                    position: channelData.position,
                    permissionOverwrites: permissionOverwrites
                };

                if (channelData.parentId && categoryMap.has(channelData.parentId)) {
                    channelOptions.parent = categoryMap.get(channelData.parentId);
                }

                await guild.channels.create(channelData.name, channelOptions);
                console.log(`Kanal oluşturuldu: ${channelData.name}`);
            } catch (error) {
                console.error(`Kanal oluşturma hatası (${channelData.name}):`, error);
            }
        }

        // for (const emojiData of this.backupData.emojis) {
        //     try {
        //         await guild.emojis.create(emojiData.url, emojiData.name);
        //         console.log(`Emoji oluşturuldu: ${emojiData.name}`);
        //     } catch (error) {
        //         console.error(`Emoji oluşturma hatası (${emojiData.name}):`, error);
        //     }
        // }

        console.log('Geri yükleme başarıyla tamamlandı.');
    }

    preparePermissionOverwrites(originalOverwrites, roleMap) {
        const targetGuild = client.guilds.cache.get(config.targetGuildId);

        if (!originalOverwrites) return [];

        return originalOverwrites.map(overwrite => {

            if (overwrite.isEveryoneRole || overwrite.id === this.backupData.guildId) {
                return {
                    id: targetGuild.id,
                    type: 'role',
                    allow: typeof overwrite.allow === 'string' ? BigInt(overwrite.allow) : overwrite.allow,
                    deny: typeof overwrite.deny === 'string' ? BigInt(overwrite.deny) : overwrite.deny
                };
            }
            
            const id = overwrite.type === 'role' && roleMap.has(overwrite.id)
                ? roleMap.get(overwrite.id)
                : overwrite.id;

            return {
                id: id,
                type: overwrite.type,
                allow: overwrite.allow,
                deny: overwrite.deny
            };
        });
    }

    saveToFile(filePath) {
        const backupJSON = JSON.stringify(this.backupData, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }, 2);

        const backupPath = path.join(__dirname, 'backups', 'backup.json');
        fs.writeFileSync(backupPath, backupJSON, 'utf8');
        console.log(`Yedek "${backupPath}" konumuna kaydedildi.`);
    }

    loadFromFile(filePath) {
        const backupJSON = fs.readFileSync(filePath, 'utf8');


        this.backupData = JSON.parse(backupJSON, (key, value) => {

            if((key === 'allow' || key === 'deny' || key === 'permissions') && 
            typeof value === 'string' &&
            /^\d+$/.test(value)) {
                return BigInt(value);
            }
            return value;
        });

        console.log(`"${filePath}" konumundan yedek yüklendi.`);
    }
}

async function createBackup() {
    const sourceGuild = client.guilds.cache.get(config.sourceGuildId);
    if (!sourceGuild) {
        console.error('Kaynak sunucu bulunamadı!');
        return;
    }

    const backup = new ServerBackup();
    await backup.captureGuildData(sourceGuild);

    const backupFileName = `backup_${sourceGuild.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    backup.saveToFile(path.join(__dirname, 'backups', backupFileName));
}

async function restoreBackup(backupFilePath) {
    const targetGuild = client.guilds.cache.get(config.targetGuildId);
    if (!targetGuild) {
        console.error('Hedef sunucu bulunamadı!');
        return;
    }

    const backup = new ServerBackup();
    backup.loadFromFile(backupFilePath);
    await backup.restoreToGuild(targetGuild);
}

client.on('ready', async () => {
    console.log(`${client.user.tag} olarak oturum açıldı.`);

    if (!fs.existsSync(path.join(__dirname, 'backups'))) {
        fs.mkdirSync(path.join(__dirname, 'backups'));
        console.log('Backups klasörü oluşturuldu.');
    }

    try {
    await createBackup();
    console.log('Yedekleme işlemi tamamlandı. Backup dosyası oluşturuldu. \nŞimdi yedeği geri yükleyeceğim...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    await restoreBackup(path.join(__dirname, 'backups', 'backup.json'));

    const backupFiles = fs.readdirSync(path.join(__dirname, 'backups'));
    }
    catch (error) {
        console.error('Hata:', error);
    }
    console.log('Aliyi siktim öldü.');
});

client.login(config.token);