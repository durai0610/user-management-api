import { validate as uuidValidate } from 'uuid'

export function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

export function normalizeMobile(raw) {
  if (!raw) return null
  const s = String(raw).replace(/\s+/g, '').replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '')
  return s.length === 10 ? s : null
}

export function normalizePAN(raw) {
  if (!raw) return null
  const pan = String(raw).trim().toUpperCase()
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) ? pan : null
}

export function isValidUUID(v) {
  return typeof v === 'string' && uuidValidate(v)
}

export function validateCreatePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Payload is required'
  const { full_name, mob_num, pan_num, manager_id } = payload
  if (!isNonEmptyString(full_name)) return 'full_name must not be empty'
  const mob = normalizeMobile(mob_num)
  if (!mob) return 'mob_num must be a valid 10-digit mobile number (supports +91 or 0 prefix)'
  const pan = normalizePAN(pan_num)
  if (!pan) return 'pan_num must be a valid PAN (e.g., ABCDE1234F)'
  if (!isValidUUID(manager_id)) return 'manager_id must be a valid UUID'
  return null
}

export function validateUpdateData(update_data) {
  if (!update_data || typeof update_data !== 'object') return 'update_data is required'
  if (update_data.full_name !== undefined && !isNonEmptyString(update_data.full_name)) return 'full_name must not be empty'
  if (update_data.mob_num !== undefined && !normalizeMobile(update_data.mob_num)) return 'mob_num must be a valid 10-digit mobile number'
  if (update_data.pan_num !== undefined && !normalizePAN(update_data.pan_num)) return 'pan_num must be a valid PAN'
  if (update_data.manager_id !== undefined && !isValidUUID(update_data.manager_id)) return 'manager_id must be a valid UUID'
  return null
}
