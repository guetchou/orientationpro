const { pool } = require('../config/database');
const nodemailer = require('nodemailer');

// Configuration de l'email (à adapter selon votre fournisseur)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'noreply@orientationpro.cg',
      pass: process.env.SMTP_PASS || 'your-password'
    }
  });
};

// Envoyer un email de notification
const sendEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@orientationpro.cg',
      to,
      subject,
      html,
      text
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email'
    });
  }
};

// Envoyer une notification de statut de candidature
const sendApplicationStatusNotification = async (req, res) => {
  try {
    const { application_id, status, custom_message } = req.body;

    // Récupérer les informations de la candidature
    const [applications] = await pool.query(`
      SELECT 
        ja.*,
        u.first_name,
        u.last_name,
        u.email,
        jp.title as job_title,
        c.name as company_name
      FROM job_applications ja
      LEFT JOIN users u ON ja.candidate_id = u.id
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE ja.id = ?
    `, [application_id]);

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    const application = applications[0];
    
    // Templates d'email selon le statut
    const emailTemplates = {
      'reviewed': {
        subject: `Votre candidature pour ${application.job_title} a été examinée`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bonjour ${application.first_name},</h2>
            <p>Nous avons bien reçu et examiné votre candidature pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Nous apprécions votre intérêt pour ce poste et nous étudions attentivement votre profil.</p>
            <p>Vous serez informé(e) de la suite du processus dans les plus brefs délais.</p>
            <p>Cordialement,<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'shortlisted': {
        subject: `Excellente nouvelle ! Vous êtes présélectionné(e) pour ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Félicitations ${application.first_name} !</h2>
            <p>Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong> a été retenue !</p>
            <p>Votre profil correspond parfaitement à nos attentes et vous faites partie des candidats présélectionnés.</p>
            <p>Nous vous contacterons prochainement pour la suite du processus de recrutement.</p>
            <p>Félicitations encore !<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'interview_scheduled': {
        subject: `Entretien programmé pour ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Bonjour ${application.first_name},</h2>
            <p>Nous souhaitons programmer un entretien avec vous pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Notre équipe RH vous contactera dans les prochains jours pour convenir d'un créneau horaire.</p>
            <p>En attendant, n'hésitez pas à préparer vos questions sur le poste et l'entreprise.</p>
            <p>À bientôt !<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'interviewed': {
        subject: `Merci pour votre entretien - ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bonjour ${application.first_name},</h2>
            <p>Nous vous remercions d'avoir participé à l'entretien pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Nous avons apprécié notre échange et votre présentation.</p>
            <p>Nous finalisons actuellement notre processus de sélection et vous informerons de notre décision très prochainement.</p>
            <p>Cordialement,<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'offered': {
        subject: `Offre d'emploi - ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Félicitations ${application.first_name} !</h2>
            <p>Nous avons le plaisir de vous faire une offre d'emploi pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Vos compétences et votre profil nous ont convaincus et nous serions ravis de vous accueillir dans notre équipe.</p>
            <p>Vous recevrez prochainement tous les détails de l'offre par email ou par téléphone.</p>
            <p>Félicitations !<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'hired': {
        subject: `Bienvenue chez ${application.company_name} !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Félicitations ${application.first_name} !</h2>
            <p>Nous avons le plaisir de vous confirmer votre embauche pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Bienvenue dans notre équipe ! Nous sommes ravis de vous accueillir.</p>
            <p>Vous recevrez prochainement toutes les informations pratiques pour votre premier jour.</p>
            <p>À très bientôt !<br>L'équipe RH de ${application.company_name}</p>
        `
      },
      'rejected': {
        subject: `Retour sur votre candidature - ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bonjour ${application.first_name},</h2>
            <p>Nous vous remercions pour votre candidature au poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong>.</p>
            <p>Après un examen attentif de votre profil, nous avons pris la décision de ne pas retenir votre candidature pour ce poste.</p>
            <p>Cette décision ne remet pas en question vos compétences, et nous conservons votre CV dans nos archives pour de futurs postes.</p>
            <p>Nous vous souhaitons une excellente continuation dans vos recherches.</p>
            <p>Cordialement,<br>L'équipe RH de ${application.company_name}</p>
        `
      }
    };

    const template = emailTemplates[status];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Statut non reconnu'
      });
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@orientationpro.cg',
      to: application.email,
      subject: template.subject,
      html: template.html + (custom_message ? `<p><strong>Message personnalisé :</strong><br>${custom_message}</p>` : '')
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Notification envoyée avec succès'
    });

  } catch (error) {
    console.error('Erreur envoi notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification'
    });
  }
};

// Envoyer des rappels automatiques
const sendReminders = async (req, res) => {
  try {
    // Candidatures en attente depuis plus de 7 jours
    const [pendingApplications] = await pool.query(`
      SELECT 
        ja.*,
        u.first_name,
        u.last_name,
        u.email,
        jp.title as job_title,
        c.name as company_name
      FROM job_applications ja
      LEFT JOIN users u ON ja.candidate_id = u.id
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE ja.status = 'applied' 
        AND ja.applied_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const transporter = createTransporter();
    let sentCount = 0;

    for (const application of pendingApplications) {
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@orientationpro.cg',
        to: application.email,
        subject: `Rappel - Votre candidature pour ${application.job_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bonjour ${application.first_name},</h2>
            <p>Nous vous informons que votre candidature pour le poste de <strong>${application.job_title}</strong> chez <strong>${application.company_name}</strong> est toujours en cours d'examen.</p>
            <p>Le processus de recrutement peut prendre du temps, et nous apprécions votre patience.</p>
            <p>Vous serez informé(e) dès que nous aurons une réponse à vous communiquer.</p>
            <p>Cordialement,<br>L'équipe RH de ${application.company_name}</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (emailError) {
        console.error(`Erreur envoi email pour candidature ${application.id}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: `${sentCount} rappels envoyés sur ${pendingApplications.length} candidatures en attente`
    });

  } catch (error) {
    console.error('Erreur envoi rappels:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des rappels'
    });
  }
};

// Envoyer des notifications de nouvelles offres
const sendNewJobNotifications = async (req, res) => {
  try {
    const { job_posting_id, target_audience = 'all' } = req.body;

    // Récupérer l'offre d'emploi
    const [jobs] = await pool.query(`
      SELECT 
        jp.*,
        c.name as company_name,
        c.logo_url as company_logo
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.id = ?
    `, [job_posting_id]);

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    const job = jobs[0];

    // Récupérer les utilisateurs cibles
    let usersQuery = 'SELECT id, first_name, last_name, email FROM users WHERE role = "user"';
    let usersParams = [];

    if (target_audience === 'matching') {
      // Utilisateurs avec un profil complet et des compétences correspondantes
      usersQuery += ' AND id IN (SELECT DISTINCT user_id FROM cv_analysis WHERE user_id IS NOT NULL)';
    }

    const [users] = await pool.query(usersQuery, usersParams);

    const transporter = createTransporter();
    let sentCount = 0;

    for (const user of users) {
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@orientationpro.cg',
        to: user.email,
        subject: `Nouvelle offre d'emploi : ${job.title} chez ${job.company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bonjour ${user.first_name},</h2>
            <p>Une nouvelle offre d'emploi pourrait vous intéresser !</p>
            <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">${job.title}</h3>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Entreprise :</strong> ${job.company_name}</p>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Localisation :</strong> ${job.location}</p>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Type :</strong> ${job.employment_type}</p>
              ${job.salary_min && job.salary_max ? `<p style="color: #6b7280; margin: 5px 0;"><strong>Salaire :</strong> ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.currency}</p>` : ''}
            </div>
            <p>Si cette offre vous intéresse, n'hésitez pas à postuler directement sur notre plateforme.</p>
            <p>Bonne chance dans vos recherches !</p>
            <p>L'équipe OrientationPro</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (emailError) {
        console.error(`Erreur envoi notification pour utilisateur ${user.id}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: `${sentCount} notifications envoyées sur ${users.length} utilisateurs`
    });

  } catch (error) {
    console.error('Erreur envoi notifications nouvelles offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des notifications'
    });
  }
};

module.exports = {
  sendEmail,
  sendApplicationStatusNotification,
  sendReminders,
  sendNewJobNotifications
};
