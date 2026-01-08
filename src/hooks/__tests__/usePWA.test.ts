import { renderHook, act } from '@testing-library/react'
import { usePWA } from '../usePWA'

// Mock des API du navigateur
const mockBeforeInstallPromptEvent = {
  preventDefault: vi.fn(),
  prompt: vi.fn().mockResolvedValue({}),
  userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  platforms: ['web'],
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
    
    // Reset display mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isInstallable).toBe(false)
    expect(result.current.isInstalled).toBe(false)
    expect(result.current.isOnline).toBe(true)
    expect(typeof result.current.installApp).toBe('function')
    expect(typeof result.current.getDeviceCapabilities).toBe('function')
  })

  test('should detect installed PWA', () => {
    // Mock standalone display mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isInstalled).toBe(true)
  })

  test('should handle offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => usePWA())
    
    expect(result.current.isOnline).toBe(false)
  })

  test('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWA())
    
    // Simuler l'événement beforeinstallprompt
    act(() => {
      const event = new Event('beforeinstallprompt') as any
      Object.assign(event, mockBeforeInstallPromptEvent)
      window.dispatchEvent(event)
    })
    
    expect(result.current.isInstallable).toBe(true)
  })

  test('should install app when prompted', async () => {
    const { result } = renderHook(() => usePWA())
    
    // Simuler l'événement beforeinstallprompt
    act(() => {
      const event = new Event('beforeinstallprompt') as any
      Object.assign(event, mockBeforeInstallPromptEvent)
      window.dispatchEvent(event)
    })
    
    // Tenter l'installation
    await act(async () => {
      const success = await result.current.installApp()
      expect(success).toBe(true)
    })
    
    expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled()
  })

  test('should get device capabilities', () => {
    const { result } = renderHook(() => usePWA())
    
    const capabilities = result.current.getDeviceCapabilities()
    
    expect(capabilities).toHaveProperty('standalone')
    expect(capabilities).toHaveProperty('touchScreen')
    expect(capabilities).toHaveProperty('orientation')
    expect(capabilities).toHaveProperty('connection')
  })

  test('should request notification permission', async () => {
    const { result } = renderHook(() => usePWA())
    
    const permission = await result.current.requestNotificationPermission()
    
    expect(permission).toBe('granted')
  })

  test('should send notification when permission granted', () => {
    const { result } = renderHook(() => usePWA())
    
    // Mock Notification constructor
    global.Notification = vi.fn().mockImplementation((title, options) => ({
      title,
      ...options,
    })) as any
    
    const notification = result.current.sendNotification('Test Title', {
      body: 'Test body'
    })
    
    expect(notification).toBeDefined()
    expect(global.Notification).toHaveBeenCalledWith('Test Title', {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      body: 'Test body'
    })
  })
})
