require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.prefixCommands = new Collection();
client.db = require('./db.js');

// Chargement récursif des commandes Préfixées
const prefixCommandsPath = path.join(__dirname, 'prefix-commands');
if (!fs.existsSync(prefixCommandsPath)) {
  fs.mkdirSync(prefixCommandsPath);
}

function loadPrefixCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      loadPrefixCommands(filePath);
    } else if (file.endsWith('.js')) {
      const required = require(filePath);
      const commands = Array.isArray(required) ? required : [required];
      for (const command of commands) {
        if (command.name && command.execute) {
          client.prefixCommands.set(command.name, command);
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              client.prefixCommands.set(alias, command);
            }
          }
        }
      }
    }
  }
}
loadPrefixCommands(prefixCommandsPath);

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js');

// Catégories de tickets
const TICKET_CATEGORIES = {
  ticket_recrutement: { label: 'Recrutement', emoji: '📋' },
  ticket_question:    { label: 'Question',    emoji: '❓' },
  ticket_gangwars:   { label: 'Gang Wars',   emoji: '⚔️' },
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu() && !interaction.isModalSubmit()) return;

  const guildId = interaction.guild.id;
  const config = client.db.getGuildConfig(guildId);

  // --- SÉLECTION DE CATÉGORIE (Select Menu) ---
  if (interaction.customId === 'ticket_category_select') {
    const selected = interaction.values[0]; // ex: 'ticket_recrutement'
    
    if (selected === 'ticket_cancel') {
      return interaction.reply({ content: '❌ Sélection annulée.', ephemeral: true });
    }

    const category = TICKET_CATEGORIES[selected];
    if (!category) return;

    await interaction.deferReply({ ephemeral: true });

    const existingChannel = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
    );
    if (existingChannel) {
      return interaction.editReply({ content: `❌ Vous avez déjà un ticket ouvert ici : ${existingChannel}` });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Ticket de ${interaction.user.id} | Catégorie: ${category.label}`,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      // Donner acces au role ticket s'il est configure
      if (config.ticketRole) {
        await channel.permissionOverwrites.edit(config.ticketRole, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        }).catch(() => {});
      }

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`${category.emoji} Ticket — ${category.label}`)
        .setDescription(`Bonjour ${interaction.user}, votre ticket **${category.label}** a bien été créé.\nL'équipe du serveur vous répondra dès que possible.`)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fermer')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('add_member_ticket')
          .setLabel('Ajouter un membre')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ content: `${interaction.user} | @here`, embeds: [welcomeEmbed], components: [row] });
      return interaction.editReply({ content: `✅ Votre ticket **${category.label}** a été créé : ${channel}` });
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: "❌ Impossible de créer le ticket." });
    }
  }

  // --- CRÉATION DE TICKET (ancien bouton, gardé pour compatibilité) ---
  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });

    // Vérifier s'il y a déjà un ticket ouvert par ce membre
    const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
    if (existingChannel) {
      return interaction.editReply({ content: `❌ Vous avez déjà un ticket ouvert ici : ${existingChannel}` });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Ticket de ${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          },
        ],
      });

      // Donner acces au role ticket s'il est configure
      if (config.ticketRole) {
        await channel.permissionOverwrites.edit(config.ticketRole, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        }).catch(() => {});
      }

      const welcomeEmbed2 = new EmbedBuilder()
        .setTitle(`🏟️ Ticket ouvert`)
        .setDescription(`Bonjour ${interaction.user}, posez votre question ici. L'équipe du serveur vous répondra dès que possible.`)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fermer')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('add_member_ticket')
          .setLabel('Ajouter un membre')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ content: `${interaction.user} | @here`, embeds: [welcomeEmbed2], components: [row2] });
      return interaction.editReply({ content: `✅ Votre ticket a été créé : ${channel}` });
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: "❌ Impossible de créer le ticket." });
    }
  }

  // --- BOUTON AJOUTER UN MEMBRE : affiche un menu de sélection éphémère ---
  if (interaction.customId === 'add_member_ticket') {
    const selectRow = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId('select_member_to_add')
        .setPlaceholder('Sélectionner un membre à ajouter...')
        .setMinValues(1)
        .setMaxValues(1)
    );

    return interaction.reply({
      content: '👤 **Choisissez un membre à ajouter au ticket :**',
      components: [selectRow],
      ephemeral: true
    });
  }

  // --- SELECTION D'UN MEMBRE DANS LE MENU ---
  if (interaction.customId === 'select_member_to_add') {
    await interaction.deferReply({ ephemeral: true });
    const selectedUserId = interaction.values[0];

    const channel = interaction.channel;
    await channel.permissionOverwrites.edit(selectedUserId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    }).catch(() => {});

    const addedUser = await client.users.fetch(selectedUserId).catch(() => null);
    const tag = addedUser ? addedUser.tag : selectedUserId;

    await interaction.editReply({ content: `✅ **${tag}** a bien été ajouté au ticket.` });
    await channel.send(`👤 ${addedUser || selectedUserId} a été ajouté au ticket par ${interaction.user}.`);
    return;
  }

  // --- ÉTAPE 1 : CLIC SUR FERMER (CONFIRMATION ÉPHÉMÈRE) ---
  if (interaction.customId === 'close_ticket') {
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_close_ticket')
        .setLabel('Confirmer la fermeture')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_close_ticket')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content: '⚠️ **Êtes-vous sûr de vouloir fermer ce ticket ?**\nCette action est irréversible et supprimera le salon dans 5 secondes.',
      components: [confirmRow],
      ephemeral: true
    });
  }

  // --- ÉTAPE 2 : ANNULATION DE LA FERMETURE ---
  if (interaction.customId === 'cancel_close_ticket') {
    return interaction.update({
      content: '❌ **Fermeture du ticket annulée.**',
      components: []
    });
  }

  // --- ÉTAPE 3 : CONFIRMATION DE LA FERMETURE (TRANSCRIPT HTML + SUPPRESSION) ---
  if (interaction.customId === 'confirm_close_ticket') {
    await interaction.update({
      content: '✅ **Fermeture confirmée. Génération du transcript...**',
      components: []
    });

    const channel = interaction.channel;
    const topic = channel.topic || '';
    const creatorId = topic.match(/Ticket de (\d+)/)?.[1];

    await channel.send("🔒 **Fermeture du ticket en cours, suppression du salon dans 5 secondes...**");

    // Récupérer les messages
    let messages;
    try {
      messages = await channel.messages.fetch({ limit: 100 });
    } catch (err) {
      messages = [];
    }

    const sortedMessages = Array.from(messages.values()).reverse();

    // Générer le transcript HTML Premium
    let htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Transcript - ${channel.name}</title>
  <style>
    body {
      background-color: #313338;
      color: #dbdee1;
      font-family: 'gg sans', 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 30px;
    }
    .header {
      padding-bottom: 20px;
      border-bottom: 1px solid #3f4147;
      margin-bottom: 25px;
    }
    .header h1 {
      color: #f2f3f5;
      font-size: 26px;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
    }
    .header h1 span {
      background: #5865f2;
      color: #ffffff;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      margin-left: 12px;
      font-weight: 500;
    }
    .header p {
      font-size: 14px;
      color: #949ba4;
      margin: 4px 0;
    }
    .chat-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .message {
      display: flex;
      align-items: flex-start;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
      background-color: #4e5058;
      object-fit: cover;
    }
    .msg-body {
      display: flex;
      flex-direction: column;
    }
    .msg-header {
      display: flex;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .author {
      font-weight: 600;
      color: #f2f3f5;
      font-size: 16px;
      margin-right: 8px;
    }
    .bot-tag {
      background-color: #5865f2;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 3px;
      margin-right: 8px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .time {
      font-size: 12px;
      color: #949ba4;
    }
    .text {
      font-size: 15px;
      line-height: 1.375rem;
      white-space: pre-wrap;
      word-break: break-word;
      color: #dbdee1;
    }
    .embed {
      margin-top: 8px;
      background-color: #2b2d31;
      border-left: 4px solid #5865f2;
      border-radius: 4px;
      padding: 12px 16px;
      max-width: 520px;
    }
    .embed-title {
      font-weight: 600;
      font-size: 15px;
      color: #f2f3f5;
      margin-bottom: 4px;
    }
    .embed-description {
      font-size: 14px;
      color: #dbdee1;
      white-space: pre-wrap;
    }
    .embed-field {
      margin-top: 8px;
    }
    .embed-field-name {
      font-weight: 600;
      font-size: 13px;
      color: #f2f3f5;
      margin-bottom: 2px;
    }
    .embed-field-value {
      font-size: 13px;
      color: #dbdee1;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎟️ Transcript : ${channel.name} <span>TICKET</span></h1>
    <p><strong>Serveur :</strong> ${interaction.guild.name}</p>
    <p><strong>Créateur du ticket :</strong> <span style="color: #5865f2;">ID: ${creatorId || 'Inconnu'}</span></p>
    <p><strong>Date d'archivage :</strong> ${new Date().toLocaleString('fr-FR')}</p>
  </div>
  <div class="chat-container">`;

    for (const msg of sortedMessages) {
      const avatarUrl = msg.author.displayAvatarURL({ forceStatic: true, extension: 'png', size: 64 });
      const isBot = msg.author.bot;
      const botBadge = isBot ? `<span class="bot-tag">BOT</span>` : '';
      const formattedDate = msg.createdAt.toLocaleString('fr-FR');

      htmlContent += `
    <div class="message">
      <img class="avatar" src="${avatarUrl}" alt="Avatar">
      <div class="msg-body">
        <div class="msg-header">
          <span class="author">${msg.author.tag}</span>
          ${botBadge}
          <span class="time">${formattedDate}</span>
        </div>
        <div class="text">${msg.content || ''}</div>`;

      // Rendre les embeds du bot
      if (msg.embeds && msg.embeds.length > 0) {
        for (const emb of msg.embeds) {
          const colorHex = emb.hexColor || '#5865f2';
          htmlContent += `
        <div class="embed" style="border-left-color: ${colorHex};">`;
          if (emb.title) {
            htmlContent += `          <div class="embed-title">${emb.title}</div>`;
          }
          if (emb.description) {
            htmlContent += `          <div class="embed-description">${emb.description}</div>`;
          }
          if (emb.fields && emb.fields.length > 0) {
            for (const f of emb.fields) {
              htmlContent += `
          <div class="embed-field">
            <div class="embed-field-name">${f.name}</div>
            <div class="embed-field-value">${f.value}</div>
          </div>`;
            }
          }
          htmlContent += `        </div>`;
        }
      }

      htmlContent += `
      </div>
    </div>`;
    }

    htmlContent += `
  </div>
</body>
</html>`;

    const buffer = Buffer.from(htmlContent, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });

    // Envoyer en DM au créateur
    if (creatorId) {
      try {
        const creator = await client.users.fetch(creatorId);
        const dmEmbed = new EmbedBuilder()
          .setTitle("📁 Ticket Fermé")
          .setDescription(`Votre ticket sur le serveur **${interaction.guild.name}** a été fermé.\nVous trouverez ci-joint le transcript interactif en format HTML.`)
          .setColor(config.theme || '#5865F2')
          .setTimestamp();

        await creator.send({ embeds: [dmEmbed], files: [attachment] });
      } catch (err) {
        console.log(`Impossible d'envoyer le DM de transcript à l'utilisateur ${creatorId}`);
      }
    }

    // Envoyer dans le salon de logs de transcript s'il est configuré
    const targetChannelId = config.transcriptChannel || config.logsChannel;
    if (targetChannelId) {
      const logsChan = interaction.guild.channels.cache.get(targetChannelId);
      if (logsChan) {
        const logEmbed = new EmbedBuilder()
          .setTitle(`📁 Transcript HTML - Ticket ${channel.name}`)
          .setDescription(`Le ticket de <@${creatorId || interaction.user.id}> a été fermé par ${interaction.user}.`)
          .setColor('#FF0000')
          .setTimestamp();
        await logsChan.send({ embeds: [logEmbed], files: [attachment] }).catch(() => {});
      }
    }

    // Supprimer le salon après 5 secondes
    setTimeout(async () => {
      await channel.delete().catch(() => {});
    }, 5000);
  }
});

client.once('ready', () => {
  console.log(`✅ S-V Protect connecté en tant que ${client.user.tag}`);
  client.user.setActivity('@loyalmadog', { type: require('discord.js').ActivityType.Playing });
});

// Serveur HTTP minimal pour Render (UptimeRobot)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("S-V Protect is running!");
  res.end();
}).listen(process.env.PORT || 3000, () => {
  console.log(`📡 Serveur web démarré sur le port ${process.env.PORT || 3000}`);
});

// Écouteur d'erreur Discord
client.on('error', e => console.error(`[Discord Error]`, e));

client.login(process.env.TOKEN);
