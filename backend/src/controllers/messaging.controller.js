const pool = require('../config/database');

// Envoyer un message
const sendMessage = async (req, res) => {
  try {
    const {
      appointment_id,
      sender_id,
      receiver_id,
      message_type = 'text',
      content,
      file_url,
      file_name
    } = req.body;

    // Vérifier que le rendez-vous existe et que l'utilisateur y participe
    if (appointment_id) {
      const [appointmentCheck] = await pool.query(`
        SELECT * FROM appointments 
        WHERE id = ? AND (client_id = ? OR counselor_id = ?)
      `, [appointment_id, sender_id, sender_id]);

      if (appointmentCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à ce rendez-vous'
        });
      }
    }

    // Insérer le message
    const [result] = await pool.query(`
      INSERT INTO messages (
        appointment_id, sender_id, receiver_id, 
        message_type, content, file_url, file_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [appointment_id, sender_id, receiver_id, message_type, content, file_url, file_name]);

    // Récupérer le message créé avec les informations utilisateur
    const [newMessage] = await pool.query(`
      SELECT 
        m.*,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.email as sender_email
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: newMessage[0]
    });

  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
};

// Obtenir les messages d'un rendez-vous
const getAppointmentMessages = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { user_id } = req.query;

    // Vérifier l'accès au rendez-vous
    const [appointmentCheck] = await pool.query(`
      SELECT * FROM appointments 
      WHERE id = ? AND (client_id = ? OR counselor_id = ?)
    `, [appointment_id, user_id, user_id]);

    if (appointmentCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce rendez-vous'
      });
    }

    // Récupérer les messages
    const [messages] = await pool.query(`
      SELECT 
        m.*,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.email as sender_email
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.appointment_id = ?
      ORDER BY m.created_at ASC
    `, [appointment_id]);

    // Marquer les messages comme lus
    await pool.query(`
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE appointment_id = ? AND receiver_id = ? AND is_read = false
    `, [appointment_id, user_id]);

    res.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Obtenir les conversations d'un utilisateur
const getUserConversations = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Récupérer les conversations (rendez-vous avec messages)
    const [conversations] = await pool.query(`
      SELECT DISTINCT
        a.id as appointment_id,
        a.appointment_type,
        a.status,
        a.scheduled_at,
        CASE 
          WHEN a.client_id = ? THEN counselor_user.first_name
          ELSE client_user.first_name
        END as other_user_first_name,
        CASE 
          WHEN a.client_id = ? THEN counselor_user.last_name
          ELSE client_user.last_name
        END as other_user_last_name,
        CASE 
          WHEN a.client_id = ? THEN counselor_user.email
          ELSE client_user.email
        END as other_user_email,
        CASE 
          WHEN a.client_id = ? THEN a.counselor_id
          ELSE a.client_id
        END as other_user_id,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE appointment_id = a.id AND receiver_id = ? AND is_read = false
        ) as unread_count,
        (
          SELECT content 
          FROM messages 
          WHERE appointment_id = a.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE appointment_id = a.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM appointments a
      LEFT JOIN users client_user ON a.client_id = client_user.id
      LEFT JOIN users counselor_user ON a.counselor_id = counselor_user.id
      WHERE (a.client_id = ? OR a.counselor_id = ?)
      AND EXISTS (
        SELECT 1 FROM messages WHERE appointment_id = a.id
      )
      ORDER BY last_message_time DESC
    `, [user_id, user_id, user_id, user_id, user_id, user_id, user_id]);

    res.json({
      success: true,
      conversations: conversations
    });

  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
};

// Marquer les messages comme lus
const markMessagesAsRead = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { user_id } = req.body;

    await pool.query(`
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE appointment_id = ? AND receiver_id = ? AND is_read = false
    `, [appointment_id, user_id]);

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });

  } catch (error) {
    console.error('Erreur marquage messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages'
    });
  }
};

// Obtenir le nombre de messages non lus
const getUnreadCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [result] = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = ? AND is_read = false
    `, [user_id]);

    res.json({
      success: true,
      unread_count: result[0].unread_count
    });

  } catch (error) {
    console.error('Erreur comptage messages non lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des messages'
    });
  }
};

// Upload de fichier pour message
const uploadMessageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const file_url = `/uploads/messages/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size
    });

  } catch (error) {
    console.error('Erreur upload fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier'
    });
  }
};

module.exports = {
  sendMessage,
  getAppointmentMessages,
  getUserConversations,
  markMessagesAsRead,
  getUnreadCount,
  uploadMessageFile
};
