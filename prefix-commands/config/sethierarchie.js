const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'sethierarchie',
  category: 'config',
  description: "Envoie l'embed de la hiérarchie du serveur.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour utiliser cette commande.");
    }

    const config = client.db.getGuildConfig(message.guild.id);

    // Supprimer le message de commande
    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('👑 ORGANISATION & HIÉRARCHIE')
      .setDescription(
        'Voici la structure officielle des rôles et des rangs du serveur.\n' +
        'Chaque grade reflète l\'implication et le statut des membres au sein de la communauté.\n\n' +
        '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
      )
      .setColor(config.theme || '#5865F2')
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: '👑 ── DIRECTION SUPRÊME',
          value: 
            `> **Yami 漢** ━ \`Directeur & Fondateur\`\n` +
            `> ┗ *Créateur du projet et décisionnaire absolu.*\n\n` +
            `> **Bras-droit** ━ \`Co-Directeur\`\n` +
            `> ┗ *Administrateur général, gère le serveur au quotidien.*`,
          inline: false
        },
        {
          name: '🛡️ ── HAUT COMMANDEMENT',
          value: 
            `> **Empereur** ━ \`Administrateur\`\n` +
            `> ┗ *Gère l'équipe de modération et le bon fonctionnement global.*\n\n` +
            `> **Souverain** ━ \`Modérateur Général\`\n` +
            `> ┗ *Supervise le chat et applique les directives administratives.*`,
          inline: false
        },
        {
          name: '⚔️ ── CORPS DE MODÉRATION',
          value: 
            `> **Apôtre** ━ \`Modérateur\`\n` +
            `> ┗ *Chargé du respect des règles et de la sécurité du chat.*\n\n` +
            `> **Emissaire** ━ \`Helper / Modérateur en test\`\n` +
            `> ┗ *Aide les membres et fait ses preuves au sein du staff.*`,
          inline: false
        },
        {
          name: '⭐ ── RANGS D\'ÉLITE (ACTIVITÉ)',
          value: 
            `> **Rang X** ━ \`Légende Communautaire\`\n` +
            `> ┗ *Le sommet de l'activité. Prestige et avantages exclusifs.*\n\n` +
            `> **Rang S** ━ \`Membre d'Élite\`\n` +
            `> ┗ *Niveau d'activité exceptionnel et présence quotidienne.*\n\n` +
            `> **Rang A** ━ \`Membre Très Actif\`\n` +
            `> ┗ *Participe activement aux discussions du serveur.*`,
          inline: false
        },
        {
          name: '📊 ── RANGS DE PROGRESSION',
          value: 
            `> **Rang B** ━ \`Membre Habitué\`\n` +
            `> ┗ *Bien intégré dans la communauté.*\n\n` +
            `> **Rang C** ━ \`Membre Actif\`\n` +
            `> ┗ *Commence à se faire une place parmi nous.*`,
          inline: false
        },
        {
          name: '👥 ── NOUVEAUX ARRIVANTS',
          value: 
            `> **Novice** ━ \`Nouveau venu\`\n` +
            `> ┗ *Nouveau membre en cours d'intégration.*\n\n` +
            `> **Visiteur** ━ \`Rôle d'attente\`\n` +
            `> ┗ *Rôle de base attribué à l'arrivée sur le serveur.*`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: 'S-V Protect • Organisation et Ordre', iconURL: message.guild.iconURL() });

    await message.channel.send({ embeds: [embed] });
  }
};
