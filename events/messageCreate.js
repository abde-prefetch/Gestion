const { PermissionFlagsBits } = require('discord.js');

// Simple structures en mémoire pour la détection
const spamMap = new Map();
const SPAM_LIMIT = 5; // Nombre de messages max
const SPAM_TIME = 5000; // Fenêtre de temps en ms (5 secondes)
const TIMEOUT_DURATION = 60 * 1000; // 1 minute de timeout pour spam

const MASS_PING_LIMIT = 5; // Nombre max de mentions dans un message

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Ignorer les administrateurs
    if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    // --- ANTI-LINK ---
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(message.content)) {
      try {
        await message.delete();
        await message.channel.send(`⚠️ ${message.author}, les liens ne sont pas autorisés sur ce serveur.`);
        return; // On arrête là pour ce message
      } catch (err) {
        console.error("Impossible de supprimer le lien :", err);
      }
    }

    // --- ANTI-MASS PING ---
    if (message.mentions.users.size > MASS_PING_LIMIT) {
      try {
        await message.delete();
        await message.member.timeout(TIMEOUT_DURATION, 'Anti-Mass Ping: Trop de mentions dans un seul message');
        await message.channel.send(`🚨 ${message.author} a été rendu muet pour avoir mentionné trop de personnes (Mass Ping).`);
        return;
      } catch (err) {
        console.error("Impossible de sanctionner le mass ping :", err);
      }
    }

    // --- ANTI-SPAM ---
    const userId = message.author.id;
    if (spamMap.has(userId)) {
      const userData = spamMap.get(userId);
      userData.msgCount += 1;

      if (userData.msgCount >= SPAM_LIMIT) {
        // Détection de spam
        try {
          await message.delete(); // Supprime le dernier message
          await message.member.timeout(TIMEOUT_DURATION, 'Anti-Spam: Trop de messages rapides');
          await message.channel.send(`🚨 ${message.author} a été rendu muet pour spam.`);
          
          // Réinitialiser pour éviter de le re-sanctionner en boucle s'il continue de spam
          clearTimeout(userData.timer);
          spamMap.delete(userId);
          return;
        } catch (err) {
          console.error("Impossible d'appliquer le timeout pour spam :", err);
        }
      } else {
        spamMap.set(userId, userData);
      }
    } else {
      const timer = setTimeout(() => {
        spamMap.delete(userId);
      }, SPAM_TIME);

      spamMap.set(userId, { msgCount: 1, timer });
    }
  },
};
