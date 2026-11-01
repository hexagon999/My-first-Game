import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Enemy = { group: THREE.Group; hp: number; maxHp: number; alive: boolean; respawnAt: number }
type Keys = Record<string, boolean>

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hp, setHp] = useState(100)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [message, setMessage] = useState('Welcome to Greenwind Meadow')
  const [nearby, setNearby] = useState(false)
  const attackRef = useRef<() => void>(() => {})
  const joystickRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#9bc8ce')
    scene.fog = new THREE.Fog('#9bc8ce', 35, 100)

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 180)
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xe4f6ff, 0x61734b, 2.0))
    const sun = new THREE.DirectionalLight(0xffedc4, 2.1)
    sun.position.set(-12, 24, 9)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      new THREE.MeshStandardMaterial({ color: '#668c58', roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(180, 45, '#8ba978', '#78966b')
    grid.position.y = 0.015
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material]
    gridMaterials.forEach(m => { m.transparent = true; m.opacity = 0.16 })
    scene.add(grid)

    const makeTree = (x: number, z: number, scale: number) => {
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 * scale, 0.34 * scale, 2.1 * scale, 6),
        new THREE.MeshStandardMaterial({ color: '#70513a' })
      )
      trunk.position.y = 1.05 * scale
      trunk.castShadow = true
      tree.add(trunk)
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(1.35 * scale, 3.2 * scale, 7),
        new THREE.MeshStandardMaterial({ color: '#356b49', flatShading: true })
      )
      crown.position.y = 3.0 * scale
      crown.castShadow = true
      tree.add(crown)
      tree.position.set(x, 0, z)
      scene.add(tree)
    }

    for (let i = 0; i < 34; i++) {
      const angle = i * 2.399
      const radius = 13 + (i % 5) * 2.4
      makeTree(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.75 + (i % 4) * 0.12)
    }

    const player = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: '#d6e3e8', roughness: 0.8 })
    )
    body.position.y = 1.05
    body.castShadow = true
    player.add(body)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10),
      new THREE.MeshStandardMaterial({ color: '#d5aa83' })
    )
    head.position.y = 1.9
    head.castShadow = true
    player.add(head)
    const tunic = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.62, 0.48),
      new THREE.MeshStandardMaterial({ color: '#3d6e91' })
    )
    tunic.position.y = 1.0
    tunic.castShadow = true
    player.add(tunic)
    scene.add(player)

    const enemies: Enemy[] = []
    const slimeMat = new THREE.MeshStandardMaterial({ color: '#71c98b', roughness: 0.55 })
    for (let i = 0; i < 6; i++) {
      const slime = new THREE.Group()
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 9), slimeMat.clone())
      blob.scale.y = 0.78
      blob.position.y = 0.52
      blob.castShadow = true
      slime.add(blob)
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#19343a' })
      for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat)
        eye.position.set(side * 0.2, 0.65, 0.48)
        slime.add(eye)
      }
      const a = (i / 6) * Math.PI * 2
      slime.position.set(Math.cos(a) * 7, 0, Math.sin(a) * 7)
      scene.add(slime)
      enemies.push({ group: slime, hp: 40, maxHp: 40, alive: true, respawnAt: 0 })
    }

    const keys: Keys = {}
    let yaw = 0
    let lastAttack = 0
    let animation = 0
    let frame = 0
    const clock = new THREE.Clock()

    const attack = () => {
      const now = performance.now()
      if (now - lastAttack < 500) return
      lastAttack = now
      let target: Enemy | undefined
      let distance = 3.4
      for (const enemy of enemies) {
        if (!enemy.alive) continue
        const d = player.position.distanceTo(enemy.group.position)
        if (d < distance) { distance = d; target = enemy }
      }
      if (!target) {
        setMessage('Move closer to a training slime')
        return
      }
      target.hp -= 20
      const material = (target.group.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
      material.color.set('#f5d16d')
      window.setTimeout(() => material.color.set('#71c98b'), 140)
      if (target.hp <= 0) {
        target.alive = false
        target.group.visible = false
        target.respawnAt = now + 6500
        setXp(current => {
          const next = current + 35
          setLevel(old => old + Math.floor(next / 100) - Math.floor(current / 100))
          return next % 100
        })
        setMessage('Training slime defeated · +35 XP')
      } else {
        setMessage('Hit! Training slime HP: ' + target.hp)
      }
    }
    attackRef.current = attack

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth
      const h = mount.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault()
      if (e.code === 'Space' && !e.repeat) attack()
    }
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      animation += dt
      const forward = Number(keys.KeyW || keys.ArrowUp) - Number(keys.KeyS || keys.ArrowDown) - joystickRef.current.y
      const strafe = Number(keys.KeyD || keys.ArrowRight) - Number(keys.KeyA || keys.ArrowLeft) + joystickRef.current.x
      const move = new THREE.Vector3(strafe, 0, -forward)
      if (move.lengthSq() > 0.001) {
        move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
        player.position.addScaledVector(move, 6 * dt)
        player.position.x = clamp(player.position.x, -75, 75)
        player.position.z = clamp(player.position.z, -75, 75)
        player.rotation.y = Math.atan2(move.x, move.z)
      }

      const desiredCamera = new THREE.Vector3(
        player.position.x + Math.sin(yaw) * 8,
        player.position.y + 5.2,
        player.position.z + Math.cos(yaw) * 8
      )
      camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt))
      camera.lookAt(player.position.x, player.position.y + 1.1, player.position.z)

      const now = performance.now()
      for (const enemy of enemies) {
        if (!enemy.alive && now >= enemy.respawnAt) {
          enemy.alive = true
          enemy.hp = enemy.maxHp
          enemy.group.visible = true
        }
        if (enemy.alive) enemy.group.position.y = Math.abs(Math.sin(animation * 2.5 + enemy.group.position.x)) * 0.12
      }

      frame++
      if (frame % 12 === 0) {
        const close = enemies.some(e => e.alive && e.group.position.distanceTo(player.position) < 3.4)
        setNearby(close)
      }
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  const updateJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    const x = clamp(dx, -1, 1)
    const y = clamp(dy, -1, 1)
    joystickRef.current = { x, y }
    e.currentTarget.style.setProperty('--stick-x', `${x * 30}px`)
    e.currentTarget.style.setProperty('--stick-y', `${y * 30}px`)
  }

  const startJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updateJoystick(e)
  }

  const resetJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    joystickRef.current = { x: 0, y: 0 }
    e.currentTarget.style.removeProperty('--stick-x')
    e.currentTarget.style.removeProperty('--stick-y')
  }

  return (
    <main className="game-shell">
      <div className="scene" ref={mountRef} />
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><div><strong>AETHERIA</strong><small>GREENWIND MEADOW</small></div></div>
        <div className="player-level">LEVEL {level}</div>
      </header>
      <section className="status-panel">
        <div className="stat-row"><span>ADVENTURER</span><b>{hp} / 100 HP</b></div>
        <div className="bar"><i style={{ width: hp + '%' }} /></div>
        <div className="stat-row xp-label"><span>EXPERIENCE</span><b>{xp} / 100 XP</b></div>
        <div className="bar xp"><i style={{ width: xp + '%' }} /></div>
      </section>
      <div className="objective"><span className="objective-dot" /> Training grounds <span>·</span> Defeat slimes to earn XP</div>
      <div className="message">{message}</div>
      <div className="controls">
        <div
          className="joystick"
          onPointerDown={startJoystick}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) updateJoystick(e) }}
          onPointerUp={resetJoystick}
          onPointerCancel={resetJoystick}
          onLostPointerCapture={resetJoystick}
        ><span className="stick" /></div>
        <button className={'attack ' + (nearby ? 'ready' : '')} onPointerDown={e => e.preventDefault()} onClick={() => attackRef.current()}>
          <span>⚔</span><small>ATTACK</small>
        </button>
      </div>
      <footer className="help">WASD / ARROWS TO MOVE <span>·</span> SPACE TO ATTACK</footer>
    </main>
  )
}
