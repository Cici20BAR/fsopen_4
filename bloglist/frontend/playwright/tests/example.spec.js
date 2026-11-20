// @ts-check
import { test, expect } from '@playwright/test'
import process from 'node:process'

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:3004'
const password = 'password123'

const uniqueTitle = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const createAccount = async (request, name = 'Test User') => {
  const username = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const response = await request.post(`${apiUrl}/api/users`, {
    data: { name, username, password },
  })
  expect(response.status()).toBe(201)
  return { name, username, password }
}

const loginThroughUi = async (page, account) => {
  await page.getByRole('link', { name: 'Sign in' }).click()
  await page.getByLabel('Username').fill(account.username)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

const createBlogThroughUi = async (page, title) => {
  await page.getByRole('link', { name: 'Add blog' }).click()
  await page.getByLabel('Title').fill(title)
  await page.getByLabel('Author').fill('Test Author')
  await page
    .getByLabel('URL')
    .fill(`https://example.com/${encodeURIComponent(title)}`)
  await page.getByRole('button', { name: 'Add blog' }).click()
  await expect(
    page.getByRole('heading', { name: 'All blogs' }),
  ).toBeVisible()
}

const openBlogDetails = async (page, request, title) => {
  const response = await request.get(`${apiUrl}/api/blogs`)
  expect(response.status()).toBe(200)
  const blogs = await response.json()
  const blog = blogs.find((item) => item.title === title)
  expect(blog).toBeDefined()
  await page.getByRole('link', { name: title, exact: true }).click()
}

test('shows all blogs by default and opens a single blog page', async ({
  page,
  request,
}) => {
  const account = await createAccount(request)
  const title = uniqueTitle('Routed details test')
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'All blogs' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add blog' })).toHaveCount(0)

  await loginThroughUi(page, account)
  await createBlogThroughUi(page, title)
  await openBlogDetails(page, request, title)

  await expect(page).toHaveURL(/\/blogs\/[^/]+$/)
  await expect(page.getByText(title)).toBeVisible()
  await expect(
    page.getByText(`https://example.com/${encodeURIComponent(title)}`),
  ).toBeVisible()
})

test('only logged-in users can like and only owners can delete', async ({
  page,
  request,
}) => {
  const account = await createAccount(request, 'Owner')
  const title = uniqueTitle('Permission test blog')
  await page.goto('/')
  await loginThroughUi(page, account)
  await createBlogThroughUi(page, title)
  await openBlogDetails(page, request, title)
  await expect(page.getByRole('button', { name: 'Like' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()

  await page.getByRole('button', { name: 'Like' }).click()
  await expect(page.getByText('1 like')).toBeVisible()
})

test('Add blog is in the navigation and creating a blog redirects to all blogs', async ({
  page,
  request,
}) => {
  const account = await createAccount(request)
  const title = uniqueTitle('Create and redirect test')
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Add blog' })).toHaveCount(0)
  await loginThroughUi(page, account)

  await expect(page.getByRole('link', { name: 'Add blog' })).toBeVisible()
  await createBlogThroughUi(page, title)
  await expect(page).toHaveURL('/')
  await expect(page.getByText(title)).toBeVisible()
})

test('deleting a blog redirects to all blogs', async ({ page, request }) => {
  const account = await createAccount(request)
  const title = uniqueTitle('Delete and redirect test')
  await page.goto('/')
  await loginThroughUi(page, account)
  await createBlogThroughUi(page, title)
  await openBlogDetails(page, request, title)

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByText(title)).toHaveCount(0)
})
