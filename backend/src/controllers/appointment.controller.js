const pool = require('../config/database');

// Créer un rendez-vous
const createAppointment = async (req, res) => {
  try {
    const {
      client_id,
      counselor_id,
      appointment_type,
      scheduled_at,
      duration_minutes = 60,
      client_notes
    } = req.body;

    // Vérifier la disponibilité du conseiller
    const [availabilityCheck] = await pool.query(`
      SELECT * FROM counselor_availability 
      WHERE counselor_id = ? AND is_available = true
    `, [counselor_id]);

    if (availabilityCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Conseiller non disponible'
      });
    }

    // Vérifier les conflits de rendez-vous
    const [conflicts] = await pool.query(`
      SELECT * FROM appointments 
      WHERE counselor_id = ? AND scheduled_at = ? 
      AND status IN ('pending', 'confirmed', 'in_progress')
    `, [counselor_id, scheduled_at]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Créneau déjà réservé'
      });
    }

    // Créer le rendez-vous
    const [result] = await pool.query(`
      INSERT INTO appointments (
        client_id, counselor_id, appointment_type, 
        scheduled_at, duration_minutes, client_notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [client_id, counselor_id, appointment_type, scheduled_at, duration_minutes, client_notes]);

    // Générer un lien de meeting
    const meetingLink = `https://meet.orientationpro.cg/appointment/${result.insertId}`;

    // Mettre à jour avec le lien de meeting
    await pool.query(`
      UPDATE appointments SET meeting_link = ? WHERE id = ?
    `, [meetingLink, result.insertId]);

    res.json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      appointment: {
        id: result.insertId,
        meeting_link: meetingLink
      }
    });

  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rendez-vous'
    });
  }
};

// Obtenir les rendez-vous d'un conseiller
const getCounselorAppointments = async (req, res) => {
  try {
    const { counselor_id } = req.params;
    const { status, date_from, date_to } = req.query;

    let query = `
      SELECT 
        a.*,
        u.email as client_email,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        cp.bio as counselor_bio,
        cp.specializations
      FROM appointments a
      LEFT JOIN users u ON a.client_id = u.id
      LEFT JOIN counselor_profiles cp ON a.counselor_id = cp.user_id
      WHERE a.counselor_id = ?
    `;

    const params = [counselor_id];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date_from) {
      query += ' AND a.scheduled_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND a.scheduled_at <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY a.scheduled_at DESC';

    const [appointments] = await pool.query(query, params);

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        ...apt,
        specializations: apt.specializations ? JSON.parse(apt.specializations) : []
      }))
    });

  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous'
    });
  }
};

// Obtenir les rendez-vous d'un client
const getClientAppointments = async (req, res) => {
  try {
    const { client_id } = req.params;

    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        u.email as counselor_email,
        u.first_name as counselor_first_name,
        u.last_name as counselor_last_name,
        cp.bio as counselor_bio,
        cp.specializations,
        cp.rating as counselor_rating
      FROM appointments a
      LEFT JOIN users u ON a.counselor_id = u.id
      LEFT JOIN counselor_profiles cp ON a.counselor_id = cp.user_id
      WHERE a.client_id = ?
      ORDER BY a.scheduled_at DESC
    `, [client_id]);

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        ...apt,
        specializations: apt.specializations ? JSON.parse(apt.specializations) : []
      }))
    });

  } catch (error) {
    console.error('Erreur récupération rendez-vous client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous'
    });
  }
};

// Mettre à jour le statut d'un rendez-vous
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status, counselor_notes, rating, feedback } = req.body;

    const updateFields = ['status = ?'];
    const params = [status];

    if (counselor_notes) {
      updateFields.push('counselor_notes = ?');
      params.push(counselor_notes);
    }

    if (rating) {
      updateFields.push('rating = ?');
      params.push(rating);
    }

    if (feedback) {
      updateFields.push('feedback = ?');
      params.push(feedback);
    }

    params.push(appointment_id);

    await pool.query(`
      UPDATE appointments 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, params);

    // Si le rendez-vous est terminé, mettre à jour les statistiques du conseiller
    if (status === 'completed') {
      await pool.query(`
        UPDATE counselor_profiles 
        SET total_sessions = total_sessions + 1
        WHERE user_id = (SELECT counselor_id FROM appointments WHERE id = ?)
      `, [appointment_id]);
    }

    res.json({
      success: true,
      message: 'Statut du rendez-vous mis à jour'
    });

  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Obtenir les créneaux disponibles d'un conseiller
const getAvailableSlots = async (req, res) => {
  try {
    const { counselor_id } = req.params;
    const { date } = req.query;

    // Obtenir les disponibilités du conseiller
    const [availability] = await pool.query(`
      SELECT * FROM counselor_availability 
      WHERE counselor_id = ? AND is_available = true
    `, [counselor_id]);

    // Obtenir les rendez-vous déjà pris
    const [existingAppointments] = await pool.query(`
      SELECT scheduled_at, duration_minutes 
      FROM appointments 
      WHERE counselor_id = ? 
      AND DATE(scheduled_at) = ? 
      AND status IN ('pending', 'confirmed', 'in_progress')
    `, [counselor_id, date]);

    // Générer les créneaux disponibles
    const availableSlots = [];
    const targetDate = new Date(date);

    availability.forEach(avail => {
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      if (avail.day_of_week === dayOfWeek) {
        const startTime = new Date(`${date}T${avail.start_time}`);
        const endTime = new Date(`${date}T${avail.end_time}`);
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + 60 * 60000); // +1 heure
          
          // Vérifier si le créneau n'est pas déjà pris
          const isBooked = existingAppointments.some(apt => {
            const aptStart = new Date(apt.scheduled_at);
            const aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000);
            
            return (currentTime < aptEnd && slotEnd > aptStart);
          });

          if (!isBooked && slotEnd <= endTime) {
            availableSlots.push({
              start_time: currentTime.toISOString(),
              end_time: slotEnd.toISOString(),
              duration: 60
            });
          }

          currentTime.setHours(currentTime.getHours() + 1);
        }
      }
    });

    res.json({
      success: true,
      available_slots: availableSlots
    });

  } catch (error) {
    console.error('Erreur récupération créneaux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux'
    });
  }
};

// Obtenir les statistiques d'un conseiller
const getCounselorStats = async (req, res) => {
  try {
    const { counselor_id } = req.params;

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as appointments_last_30_days
      FROM appointments 
      WHERE counselor_id = ?
    `, [counselor_id]);

    const [profile] = await pool.query(`
      SELECT * FROM counselor_profiles WHERE user_id = ?
    `, [counselor_id]);

    res.json({
      success: true,
      stats: {
        total_appointments: stats[0].total_appointments || 0,
        completed_appointments: stats[0].completed_appointments || 0,
        pending_appointments: stats[0].pending_appointments || 0,
        average_rating: parseFloat(stats[0].average_rating || 0).toFixed(2),
        appointments_last_30_days: stats[0].appointments_last_30_days || 0,
        profile: profile[0] || null
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  createAppointment,
  getCounselorAppointments,
  getClientAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
  getCounselorStats
};
