import { describe, expect, it } from 'bun:test'
import {
  ApiError,
  PROFILE_FIELD_LIMITS,
  getApiErrorDetails,
  getErrorCode,
  isCustomerUser,
  isPasswordChangeRequiredError,
  isRoleNotAllowedError,
} from '../src/lib/auth'

describe('auth helpers (P1-7 / P2-8)', () => {
  it('exposes code and field from the shared error body', () => {
    const error = new ApiError('Phone number must contain only digits.', 400, {
      detail: 'Phone number must contain only digits.',
      code: 'invalid',
      field: 'phone',
      errors: { phone: ['Phone number must contain only digits.'] },
      phone: ['Phone number must contain only digits.'],
    })
    const details = getApiErrorDetails(error, 'fallback')
    expect(details.status).toBe(400)
    expect(details.code).toBe('invalid')
    expect(details.field).toBe('phone')
    expect(details.message).toBe('Phone number must contain only digits.')
    expect(details.fieldErrors.phone).toBe('Phone number must contain only digits.')
  })

  it('returns null code/field for non-API errors and bodies without them', () => {
    expect(getApiErrorDetails(new Error('boom'), 'fallback')).toEqual({ message: 'fallback', fieldErrors: {}, status: 0, code: null, field: null })
    expect(getApiErrorDetails(new ApiError('x', 500, 'Server Error'), 'fallback').code).toBeNull()
    expect(getErrorCode(['invalid'])).toBeNull()
  })

  it('recognises the 403 role_not_allowed / password_change_required contract', () => {
    const roleError = new ApiError('This account cannot sign in to the customer app.', 403, {
      detail: 'This account cannot sign in to the customer app.',
      code: 'role_not_allowed',
      role: 'admin',
    })
    const pwdError = new ApiError('You must change your password before continuing.', 403, {
      detail: 'You must change your password before continuing.',
      code: 'password_change_required',
    })
    expect(isRoleNotAllowedError(roleError)).toBe(true)
    expect(isPasswordChangeRequiredError(roleError)).toBe(false)
    expect(isPasswordChangeRequiredError(pwdError)).toBe(true)
    expect(isRoleNotAllowedError(new ApiError('nope', 403, { detail: 'nope' }))).toBe(false)
    expect(isPasswordChangeRequiredError(new ApiError('nope', 401, { code: 'password_change_required' }))).toBe(false)
    expect(getApiErrorDetails(roleError, 'fallback').message).toBe('This account cannot sign in to the customer app.')
  })

  it('only treats the customer role as allowed', () => {
    expect(isCustomerUser({ role: 'customer' })).toBe(true)
    expect(isCustomerUser({ role: ' Customer ' })).toBe(true)
    expect(isCustomerUser({ role: 'admin' })).toBe(false)
    expect(isCustomerUser({ role: 'staff' })).toBe(false)
    expect(isCustomerUser({ role: '' })).toBe(false)
    expect(isCustomerUser(null)).toBe(false)
  })

  it('hardcodes the backend field limits', () => {
    expect(PROFILE_FIELD_LIMITS).toEqual({ name: 150, phone: 20, email: 254 })
  })
})
