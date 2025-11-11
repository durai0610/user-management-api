import { getDB } from '../db/db.js'
import { v4 as uuidv4 } from 'uuid'
import * as validators from '../utils/validators.js'
import { logger } from '../utils/logger.js'

export async function createUser(req, res, next) {
  try {
    const errMsg = validators.validateCreatePayload(req.body)
    if (errMsg) return res.status(400).json({ success: false, message: errMsg })

    const db = getDB()
    const { full_name, mob_num, pan_num, manager_id } = req.body
    const normalizedMob = validators.normalizeMobile(mob_num)
    const normalizedPan = validators.normalizePAN(pan_num)
    const manager = await db.get('SELECT * FROM managers WHERE manager_id = ? AND is_active = 1', [manager_id])
    if (!manager) return res.status(400).json({ success: false, message: 'Manager not found or inactive' })

    const user_id = uuidv4()
    const now = new Date().toISOString()
    await db.run(
      `INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [user_id, full_name.trim(), normalizedMob, normalizedPan, manager_id, now, now]
    )
    logger.info(`User created: ${user_id}`)
    return res.json({ success: true, message: 'User created successfully', user_id })
  } catch (err) {
    logger.error(err.stack || err.toString())
    next(err)
  }
}

export async function getUsers(req, res, next) {
  try {
    const db = getDB()
    const { user_id, mob_num, manager_id } = req.body || {}

    if (user_id) {
      const rows = await db.all('SELECT * FROM users WHERE user_id = ?', [user_id])
      return res.json({ success: true, users: rows || [] })
    }

    if (mob_num) {
      const mob = validators.normalizeMobile(mob_num)
      if (!mob) return res.status(400).json({ success: false, message: 'Invalid mob_num format' })
      const rows = await db.all('SELECT * FROM users WHERE mob_num = ?', [mob])
      return res.json({ success: true, users: rows || [] })
    }

    if (manager_id) {
      const rows = await db.all('SELECT * FROM users WHERE manager_id = ?', [manager_id])
      return res.json({ success: true, users: rows || [] })
    }

    const rows = await db.all('SELECT * FROM users')
    return res.json({ success: true, users: rows || [] })
  } catch (err) {
    logger.error(err.stack || err.toString())
    next(err)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const db = getDB()
    const { user_id, mob_num } = req.body || {}
    if (!user_id && !mob_num) return res.status(400).json({ success: false, message: 'Provide user_id or mob_num' })

    if (user_id) {
      const result = await db.run('DELETE FROM users WHERE user_id = ?', [user_id])
      if (result.changes === 0) return res.status(404).json({ success: false, message: 'User not found' })
      logger.info(`User deleted by user_id: ${user_id}`)
      return res.json({ success: true, message: 'User deleted successfully' })
    }

    const mob = validators.normalizeMobile(mob_num)
    if (!mob) return res.status(400).json({ success: false, message: 'Invalid mob_num format' })
    const result = await db.run('DELETE FROM users WHERE mob_num = ?', [mob])
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'User not found' })
    logger.info(`User(s) deleted by mob_num: ${mob}`)
    return res.json({ success: true, message: 'User(s) deleted successfully' })
  } catch (err) {
    logger.error(err.stack || err.toString())
    next(err)
  }
}

export async function updateUser(req, res, next) {
  try {
    const body = req.body || {}
    const user_ids = body.user_ids
    const update_data = body.update_data

    if (!Array.isArray(user_ids) || user_ids.length === 0)
      return res.status(400).json({ success: false, message: 'user_ids must be a non-empty array' })

    const vErr = validators.validateUpdateData(update_data)
    if (vErr) return res.status(400).json({ success: false, message: vErr })

    const db = getDB()
    const keys = Object.keys(update_data || {})

    if (keys.length === 1 && keys[0] === 'manager_id') {
      const newManager = update_data.manager_id
      const managerExists = await db.get('SELECT manager_id FROM managers WHERE manager_id = ? AND is_active = 1', [newManager])
      if (!managerExists) return res.status(400).json({ success: false, message: 'Manager not found or inactive' })

      const placeholders = user_ids.map(() => '?').join(',')
      const params = [newManager, new Date().toISOString(), ...user_ids]
      await db.run(`UPDATE users SET manager_id = ?, updated_at = ? WHERE user_id IN (${placeholders})`, params)
      logger.info(`Bulk manager update to ${newManager} for ${user_ids.length} user(s)`)
      return res.json({ success: true, message: 'Manager updated for provided users' })
    }

    for (const uid of user_ids) {
      const user = await db.get('SELECT * FROM users WHERE user_id = ? AND is_active = 1', [uid])
      if (!user) return res.status(404).json({ success: false, message: `User not found: ${uid}` })

      if (update_data.manager_id !== undefined && update_data.manager_id !== user.manager_id) {
        const newManagerId = update_data.manager_id
        const managerExists = await db.get('SELECT manager_id FROM managers WHERE manager_id = ? AND is_active = 1', [newManagerId])
        if (!managerExists) return res.status(400).json({ success: false, message: 'Manager not found or inactive' })

        await db.run('UPDATE users SET is_active = 0, updated_at = ? WHERE user_id = ?', [new Date().toISOString(), uid])

        const new_full_name = update_data.full_name !== undefined ? update_data.full_name.trim() : user.full_name
        const new_mob = update_data.mob_num !== undefined ? validators.normalizeMobile(update_data.mob_num) : user.mob_num
        const new_pan = update_data.pan_num !== undefined ? validators.normalizePAN(update_data.pan_num) : user.pan_num

        if (!validators.isNonEmptyString(new_full_name)) return res.status(400).json({ success: false, message: 'Invalid full_name' })
        if (!new_mob) return res.status(400).json({ success: false, message: 'Invalid mob_num' })
        if (!new_pan) return res.status(400).json({ success: false, message: 'Invalid pan_num' })

        const now = new Date().toISOString()
        await db.run(
          `INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [uid, new_full_name, new_mob, new_pan, newManagerId, user.created_at || now, now]
        )
        logger.info(`Manager changed for user ${uid} to ${newManagerId} (history preserved)`)
        continue
      }

      const updates = []
      const params = []

      if (update_data.full_name !== undefined) {
        if (!validators.isNonEmptyString(update_data.full_name)) return res.status(400).json({ success: false, message: 'Invalid full_name' })
        updates.push('full_name = ?'); params.push(update_data.full_name.trim())
      }
      if (update_data.mob_num !== undefined) {
        const mob = validators.normalizeMobile(update_data.mob_num)
        if (!mob) return res.status(400).json({ success: false, message: 'Invalid mob_num' })
        updates.push('mob_num = ?'); params.push(mob)
      }
      if (update_data.pan_num !== undefined) {
        const pan = validators.normalizePAN(update_data.pan_num)
        if (!pan) return res.status(400).json({ success: false, message: 'Invalid pan_num' })
        updates.push('pan_num = ?'); params.push(pan)
      }

      if (updates.length === 0) continue

      updates.push('updated_at = ?'); params.push(new Date().toISOString(), uid)
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ? AND is_active = 1`
      await db.run(sql, params)
      logger.info(`Updated fields for user ${uid}`)
    }

    return res.json({ success: true, message: 'Update(s) completed' })
  } catch (err) {
    logger.error(err.stack || err.toString())
    next(err)
  }
}
