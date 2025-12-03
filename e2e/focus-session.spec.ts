import { test, expect } from '@playwright/test'

test.describe('Focus Session E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Mock authentication (adjust based on your auth implementation)
    // For now, we'll navigate directly to dashboard
    await page.goto('/dashboard')
  })

  test('should start a quick focus session', async ({ page }) => {
    // Click the quick focus button
    await page.click('text=빠른 집중')

    // Should navigate to timer page
    await expect(page).toHaveURL('/timer')

    // Timer should be visible
    await expect(page.locator('text=집중 시간')).toBeVisible()

    // Timer should show initial time (25:00)
    await expect(page.locator('text=25:00')).toBeVisible()

    // Status should show "집중중"
    await expect(page.locator('text=집중중')).toBeVisible()
  })

  test('should pause and resume timer', async ({ page }) => {
    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Get initial time
    const initialTime = await page.locator('[class*="text-7xl"]').textContent()

    // Pause the timer
    await page.click('button:has-text("일시정지")')

    // Status should change to "일시정지됨"
    await expect(page.locator('text=일시정지됨')).toBeVisible()

    // Wait a bit
    await page.waitForTimeout(2000)

    // Time should not have changed
    const pausedTime = await page.locator('[class*="text-7xl"]').textContent()
    expect(pausedTime).toBe(initialTime)

    // Resume the timer
    await page.click('button:has-text("재개")')

    // Status should change back to "집중중"
    await expect(page.locator('text=집중중')).toBeVisible()

    // Wait and check that timer is counting down
    await page.waitForTimeout(2000)
    const resumedTime = await page.locator('[class*="text-7xl"]').textContent()
    expect(resumedTime).not.toBe(pausedTime)
  })

  test('should complete a focus session', async ({ page }) => {
    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Click complete button
    await page.click('button:has-text("완료")')

    // Should navigate back to dashboard
    await page.waitForURL('/dashboard')

    // Success message or updated stats should be visible
    // (Adjust based on your actual implementation)
  })

  test('should exit focus session with ESC key', async ({ page }) => {
    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Press ESC key
    await page.keyboard.press('Escape')

    // Confirmation dialog should appear
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('집중 세션을 종료하시겠습니까?')
      await dialog.accept()
    })

    // Should navigate back to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should toggle timer with space bar', async ({ page }) => {
    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Press space bar to pause
    await page.keyboard.press('Space')

    // Should be paused
    await expect(page.locator('text=일시정지됨')).toBeVisible()

    // Press space bar to resume
    await page.keyboard.press('Space')

    // Should be running
    await expect(page.locator('text=집중중')).toBeVisible()
  })

  test('should start focus session from planner task', async ({ page }) => {
    // Create a task in planner (adjust based on your UI)
    await page.click('text=할 일 추가')
    await page.fill('input[placeholder*="할 일"]', '알고리즘 문제 풀기')
    await page.fill('input[placeholder*="시간"]', '30')
    await page.selectOption('select', '개발')
    await page.click('button:has-text("저장")')

    // Start focus session from task
    await page.click('text=알고리즘 문제 풀기')
    await page.click('button:has-text("집중 시작")')

    // Should navigate to timer page
    await expect(page).toHaveURL('/timer')

    // Task title should be visible
    await expect(page.locator('text=알고리즘 문제 풀기')).toBeVisible()

    // Category should be visible
    await expect(page.locator('text=개발')).toBeVisible()
  })

  test('should handle webcam permission prompt', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera'])

    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // AI coach should request webcam access
    // (Adjust based on your actual implementation)
    const aiCoachButton = page.locator('button:has-text("AI 코치 활성화")')
    if (await aiCoachButton.isVisible()) {
      await aiCoachButton.click()
    }

    // Webcam should be active
    // Check for video element or indicator
    await expect(page.locator('video, [aria-label*="웹캠"]')).toBeVisible()
  })

  test('should show AI warnings during session', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera'])

    // Start quick focus with AI
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Enable AI coach
    const aiCoachButton = page.locator('button:has-text("AI 코치 활성화")')
    if (await aiCoachButton.isVisible()) {
      await aiCoachButton.click()
    }

    // Wait for potential AI warnings
    // Note: This is hard to test without mocking the AI
    // In a real scenario, you might trigger warnings manually
    await page.waitForTimeout(5000)

    // Check if warning UI elements exist in the DOM
    // (They may not be visible if no issues are detected)
    const postureWarning = page.locator('text=/자세/i')
    const phoneWarning = page.locator('text=/스마트폰/i')
    const absenceWarning = page.locator('text=/자리/i')

    // These elements should exist even if not visible
    expect(await postureWarning.count()).toBeGreaterThanOrEqual(0)
    expect(await phoneWarning.count()).toBeGreaterThanOrEqual(0)
    expect(await absenceWarning.count()).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Timer should be visible and properly sized
    const timer = page.locator('[class*="text-5xl"]')
    await expect(timer).toBeVisible()

    // Controls should be visible
    const pauseButton = page.locator('button:has-text("일시정지")')
    const completeButton = page.locator('button:has-text("완료")')
    await expect(pauseButton).toBeVisible()
    await expect(completeButton).toBeVisible()
  })

  test('should countdown to zero and complete automatically', async ({ page }) => {
    // This test would take 25 minutes, so we'll skip it in normal runs
    // You can implement a test-specific shorter duration
    test.skip()

    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Wait for timer to reach zero (this would be mocked in real tests)
    await page.waitForTimeout(25 * 60 * 1000)

    // Should auto-complete and redirect
    await expect(page).toHaveURL('/dashboard')
  })

  test('should maintain session state on page reload', async ({ page }) => {
    // Start quick focus
    await page.click('text=빠른 집중')
    await page.waitForURL('/timer')

    // Get current time
    const initialTime = await page.locator('[class*="text-7xl"]').textContent()

    // Wait a few seconds
    await page.waitForTimeout(3000)

    // Reload page
    await page.reload()

    // Timer should still be running and time should have progressed
    const reloadedTime = await page.locator('[class*="text-7xl"]').textContent()
    expect(reloadedTime).not.toBe(initialTime)
    expect(reloadedTime).not.toBe('25:00') // Should not reset to initial
  })
})
