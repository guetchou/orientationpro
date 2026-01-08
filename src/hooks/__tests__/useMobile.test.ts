import { renderHook, act } from '@testing-library/react'
import { useMobile } from '../useMobile'

// Mock de window.innerWidth et window.innerHeight
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
}

describe('useMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset window dimensions
    mockWindowDimensions(1024, 768)
    
    // Reset navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
  })

  test('should detect desktop by default', () => {
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.deviceType).toBe('desktop')
  })

  test('should detect mobile device', () => {
    mockWindowDimensions(375, 667)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.deviceType).toBe('mobile')
  })

  test('should detect tablet device', () => {
    mockWindowDimensions(768, 1024)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.deviceType).toBe('tablet')
  })

  test('should detect portrait orientation', () => {
    mockWindowDimensions(375, 667)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.orientation).toBe('portrait')
  })

  test('should detect landscape orientation', () => {
    mockWindowDimensions(667, 375)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.orientation).toBe('landscape')
  })

  test('should update on window resize', () => {
    const { result } = renderHook(() => useMobile())
    
    // Initially desktop
    expect(result.current.isDesktop).toBe(true)
    
    // Resize to mobile
    act(() => {
      mockWindowDimensions(375, 667)
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
  })

  test('should detect touch device', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: {},
    })
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isTouchDevice).toBe(true)
  })

  test('should detect mobile user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    })
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.deviceType).toBe('mobile')
  })

  test('should detect Android tablet user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36',
    })
    mockWindowDimensions(800, 1280)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.deviceType).toBe('tablet')
  })

  test('should support notifications', () => {
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.supportsNotifications).toBe(true)
  })

  test('should support service worker', () => {
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.supportsServiceWorker).toBe(true)
  })

  test('should get connection speed when available', () => {
    const { result } = renderHook(() => useMobile())
    
    const connectionSpeed = result.current.connectionSpeed
    expect(connectionSpeed).toEqual({
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false
    })
  })

  test('should get accessibility preferences', () => {
    const { result } = renderHook(() => useMobile())
    
    const preferences = result.current.accessibilityPreferences
    expect(preferences).toHaveProperty('reducedMotion')
    expect(preferences).toHaveProperty('highContrast')
    expect(preferences).toHaveProperty('darkMode')
  })

  test('should track screen size', () => {
    mockWindowDimensions(1920, 1080)
    
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.screenSize).toEqual({ width: 1920, height: 1080 })
  })
})
