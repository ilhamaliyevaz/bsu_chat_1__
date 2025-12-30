import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings, Faculty, User, Message } from './types'
import { FACULTIES, VERIFICATION_QUESTIONS } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// CORS və static files
app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))

// Helper funksiyalar
function getBakuTime() {
  // Bakı UTC+4 saat zonası
  const now = new Date()
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const bakuTime = new Date(utcTime + (4 * 60 * 60 * 1000))
  return bakuTime.toISOString()
}

function formatBakuTime(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function filterBannedWords(text: string, bannedWords: string[]): string {
  let filtered = text
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '***')
  })
  return filtered
}

// ============= AUTH API =============

// Qeydiyyat - Verification sualları
app.post('/api/auth/get-questions', async (c) => {
  const questions = [...VERIFICATION_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(q => ({ question: q.question, answer: q.answer }))
  
  return c.json({ questions })
})

// Qeydiyyat
app.post('/api/auth/register', async (c) => {
  try {
    const { email, phone, password, full_name, faculty, course, answers } = await c.req.json()
    const { env } = c

    // Email validation (bsu.edu.az)
    if (!email.endsWith('bsu.edu.az')) {
      return c.json({ error: 'Email bsu.edu.az ilə bitməlidir' }, 400)
    }

    // Phone validation (+994XXXXXXXXX)
    if (!phone.match(/^\+994\d{9}$/)) {
      return c.json({ error: 'Telefon nömrəsi +994XXXXXXXXX formatında olmalıdır' }, 400)
    }

    // Verification answers check (minimum 2 doğru cavab)
    let correctCount = 0
    for (const ans of answers) {
      const question = VERIFICATION_QUESTIONS.find(q => q.question === ans.question)
      if (question && question.answer === ans.answer) {
        correctCount++
      }
    }

    if (correctCount < 2) {
      return c.json({ error: 'Minimum 2 sualı doğru cavablandırmalısınız' }, 400)
    }

    // İstifadəçi mövcudluğunu yoxla
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR phone = ?'
    ).bind(email, phone).first()

    if (existingUser) {
      return c.json({ error: 'Bu email və ya telefon artıq qeydiyyatdan keçib' }, 400)
    }

    // İstifadəçi yarat
    const result = await env.DB.prepare(
      'INSERT INTO users (email, phone, password, full_name, faculty, course) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email, phone, password, full_name, faculty, course).run()

    return c.json({ 
      success: true, 
      userId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ error: 'Qeydiyyat zamanı xəta baş verdi' }, 500)
  }
})

// Giriş
app.post('/api/auth/login', async (c) => {
  try {
    const { identifier, password } = await c.req.json()
    const { env } = c

    // Email və ya telefon ilə giriş
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE (email = ? OR phone = ?) AND password = ?'
    ).bind(identifier, identifier, password).first() as User | null

    if (!user) {
      return c.json({ error: 'Email/telefon və ya şifrə yanlışdır' }, 401)
    }

    if (user.is_banned === 1) {
      return c.json({ error: 'Hesabınız bloklanıb' }, 403)
    }

    return c.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        faculty: user.faculty,
        course: user.course,
        profile_image: user.profile_image
      }
    })
  } catch (error) {
    return c.json({ error: 'Giriş zamanı xəta baş verdi' }, 500)
  }
})

// ============= PROFIL API =============

// Profil məlumatları
app.get('/api/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { env } = c

    const user = await env.DB.prepare(
      'SELECT id, email, full_name, faculty, course, profile_image FROM users WHERE id = ?'
    ).bind(userId).first() as User | null

    if (!user) {
      return c.json({ error: 'İstifadəçi tapılmadı' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Profil şəkli yeniləmək
app.post('/api/profile/update-image', async (c) => {
  try {
    const { userId, imageUrl } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'UPDATE users SET profile_image = ? WHERE id = ?'
    ).bind(imageUrl, userId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Profil məlumatlarını yeniləmək
app.post('/api/profile/update', async (c) => {
  try {
    const { userId, full_name, faculty, course } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'UPDATE users SET full_name = ?, faculty = ?, course = ? WHERE id = ?'
    ).bind(full_name, faculty, course, userId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Əngəllənmiş istifadəçiləri gətir
app.get('/api/profile/:userId/blocked', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { env } = c

    const blocked = await env.DB.prepare(`
      SELECT u.id, u.full_name, u.profile_image, u.faculty
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = ?
      ORDER BY b.created_at DESC
    `).bind(userId).all()

    return c.json({ blocked: blocked.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Əngəli aç
app.post('/api/unblock', async (c) => {
  try {
    const { blockerId, blockedId } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
    ).bind(blockerId, blockedId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// ============= FAKULTƏ CHAT API =============

// Fakültə mesajlarını əldə et
app.get('/api/faculty/:faculty/messages', async (c) => {
  try {
    const faculty = decodeURIComponent(c.req.param('faculty')) as Faculty
    const { env } = c

    // 24 saatdan köhnə mesajları sil
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    await env.DB.prepare(
      'DELETE FROM faculty_messages WHERE created_at < ?'
    ).bind(cutoffTime).run()

    // Mesajları gətir
    const messages = await env.DB.prepare(`
      SELECT fm.*, u.full_name, u.profile_image 
      FROM faculty_messages fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.faculty = ?
      ORDER BY fm.created_at ASC
    `).bind(faculty).all()

    return c.json({ messages: messages.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Fakültəyə mesaj göndər
app.post('/api/faculty/:faculty/send', async (c) => {
  try {
    const faculty = decodeURIComponent(c.req.param('faculty')) as Faculty
    const { userId, message } = await c.req.json()
    const { env } = c

    // İstifadəçi ban olunubmu?
    const user = await env.DB.prepare(
      'SELECT is_banned FROM users WHERE id = ?'
    ).bind(userId).first() as { is_banned: number } | null

    if (!user || user.is_banned === 1) {
      return c.json({ error: 'Mesaj göndərə bilməzsiniz' }, 403)
    }

    // Qadağan olunmuş sözləri filtrləmə
    const bannedWords = await env.DB.prepare(
      'SELECT word FROM banned_words'
    ).all()
    
    const bannedWordsList = (bannedWords.results || []).map((w: any) => w.word)
    const filteredMessage = filterBannedWords(message, bannedWordsList)

    // Mesajı əlavə et
    const result = await env.DB.prepare(
      'INSERT INTO faculty_messages (faculty, user_id, message, created_at) VALUES (?, ?, ?, ?)'
    ).bind(faculty, userId, filteredMessage, getBakuTime()).run()

    return c.json({ 
      success: true,
      messageId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// ============= ŞƏXSI CHAT API =============

// Şəxsi söhbətləri gətir (conversation list)
app.get('/api/private/:userId/conversations', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { env } = c

    const conversations = await env.DB.prepare(`
      SELECT DISTINCT
        CASE 
          WHEN pm.sender_id = ? THEN pm.receiver_id 
          ELSE pm.sender_id 
        END as other_user_id,
        u.full_name,
        u.profile_image,
        u.faculty,
        MAX(pm.created_at) as last_message_time
      FROM private_messages pm
      JOIN users u ON (
        CASE 
          WHEN pm.sender_id = ? THEN pm.receiver_id 
          ELSE pm.sender_id 
        END = u.id
      )
      WHERE pm.sender_id = ? OR pm.receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `).bind(userId, userId, userId, userId).all()

    return c.json({ conversations: conversations.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Şəxsi mesajları əldə et
app.get('/api/private/:userId1/:userId2/messages', async (c) => {
  try {
    const userId1 = c.req.param('userId1')
    const userId2 = c.req.param('userId2')
    const { env } = c

    // Bloklanmış istifadəçiləri yoxla
    const block = await env.DB.prepare(
      'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
    ).bind(userId1, userId2, userId2, userId1).first()

    if (block) {
      return c.json({ blocked: true, messages: [] })
    }

    // 24 saatdan köhnə mesajları sil
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    await env.DB.prepare(
      'DELETE FROM private_messages WHERE created_at < ?'
    ).bind(cutoffTime).run()

    // Mesajları gətir
    const messages = await env.DB.prepare(`
      SELECT pm.*, u.full_name, u.profile_image 
      FROM private_messages pm
      JOIN users u ON pm.sender_id = u.id
      WHERE (pm.sender_id = ? AND pm.receiver_id = ?) OR (pm.sender_id = ? AND pm.receiver_id = ?)
      ORDER BY pm.created_at ASC
    `).bind(userId1, userId2, userId2, userId1).all()

    return c.json({ messages: messages.results || [], blocked: false })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Şəxsi mesaj göndər
app.post('/api/private/send', async (c) => {
  try {
    const { senderId, receiverId, message } = await c.req.json()
    const { env } = c

    // Bloklanmış istifadəçiləri yoxla
    const block = await env.DB.prepare(
      'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
    ).bind(senderId, receiverId, receiverId, senderId).first()

    if (block) {
      return c.json({ error: 'Mesaj göndərə bilməzsiniz' }, 403)
    }

    // Qadağan olunmuş sözləri filtrləmə
    const bannedWords = await env.DB.prepare(
      'SELECT word FROM banned_words'
    ).all()
    
    const bannedWordsList = (bannedWords.results || []).map((w: any) => w.word)
    const filteredMessage = filterBannedWords(message, bannedWordsList)

    // Mesajı əlavə et
    const result = await env.DB.prepare(
      'INSERT INTO private_messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)'
    ).bind(senderId, receiverId, filteredMessage, getBakuTime()).run()

    return c.json({ 
      success: true,
      messageId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// ============= BLOKLAMA VƏ ŞİKAYƏT API =============

// İstifadəçini blokla
app.post('/api/block', async (c) => {
  try {
    const { blockerId, blockedId } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)'
    ).bind(blockerId, blockedId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Şikayət et
app.post('/api/report', async (c) => {
  try {
    const { reporterId, reportedId, reason } = await c.req.json()
    const { env } = c

    // Şikayət əlavə et
    await env.DB.prepare(
      'INSERT INTO reports (reporter_id, reported_id, reason) VALUES (?, ?, ?)'
    ).bind(reporterId, reportedId, reason || 'Şikayət edilib').run()

    // Şikayət sayını yoxla
    const reportCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM reports WHERE reported_id = ? AND status = ?'
    ).bind(reportedId, 'pending').first() as { count: number } | null

    // 16+ şikayət olarsa, təhlükəli hesab kimi qeyd et
    if (reportCount && reportCount.count >= 16) {
      await env.DB.prepare(
        'UPDATE reports SET status = ? WHERE reported_id = ? AND status = ?'
      ).bind('dangerous', reportedId, 'pending').run()
    }

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// ============= ADMIN API =============

// Admin girişi
app.post('/api/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const { env } = c

    const admin = await env.DB.prepare(
      'SELECT * FROM admins WHERE username = ? AND password = ?'
    ).bind(username, password).first() as { id: number; username: string; is_super_admin: number } | null

    if (!admin) {
      return c.json({ error: 'Admin məlumatları yanlışdır' }, 401)
    }

    return c.json({ 
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        is_super_admin: admin.is_super_admin === 1
      }
    })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Təhlükəli hesabları gətir
app.get('/api/admin/dangerous-accounts', async (c) => {
  try {
    const { env } = c

    const accounts = await env.DB.prepare(`
      SELECT u.id, u.email, u.full_name, u.faculty, COUNT(r.id) as report_count
      FROM users u
      JOIN reports r ON u.id = r.reported_id
      WHERE r.status = 'dangerous'
      GROUP BY u.id
      ORDER BY report_count DESC
    `).all()

    return c.json({ accounts: accounts.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// İstifadəçini ban et
app.post('/api/admin/ban-user', async (c) => {
  try {
    const { userId } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'UPDATE users SET is_banned = 1 WHERE id = ?'
    ).bind(userId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Bütün istifadəçiləri gətir (admin üçün)
app.get('/api/admin/all-users', async (c) => {
  try {
    const { env } = c

    const users = await env.DB.prepare(`
      SELECT id, full_name, email, phone, faculty, course, is_banned, created_at
      FROM users
      ORDER BY created_at DESC
    `).all()
    
    const totalCount = users.results?.length || 0

    return c.json({ 
      users: users.results || [],
      totalCount 
    })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// İstifadəçini deaktiv/aktiv et
app.post('/api/admin/toggle-user-status', async (c) => {
  try {
    const { userId, status } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'UPDATE users SET is_banned = ? WHERE id = ?'
    ).bind(status, userId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Qadağan olunmuş söz əlavə et
app.post('/api/admin/add-banned-word', async (c) => {
  try {
    const { word } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'INSERT OR IGNORE INTO banned_words (word) VALUES (?)'
    ).bind(word).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Qadağan olunmuş sözləri gətir
app.get('/api/admin/banned-words', async (c) => {
  try {
    const { env } = c

    const words = await env.DB.prepare(
      'SELECT * FROM banned_words ORDER BY word ASC'
    ).all()

    return c.json({ words: words.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Qaydaları yenilə
app.post('/api/admin/update-rules', async (c) => {
  try {
    const { content } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'DELETE FROM rules'
    ).run()

    await env.DB.prepare(
      'INSERT INTO rules (content) VALUES (?)'
    ).bind(content).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Qaydaları gətir
app.get('/api/rules', async (c) => {
  try {
    const { env } = c

    const rules = await env.DB.prepare(
      'SELECT content FROM rules ORDER BY id DESC LIMIT 1'
    ).first() as { content: string } | null

    return c.json({ rules: rules?.content || '' })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Günün mövzusunu yenilə
app.post('/api/admin/update-topic', async (c) => {
  try {
    const { topic } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'INSERT INTO daily_topic (topic, created_at) VALUES (?, ?)'
    ).bind(topic, getBakuTime()).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Günün mövzusunu gətir
app.get('/api/daily-topic', async (c) => {
  try {
    const { env } = c

    const topic = await env.DB.prepare(
      'SELECT topic, created_at FROM daily_topic ORDER BY created_at DESC LIMIT 1'
    ).first() as { topic: string; created_at: string } | null

    return c.json({ topic: topic?.topic || '', created_at: topic?.created_at || '' })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Alt admin yarat (super admin üçün)
app.post('/api/admin/create-sub-admin', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'INSERT INTO admins (username, password, is_super_admin) VALUES (?, ?, 0)'
    ).bind(username, password).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Alt adminləri gətir
app.get('/api/admin/sub-admins', async (c) => {
  try {
    const { env } = c

    const admins = await env.DB.prepare(
      'SELECT id, username, created_at FROM admins WHERE is_super_admin = 0 ORDER BY created_at DESC'
    ).all()

    return c.json({ admins: admins.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Alt admin sil
app.post('/api/admin/delete-sub-admin', async (c) => {
  try {
    const { adminId } = await c.req.json()
    const { env } = c

    await env.DB.prepare(
      'DELETE FROM admins WHERE id = ? AND is_super_admin = 0'
    ).bind(adminId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// Fakültədəki istifadəçiləri gətir
app.get('/api/faculty/:faculty/users', async (c) => {
  try {
    const faculty = decodeURIComponent(c.req.param('faculty')) as Faculty
    const { env } = c

    const users = await env.DB.prepare(
      'SELECT id, full_name, profile_image FROM users WHERE faculty = ? AND is_banned = 0'
    ).bind(faculty).all()

    return c.json({ users: users.results || [] })
  } catch (error) {
    return c.json({ error: 'Xəta baş verdi' }, 500)
  }
})

// ============= ƏSAS SƏHİFƏ =============
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="az">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BSU Chat - Bakı Dövlət Universiteti</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
