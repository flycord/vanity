document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const inviteCodeInput = document.getElementById('inviteCode');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    
    searchBtn.addEventListener('click', fetchInviteData);
    inviteCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchInviteData();
        }
    });
    
    async function fetchInviteData() {
        const inviteCode = inviteCodeInput.value.trim();
        if (!inviteCode) {
            alert('Lütfen bir davet kodu girin!');
            return;
        }
        
        loading.style.display = 'block';
        resultContainer.classList.remove('show');
        
        try {
            const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true&with_expiration=true`);
            
            if (!response.ok) {
                throw new Error('Davet kodu geçersiz veya sunucu bulunamadı!');
            }
            
            const data = await response.json();
            displayInviteData(data, inviteCode);
        } catch (error) {
            loading.style.display = 'none';
            alert(error.message);
            console.error('Error:', error);
        }
    }
    
    function displayInviteData(data, inviteCode) {
        const guild = data.guild || {};
        const channel = data.channel || {};
        const approximate = data.approximate || {};
        
        document.getElementById('guildNameText').textContent = guild.name || 'Bilinmiyor';
        document.getElementById('guildDescription').textContent = guild.description || 'Açıklama yok';
        document.getElementById('memberCount').textContent = data.approximate_member_count || 'Bilinmiyor';
        document.getElementById('onlineCount').textContent = data.approximate_presence_count || 'Bilinmiyor';
        document.getElementById('boostCount').textContent = guild.premium_subscription_count || 0;
        
        if (guild.icon) {
            document.getElementById('guildIcon').src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`;
        } else {
            document.getElementById('guildIcon').src = 'https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png';
        }
        
        const verificationLevels = {
            0: 'Yok',
            1: 'Düşük',
            2: 'Orta',
            3: 'Yüksek',
            4: 'Çok Yüksek'
        };
        document.getElementById('verificationLevel').textContent = verificationLevels[guild.verification_level] || 'Bilinmiyor';
        
        const basicInfoList = document.getElementById('basicInfoList');
        basicInfoList.innerHTML = '';
        
        addInfoItem(basicInfoList, 'fa-hashtag', 'ID:', guild.id || 'Bilinmiyor');
        addInfoItem(basicInfoList, 'fa-tag', 'Etiket:', data.profile?.tag || 'Yok');
        addInfoItem(basicInfoList, 'fa-link', 'Vanity URL:', guild.vanity_url_code || 'Yok');
        addInfoItem(basicInfoList, 'fa-crown', 'Premium Tier:', guild.premium_tier || '0');
        
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';
        
        if (guild.features && guild.features.length > 0) {
            guild.features.forEach(feature => {
                let icon = 'fa-check-circle';
                let tooltip = feature;
                
                switch(feature) {
                    case 'COMMUNITY': icon = 'fa-users'; tooltip = 'Topluluk Sunucusu'; break;
                    case 'PARTNERED': icon = 'fa-handshake'; tooltip = 'Discord Partner'; break;
                    case 'VERIFIED': icon = 'fa-check-circle'; tooltip = 'Doğrulanmış Sunucu'; break;
                    case 'VANITY_URL': icon = 'fa-link'; tooltip = 'Özel URL'; break;
                    case 'NEWS': icon = 'fa-bullhorn'; tooltip = 'Duyuru Kanalları'; break;
                    case 'PREVIEW_ENABLED': icon = 'fa-eye'; tooltip = 'Önizleme Etkin'; break;
                }
                
                addInfoItem(featuresList, icon, tooltip, '');
            });
        } else {
            addInfoItem(featuresList, 'fa-info-circle', 'Özel özellik yok', '');
        }
        
        const traitsList = document.getElementById('traitsList');
        traitsList.innerHTML = '';
        
        if (data.profile?.traits && data.profile.traits.length > 0) {
            data.profile.traits.forEach(trait => {
                const li = document.createElement('li');
                li.className = 'trait-item';
                
                let emoji = trait.emoji_name ? `:${trait.emoji_name}:` : '';
                li.innerHTML = `
                    <span class="trait-emoji">${emoji}</span>
                    <span>${trait.label}</span>
                `;
                traitsList.appendChild(li);
            });
        } else {
            addInfoItem(traitsList, 'fa-info-circle', 'Etiket yok', '');
        }
        
        const inviteInfoList = document.getElementById('inviteInfoList');
        inviteInfoList.innerHTML = '';
        
        addInfoItem(inviteInfoList, 'fa-link', 'Davet Kodu:', inviteCode);
        
        if (data.expires_at) {
            const expiresAt = new Date(data.expires_at);
            addInfoItem(inviteInfoList, 'fa-clock', 'Süre:', expiresAt.toLocaleString());
        } else {
            addInfoItem(inviteInfoList, 'fa-clock', 'Süre:', 'Süresiz');
        }
        
        addInfoItem(inviteInfoList, 'fa-comment-alt', 'Kanal:', channel.name || 'Bilinmiyor');
        
        const channelTypeText = channel.type === 0 ? 'Metin Kanalı' : 
                              channel.type === 2 ? 'Ses Kanalı' : 
                              channel.type === 4 ? 'Kategori' : 'Bilinmeyen Kanal Türü';
        
        const channelTypeSpan = document.createElement('span');
        channelTypeSpan.className = 'channel-type';
        channelTypeSpan.textContent = `(${channelTypeText})`;
        inviteInfoList.lastChild.appendChild(channelTypeSpan);
        
        const guildBadge = document.getElementById('guildBadge');
        guildBadge.innerHTML = '';
        
        if (guild.features?.includes('VERIFIED')) {
            guildBadge.innerHTML = '<i class="fas fa-check"></i> Verified';
            guildBadge.style.display = 'inline-flex';
        } else if (guild.features?.includes('PARTNERED')) {
            guildBadge.innerHTML = '<i class="fas fa-handshake"></i> Partnered';
            guildBadge.style.display = 'inline-flex';
        } else {
            guildBadge.style.display = 'none';
        }
        
        if (guild.nsfw || guild.nsfw_level > 0) {
            const nsfwTag = document.createElement('span');
            nsfwTag.className = 'nsfw-tag';
            nsfwTag.innerHTML = '<i class="fas fa-exclamation-triangle"></i> NSFW';
            document.getElementById('guildName').appendChild(nsfwTag);
        }
        
        if (guild.premium_tier > 0) {
            const premiumTag = document.createElement('span');
            premiumTag.className = 'premium-tier';
            premiumTag.innerHTML = `<i class="fas fa-gem"></i> Seviye ${guild.premium_tier}`;
            document.getElementById('guildName').appendChild(premiumTag);
        }
        
        loading.style.display = 'none';
        resultContainer.classList.add('show');
    }
    
    function addInfoItem(list, icon, label, value) {
        const li = document.createElement('li');
        li.className = 'feature-item';
        li.innerHTML = `<i class="fas ${icon}"></i> <strong>${label}</strong> ${value}`;
        list.appendChild(li);
    }
});
