#!/usr/bin/env node
/**
 * Stren Performance Benchmark
 * ─────────────────────────────────────────────────────────────
 * Measures Supabase query latency directly from your machine.
 * Eliminates Next.js, Netlify, and browser from the equation —
 * any overhead you see here is pure DB round-trip cost.
 *
 * Usage:
 *   node benchmark.mjs
 *   node benchmark.mjs --runs 10
 *   node benchmark.mjs --filter reports
 *   node benchmark.mjs --user admin@yourgym.com --pass yourpassword
 *
 * Requirements:
 *   npm install @supabase/supabase-js   (already in your project)
 *   .env.local must exist in the same directory you run from
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ── Load .env.local ──────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

// ── CLI args ─────────────────────────────────────────────────
const args   = process.argv.slice(2)
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null }
const RUNS   = parseInt(getArg('--runs') ?? '5', 10)
const FILTER = getArg('--filter')?.toLowerCase() ?? null
const EMAIL  = getArg('--user') ?? process.env.BENCH_EMAIL
const PASS   = getArg('--pass') ?? process.env.BENCH_PASS
const URL    = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL || !ANON) {
  console.error('\n❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n')
  process.exit(1)
}

const db = createClient(URL, ANON)

// ── Colours ──────────────────────────────────────────────────
const c = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m', white:'\x1b[37m' }
const fmt = ms => ms < 200 ? `${c.green}${ms.toFixed(1)}ms${c.reset}` : ms < 600 ? `${c.yellow}${ms.toFixed(1)}ms${c.reset}` : `${c.red}${ms.toFixed(1)}ms${c.reset}`
const bar = (ms, max) => {
  const w = 28, f = Math.round((ms / Math.max(max, 1)) * w)
  const col = ms < 200 ? c.green : ms < 600 ? c.yellow : c.red
  return col + '█'.repeat(Math.max(1, f)) + c.dim + '░'.repeat(Math.max(0, w - f)) + c.reset
}

// ── Core timer ───────────────────────────────────────────────
async function time(label, fn) {
  const t = []
  let err = null
  for (let i = 0; i < RUNS; i++) {
    const s = performance.now()
    try { const r = await fn(); if (r?.error) err = r.error }
    catch (e) { err = e }
    t.push(performance.now() - s)
  }
  t.sort((a, b) => a - b)
  return {
    label,
    avg: t.reduce((a, b) => a + b, 0) / t.length,
    min: t[0],
    max: t[t.length - 1],
    p95: t[Math.floor(t.length * 0.95)] ?? t[t.length - 1],
    error: err?.message ?? null,
  }
}

// ── Suite runner ─────────────────────────────────────────────
async function suite(title, benchmarks) {
  if (FILTER && !title.toLowerCase().includes(FILTER)) return []
  console.log(`\n${c.bold}${c.cyan}▶ ${title}${c.reset}`)
  console.log(c.dim + '─'.repeat(78) + c.reset)
  const results = []
  for (const { name, fn } of benchmarks) {
    process.stdout.write(`  ${name.padEnd(48)} ${c.dim}running…${c.reset}`)
    const r = await time(name, fn)
    results.push(r)
    const maxAvg = Math.max(...results.map(x => x.avg), 500)
    const errNote = r.error ? ` ${c.red}[${r.error.slice(0, 35)}]${c.reset}` : ''
    process.stdout.write('\r')
    console.log(`  ${r.label.padEnd(48)} ${bar(r.avg, maxAvg)} avg ${fmt(r.avg)}  p95 ${fmt(r.p95)}${errNote}`)
  }
  return results
}

// ── Auth ──────────────────────────────────────────────────────
async function signIn() {
  if (!EMAIL || !PASS) {
    console.log(`\n${c.yellow}⚠  No credentials — pass --user email --pass pw to test authenticated suites.${c.reset}`)
    return false
  }
  const { error } = await db.auth.signInWithPassword({ email: EMAIL, password: PASS })
  if (error) { console.error(`\n${c.red}❌  Auth failed: ${error.message}${c.reset}`); return false }
  console.log(`\n${c.green}✓  Signed in as ${EMAIL}${c.reset}`)
  return true
}

// ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold}${c.white}╔══════════════════════════════════════════════╗`)
  console.log(`║      STREN PERFORMANCE BENCHMARK SUITE       ║`)
  console.log(`╚══════════════════════════════════════════════╝${c.reset}`)
  console.log(`${c.dim}  runs: ${RUNS}  filter: ${FILTER ?? 'all'}  db: ${URL}${c.reset}`)

  const authed = await signIn()
  const all = []

  // ── Anon ─────────────────────────────────────────────────
  all.push(...await suite('Anon / Public', [
    { name: 'Gym search (member signup)',   fn: () => db.from('gyms').select('id,name,code,address').ilike('name','%gym%').limit(5) },
    { name: 'kiosk_get_checked_in RPC',     fn: () => db.rpc('kiosk_get_checked_in') },
    { name: 'kiosk_search_members RPC',     fn: () => db.rpc('kiosk_search_members', { p_query: 'a' }) },
  ]))

  if (!authed) { summary(all); return }

  // ── Admin Dashboard ──────────────────────────────────────
  all.push(...await suite('Admin Dashboard — Before vs After', [
    {
      name: '[BEFORE] open sessions join',
      fn: () => db.from('attendance').select('id,member_id,check_in,profiles!attendance_member_id_fkey(name)').is('check_out', null),
    },
    {
      name: '[BEFORE] profiles member count',
      fn: () => db.from('profiles').select('id,status').eq('role','member'),
    },
    {
      name: '[BEFORE] memberships status scan',
      fn: () => db.from('memberships').select('status'),
    },
    {
      name: '[BEFORE] 7-day attendance loop  (×7 sequential)',
      fn: async () => {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate()-i)
          const ds = d.toISOString().split('T')[0]
          await db.from('attendance').select('id',{count:'exact',head:true}).gte('check_in',ds+'T00:00:00').lt('check_in',ds+'T23:59:59')
        }
      },
    },
    {
      name: '[AFTER]  admin_dashboard_stats() RPC',
      fn: () => db.rpc('admin_dashboard_stats'),
    },
  ]))

  // ── Reports ──────────────────────────────────────────────
  all.push(...await suite('Reports Page — Before vs After', [
    {
      name: '[BEFORE] 14-day attendance loop  (×14 sequential)',
      fn: async () => {
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate()-i)
          const ds = d.toISOString().split('T')[0]
          await db.from('attendance').select('id',{count:'exact',head:true}).gte('check_in',ds+'T00:00:00').lt('check_in',ds+'T23:59:59')
        }
      },
    },
    {
      name: '[BEFORE] 14-day revenue loop    (×14 sequential)',
      fn: async () => {
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate()-i)
          const ds = d.toISOString().split('T')[0]
          await db.from('memberships').select('amount_paid').gte('created_at',ds+'T00:00:00').lt('created_at',ds+'T23:59:59')
        }
      },
    },
    {
      name: '[BEFORE] full attendance scan (peak hours)',
      fn: () => db.from('attendance').select('check_in'),
    },
    {
      name: '[BEFORE] full memberships scan (methods)',
      fn: () => db.from('memberships').select('amount_paid,payment_method'),
    },
    {
      name: '[AFTER]  admin_reports_data(14) RPC',
      fn: () => db.rpc('admin_reports_data', { p_days: 14 }),
    },
  ]))

  // ── Leaderboard ──────────────────────────────────────────
  all.push(...await suite('Leaderboard — Before vs After', [
    {
      name: '[BEFORE] full attendance scan + join',
      fn: () => {
        const ms = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        return db.from('attendance').select('member_id,profiles!attendance_member_id_fkey(name,avatar_url)').gte('check_in',ms)
      },
    },
    {
      name: '[AFTER]  leaderboard_visits(50) RPC',
      fn: () => db.rpc('leaderboard_visits', { p_limit: 50 }),
    },
    {
      name: '[AFTER]  leaderboard_streak(50) RPC',
      fn: () => db.rpc('leaderboard_streak', { p_limit: 50 }),
    },
  ]))

  // ── Member Home ──────────────────────────────────────────
  all.push(...await suite('Member Home — Before vs After', [
    {
      name: '[BEFORE] 7 parallel queries',
      fn: async () => {
        const { data: { user } } = await db.auth.getUser()
        if (!user) return
        const ms = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        await Promise.all([
          db.from('attendance').select('*',{count:'exact',head:true}).eq('member_id',user.id),
          db.from('attendance').select('*',{count:'exact',head:true}).eq('member_id',user.id).gte('check_in',ms),
          db.from('streaks').select('*').eq('member_id',user.id).maybeSingle(),
          db.from('attendance').select('duration_min').eq('member_id',user.id).not('duration_min','is',null),
          db.from('member_badges').select('*',{count:'exact',head:true}).eq('member_id',user.id),
          db.from('badges').select('*',{count:'exact',head:true}),
          db.from('attendance').select('check_in,duration_min').eq('member_id',user.id).order('check_in',{ascending:false}).limit(7),
        ])
      },
    },
    {
      name: '[AFTER]  member_home_stats() RPC',
      fn: () => db.rpc('member_home_stats'),
    },
  ]))

  // ── Middleware ────────────────────────────────────────────
  all.push(...await suite('Middleware cost (per page navigation)', [
    { name: 'auth.getUser()  (JWT validation)',    fn: () => db.auth.getUser() },
    {
      name: 'getUser() + profiles select  (sequential)',
      fn: async () => {
        const { data: { user } } = await db.auth.getUser()
        if (!user) return
        return db.from('profiles').select('role,status,gym_id').eq('id',user.id).maybeSingle()
      },
    },
  ]))

  summary(all)
}

function summary(results) {
  console.log(`\n${c.bold}${c.white}╔══════════════════════════════════════════════╗`)
  console.log(`║                   SUMMARY                   ║`)
  console.log(`╚══════════════════════════════════════════════╝${c.reset}`)

  const pairs = [
    { label:'Admin Dashboard', beforeMatch:['7-day attendance loop','profiles member count','memberships status scan','open sessions'], afterMatch:'admin_dashboard_stats' },
    { label:'Reports Page',    beforeMatch:['14-day attendance loop','14-day revenue loop','full attendance scan','full memberships scan'], afterMatch:'admin_reports_data' },
    { label:'Leaderboard',     beforeMatch:['full attendance scan + join'], afterMatch:'leaderboard_visits' },
    { label:'Member Home',     beforeMatch:['7 parallel queries'], afterMatch:'member_home_stats' },
  ]

  const befores = results.filter(r => r.label.includes('[BEFORE]'))
  const afters  = results.filter(r => r.label.includes('[AFTER]'))

  if (befores.length) {
    console.log(`\n  ${c.bold}Before → After savings:${c.reset}`)
    for (const p of pairs) {
      const bRows = befores.filter(r => p.beforeMatch.some(k => r.label.toLowerCase().includes(k.toLowerCase())))
      const aRow  = afters.find(r => r.label.includes(p.afterMatch))
      if (!bRows.length || !aRow) continue
      const isSeq   = bRows.some(r => r.label.includes('loop') || r.label.includes('sequential'))
      const beforeMs = isSeq ? bRows.reduce((s,r) => s+r.avg, 0) : Math.max(...bRows.map(r => r.avg))
      const saving   = beforeMs - aRow.avg
      const pct      = ((saving/beforeMs)*100).toFixed(0)
      console.log(`\n  ${c.bold}${p.label}${c.reset}`)
      console.log(`    ${fmt(beforeMs)}  →  ${fmt(aRow.avg)}  ` +
        (saving > 0 ? `${c.green}✓ ${pct}% faster${c.reset}` : `${c.yellow}⚠ no gain — SQL migration applied yet?${c.reset}`)
      )
    }
  }

  const mw = results.find(r => r.label.includes('sequential'))
  if (mw) {
    console.log(`\n  ${c.bold}Middleware:${c.reset} ${fmt(mw.avg)} added to every protected page load`)
  }

  const slow = results.filter(r => r.avg > 400 && !r.label.includes('loop') && !r.label.includes('sequential') && !r.label.includes('parallel'))
  if (slow.length) {
    console.log(`\n  ${c.bold}Single queries over 400ms:${c.reset}`)
    slow.sort((a,b) => b.avg-a.avg).forEach(r => console.log(`    ${fmt(r.avg).padEnd(18)} ${c.dim}${r.label}${c.reset}`))
  }

  console.log(`\n${c.dim}  Your machine adds ~15–50ms vs Netlify+Supabase in the same region.`)
  console.log(`  --runs 20  for more stable numbers.   --filter dashboard  to isolate a suite.${c.reset}\n`)
}

main().catch(console.error)
