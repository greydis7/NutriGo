import React, { useEffect, useState } from 'react'
import Carousel from './components/Carousel'
import Modal from './components/Modal'
import logo from './assets/iconew.ico'
import producto1Img from './assets/producto1.png'
import producto2Img from './assets/producto2.jpg'
import producto3Img from './assets/producto3.webp'
import producto4Img from './assets/producto4.webp'
import carrusel1 from './assets/carrusel1.webp'
import carrusel2 from './assets/carrusel2.webp'
import carrusel3 from './assets/carrusel3.jpg'
import { sanitize, hashString } from './utils/sanitize'

const categories = ['Todos', 'Suplementos', 'Proteínas', 'Vitaminas']

const defaultProducts = [
  {
    id: 1,
    category: 'Proteínas',
    title: 'Protein Gold',
    description: 'Mezcla premium para recuperación muscular y energía sostenida.',
    image: producto1Img,
    price: 89990,
  },
  {
    id: 2,
    category: 'Suplementos',
    title: 'Creatina Optimum Nutrition',
    description: 'Mejora fuerza y potencia explosiva en tus entrenamientos.',
    image: producto2Img,
    price: 40990,
  },
  {
    id: 3,
    category: 'Suplementos',
    title: 'Optimum Nutrition Pro Gainer',
    description: 'Mezcla óptima de proteínas, carbohidratos y grasas esenciales, para ganar masa muscular.',
    image: producto3Img,
    price: 59990,
  },
  {
    id: 4,
    category: 'Vitaminas',
    title: 'Pro ZMA Sportlab',
    description: 'Combinación de Zinc, Magnesio y Vitamina B6, diseñada para promover la recuperación muscular profunda durante la noche.',
    image: producto4Img,
    price: 39990,
  },
]

const carouselSlides = [
  {
    image: carrusel1,
    heading: 'Transforma tu alimentación, mejora tu vida',
    description: 'Descubre planes y suplementos diseñados para tu bienestar.',
  },
  {
    image: carrusel2,
    heading: 'Nutrición que acompaña tu rutina',
    description: 'Productos pensados para energía, fuerza y recuperación.',
  },
  {
    image: carrusel3,
    heading: 'Acompañamos tu camino hacia una vida más saludable',
    description: 'Profesionales en nutrición deportiva para apoyarte en cada paso de tu transformación.',
  },
]

const formatPrice = (value) =>
  value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

function formatRutInput(value) {
  const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (!cleaned) return ''
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return dv ? `${formattedBody}-${dv}` : formattedBody
}

function translateTitle(title) {
  if (!title) return title
  const translations = {
    salad: 'ensalada',
    chicken: 'pollo',
    soup: 'sopa',
    rice: 'arroz',
    avocado: 'palta',
    bowl: 'tazón',
    tacos: 'tacos',
    beef: 'carne',
    pasta: 'pasta',
    shrimp: 'camarón',
    fish: 'pescado',
    cake: 'pastel',
    smoothie: 'licuado',
    breakfast: 'desayuno',
    dinner: 'cena',
    lunch: 'almuerzo',
    recipe: 'receta',
  }

  return title.replace(/\b([A-Za-z]+)\b/g, (match) => {
    const key = match.toLowerCase()
    return translations[key] || match
  })
}

function validateRut(fullRut) {
  if (!fullRut) return false
  const cleaned = fullRut.toString().toUpperCase().replace(/[^0-9K]/g, '')
  if (cleaned.length < 2) return false
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += parseInt(body[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const rest = 11 - (sum % 11)
  const expectedDv = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest)
  return dv === expectedDv
}

function normalizeString(value) {
  return sanitize(String(value || '').trim())
}

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState('text-base')
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [productos, setProductos] = useState([])
  const [users, setUsers] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [activeTab, setActiveTab] = useState('Tienda')
  const [cartItems, setCartItems] = useState([])
  const [adminForm, setAdminForm] = useState({ id: '', title: '', description: '', category: 'Proteínas', price: '', image: '' })
  const [adminError, setAdminError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', rut: '', password: '' })
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [formError, setFormError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')

  useEffect(() => {
    const savedProducts = window.localStorage.getItem('nutriProducts')
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductos(parsed)
          return
        }
      } catch (error) {
        // ignore invalid storage data
      }
    }
    setProductos(defaultProducts)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('nutriProducts', JSON.stringify(productos))
  }, [productos])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.remove('text-sm', 'text-base', 'text-lg')
    document.body.classList.add(fontSize)
  }, [fontSize])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(''), 2400)
    return () => clearTimeout(timer)
  }, [notification])

  useEffect(() => {
    async function fetchSuggestions() {
      setIsLoadingSuggestions(true)
      setSuggestionsError('')
      try {
        const response = await fetch(
          'https://api.spoonacular.com/recipes/complexSearch?query=ensalada&number=6&language=es&apiKey=5667cea7616e444a958e66d262374828',
        )
        if (!response.ok) throw new Error('Error al obtener sugerencias')
        const data = await response.json()
        const results = Array.isArray(data.results) ? data.results : []
        setSuggestions(results.map((item) => ({ ...item, title: translateTitle(item.title) })))
      } catch (error) {
        setSuggestionsError('No se pudieron cargar las sugerencias nutricionales. Intenta nuevamente más tarde.')
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [])

  const filteredProducts = productos.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory
    const search = searchValue.trim().toLowerCase()
    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    return matchesCategory && matchesSearch
  })

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0)

  const showNotification = (message) => {
    setNotification(message)
  }

  const clearAdminForm = () => {
    setAdminForm({ id: '', title: '', description: '', category: 'Proteínas', price: '', image: '' })
    setAdminError('')
    setEditMode(false)
  }

  const sanitizeProduct = (product) => ({
    id: product.id,
    title: normalizeString(product.title),
    description: normalizeString(product.description),
    category: normalizeString(product.category),
    image: normalizeString(product.image),
    price: Number(product.price) || 0,
  })

  const handleAdminImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAdminForm((prev) => ({ ...prev, image: reader.result || '' }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddToCart = (product) => {
    setCartItems((current) => {
      const exists = current.find((item) => item.id === product.id)
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
    showNotification('Producto agregado al carrito')
  }

  const handleCheckout = () => {
    setCartItems([])
    setIsCartOpen(false)
    showNotification('Compra procesada con éxito. Gracias por tu pedido!')
  }

  const handleRemoveItem = (id) => {
    setCartItems((current) => current.filter((item) => item.id !== id))
    showNotification('Producto eliminado del carrito')
  }

  const handleLogin = async () => {
    const email = normalizeString(loginForm.email)
    const password = normalizeString(loginForm.password)
    if (!email || !password) return { ok: false, message: 'Todos los campos son obligatorios' }
    if (!emailRegex.test(email)) return { ok: false, message: 'Email inválido' }
    const user = users.find((item) => item.email === email)
    if (!user) return { ok: false, message: 'Usuario no encontrado' }
    const hashedPassword = await hashString(password)
    if (hashedPassword !== user.passwordHash) return { ok: false, message: 'Contraseña incorrecta' }
    setIsLoggedIn(true)
    setUsuario({ nombre: user.name })
    showNotification(`Bienvenido ${user.name}`)
    return { ok: true }
  }

  const handleRegistro = async () => {
    const name = normalizeString(signupForm.name)
    const email = normalizeString(signupForm.email)
    const rut = normalizeString(signupForm.rut)
    const password = normalizeString(signupForm.password)

    if (!name || !email || !rut || !password) return { ok: false, message: 'Todos los campos son obligatorios' }
    if (name.length < 3) return { ok: false, message: 'El nombre debe tener al menos 3 caracteres' }
    if (!emailRegex.test(email)) return { ok: false, message: 'Email inválido' }
    if (!validateRut(rut)) return { ok: false, message: 'RUT inválido' }
    if (!passwordRegex.test(password)) return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo' }
    if (users.some((user) => user.email === email)) return { ok: false, message: 'El email ya está registrado' }

    const passwordHash = await hashString(password)
    const newUser = { name, email, rut, passwordHash }
    setUsers((current) => [...current, newUser])
    setFormError('')
    setIsSignupOpen(false)
    showNotification('Registro exitoso. Ahora ingresa con tus credenciales.')
    return { ok: true }
  }

  const handleContactSubmit = (event) => {
    event.preventDefault()
    const name = normalizeString(contactForm.name)
    const email = normalizeString(contactForm.email)
    const message = normalizeString(contactForm.message)

    if (!name || !email || !message) {
      setFormError('Todos los campos de contacto son obligatorios')
      return
    }
    if (name.length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres')
      return
    }
    if (!emailRegex.test(email)) {
      setFormError('Email inválido en el formulario de contacto')
      return
    }
    if (message.length < 10) {
      setFormError('El mensaje debe contener al menos 10 caracteres')
      return
    }

    setFormError('')
    setIsContactOpen(false)
    setContactForm({ name: '', email: '', message: '' })
    showNotification('Mensaje enviado correctamente')
  }

  const handleAdminSubmit = (event) => {
    event.preventDefault()
    const newProduct = sanitizeProduct(adminForm)
    if (!newProduct.title || newProduct.title.length < 3) {
      setAdminError('El título debe tener al menos 3 caracteres')
      return
    }
    if (!newProduct.description || newProduct.description.length < 10) {
      setAdminError('La descripción debe tener al menos 10 caracteres')
      return
    }
    if (!newProduct.category) {
      setAdminError('Selecciona una categoría')
      return
    }
    if (!newProduct.image) {
      setAdminError('Selecciona una imagen para el producto')
      return
    }
    if (newProduct.price <= 0) {
      setAdminError('El precio debe ser mayor que cero')
      return
    }

    if (editMode) {
      setProductos((current) =>
        current.map((product) => (product.id === adminForm.id ? { ...product, ...newProduct } : product)),
      )
      showNotification('Producto actualizado correctamente')
    } else {
      const productToSave = { ...newProduct, id: adminForm.id || Date.now() }
      setProductos((current) => [...current, productToSave])
      showNotification('Producto añadido correctamente')
    }

    clearAdminForm()
  }

  const handleEditProduct = (product) => {
    setEditMode(true)
    setAdminError('')
    setAdminForm({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: String(product.price),
      image: product.image,
    })
    document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDeleteProduct = (id) => {
    setProductos((current) => current.filter((product) => product.id !== id))
    if (adminForm.id === id) clearAdminForm()
    showNotification('Producto eliminado correctamente')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsuario(null)
    showNotification('Sesión cerrada')
  }

  return (
    <div className={`${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${fontSize}`} style={{ minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <img src={logo} alt="NutriGo" />
            <span className="brand-label">NutriGo</span>
          </div>

          <nav className="nav-tabs" aria-label="Navegación principal" role="navigation">
            <button
              type="button"
              className={`tab-button ${activeTab === 'Tienda' ? 'active' : ''}`}
              onClick={() => setActiveTab('Tienda')}
            >
              Tienda
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'Administrador' ? 'active' : ''}`}
              onClick={() => setActiveTab('Administrador')}
            >
              Administrador
            </button>
          </nav>

          <div className="header-actions">
            <div className="auth-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setFormError('')
                  setIsContactOpen(true)
                }}
              >
                Contacto
              </button>
              {isLoggedIn ? (
                <>
                  <div className="user-welcome">
                    <span className="user-avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
                    <span>Hola, {usuario?.nombre}</span>
                  </div>
                  <button type="button" className="secondary-button" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setFormError('')
                      setIsLoginOpen(true)
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setFormError('')
                      setIsSignupOpen(true)
                    }}
                  >
                    Registro
                  </button>
                </>
              )}
              <button
                type="button"
                className="button-primary"
                onClick={() => setIsCartOpen(true)}
                aria-label="Ver carrito"
              >
                🛒 Carrito {cartCount > 0 ? `(${cartCount})` : ''}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsAccessibilityOpen(true)}
              >
                ♿ Accesibilidad
              </button>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, borderRadius: '1rem', background: 'rgba(0,0,0,0.8)', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem' }}>
          {notification}
        </div>
      )}

      <main id="main-content">
        {activeTab === 'Tienda' && (
          <>
            <section className="banner-section">
              <Carousel slides={carouselSlides} />
            </section>

        <section id="productos" className="shop-actions container">
          <div>
            <h1 style={{ margin: 0, fontSize: '2.25rem' }}>Tienda NutriGo</h1>
            <p style={{ marginTop: '0.75rem', color: 'var(--muted)' }}>
              Compra suplementos y vitaminas de calidad, con validaciones y seguridad.
            </p>
          </div>

          <div>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos..."
              className="input-field"
              aria-label="Buscar productos"
            />
            <div className="category-filters" role="group" aria-label="Filtros de categoría" style={{ marginTop: '1rem' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="products-section container">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <span className="product-tag">{product.category}</span>
                <img src={product.image} alt={product.title} className="product-image" />
                <div>
                  <h2 style={{ margin: 0 }}>{product.title}</h2>
                  <p style={{ marginTop: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>{product.description}</p>
                </div>
                <div className="product-actions">
                  <strong>{formatPrice(product.price)}</strong>
                  <button type="button" className="add-cart-button" onClick={() => handleAddToCart(product)}>
                    Añadir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container suggestions-section border-t border-white/10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Sugerencias Nutricionales</h2>
            <p className="mt-2 text-sm text-gray-400">Recetas saludables obtenidas desde Spoonacular.</p>
          </div>

          {isLoadingSuggestions ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-300">Cargando sugerencias...</div>
          ) : suggestionsError ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-100">
              {suggestionsError}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-white/5 text-sm text-gray-400">Sin imagen</div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    )}
    {activeTab === 'Administrador' && (
      <section className="container admin-section border-t border-white/10">
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1.4fr 0.8fr' }}>
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Administración de productos</h2>
                <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>Agrega, edita o elimina productos.</p>
              </div>
              <button type="button" className="secondary-button" onClick={clearAdminForm}>
                Nuevo producto
              </button>
            </div>

            {adminError && (
              <div className="product-card" style={{ background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', color: '#ffcccc' }}>
                {adminError}
              </div>
            )}

            <form id="admin-form" onSubmit={handleAdminSubmit} className="product-card">
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <label style={{ display: 'block' }}>
                  Título
                  <input
                    value={adminForm.title}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                  />
                </label>
                <label style={{ display: 'block' }}>
                  Categoría
                  <select
                    value={adminForm.category}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    {categories.filter((cat) => cat !== 'Todos').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={{ display: 'block' }}>
                Descripción
                <textarea
                  value={adminForm.description}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="input-field"
                />
              </label>

              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <label style={{ display: 'block' }}>
                  Precio
                  <input
                    value={adminForm.price}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, price: e.target.value }))}
                    type="number"
                    min="0"
                    className="input-field"
                  />
                </label>
                <label style={{ display: 'block' }}>
                  Imagen del producto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdminImageChange}
                    className="input-field"
                  />
                </label>
              </div>
              {adminForm.image && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--muted)' }}>Vista previa de la imagen</p>
                  <img
                    src={adminForm.image}
                    alt="Vista previa del producto"
                    style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', maxHeight: '220px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                {editMode && (
                  <button type="button" className="secondary-button" onClick={clearAdminForm}>
                    Cancelar edición
                  </button>
                )}
                <button type="submit" className="button-primary" style={{ minWidth: '180px' }}>
                  {editMode ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Inventario actual</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>Controla los productos guardados en localStorage.</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {productos.map((product) => (
                <div key={product.id} className="product-card">
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', maxHeight: '180px' }}
                        />
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 700 }}>{product.title}</p>
                        <p style={{ marginTop: '0.35rem', color: 'var(--muted)' }}>{formatPrice(product.price)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'end' }}>
                      <button type="button" className="secondary-button" onClick={() => handleEditProduct(product)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ borderColor: 'rgba(255,0,0,0.5)', color: '#ffb3b3' }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )}

        <footer className="catalog-footer">
          <div className="container footer-content">
            <p>Nombre alumno: Greydis Astudillo</p>
            <p>Nombre docente: Víctor Vásquez</p>
            <p>Asignatura: Programación Front End</p>
            <p>Sección: FB50-N3-P13-C1</p>
            <div style={{ marginTop: '0.75rem' }}>
              <button type="button" className="secondary-button" onClick={() => setIsContactOpen(true)}>
                Contacto
              </button>
            </div>
          </div>
        </footer>
      </main>

      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)} aria-hidden="true" />}
      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Carrito de compras">
        <div className="cart-sidebar-header">
          <h2>Tu carrito</h2>
          <button type="button" className="close-cart" onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon">🛒</span>
            <p className="font-semibold">Tu carrito está vacío</p>
            <p>Añade productos desde la tienda para comenzar.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} />
                  <div className="cart-item-info">
                    <p className="cart-item-title">{item.title}</p>
                    <p>{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <button type="button" className="remove-item" onClick={() => handleRemoveItem(item.id)}>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-row">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <button type="button" className="checkout-button" onClick={handleCheckout}>
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </aside>

      <Modal isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} title="Accesibilidad">
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Ajusta el tamaño de letra para tu lectura.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              <button
                type="button"
                className={`secondary-button ${fontSize === 'text-sm' ? 'button-primary' : ''}`}
                onClick={() => setFontSize('text-sm')}
              >
                A-
              </button>
              <button
                type="button"
                className={`secondary-button ${fontSize === 'text-base' ? 'button-primary' : ''}`}
                onClick={() => setFontSize('text-base')}
              >
                Normal
              </button>
              <button
                type="button"
                className={`secondary-button ${fontSize === 'text-lg' ? 'button-primary' : ''}`}
                onClick={() => setFontSize('text-lg')}
              >
                A+
              </button>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Alterna entre modo claro y oscuro.</p>
            <button
              type="button"
              className="button-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            >
              Cambiar a {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title="Contacto">
        <form onSubmit={handleContactSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Nombre
            <input
              value={contactForm.name}
              onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Email
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Mensaje
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="input-field"
            />
          </label>
          {formError && <div className="product-card" style={{ background: 'rgba(255,0,0,0.08)', color: '#ffcccc' }}>{formError}</div>}
          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Enviar mensaje
          </button>
        </form>
      </Modal>

      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Iniciar sesión">
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            const result = await handleLogin()
            if (!result.ok) {
              setFormError(result.message)
              return
            }
            setFormError('')
            setLoginForm({ email: '', password: '' })
            setIsLoginOpen(false)
          }}
        >
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Contraseña
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              className="input-field"
            />
          </label>
          {formError && <div className="product-card" style={{ background: 'rgba(255,0,0,0.08)', color: '#ffcccc' }}>{formError}</div>}
          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Iniciar sesión
          </button>
        </form>
      </Modal>

      <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} title="Registrarse">
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            const result = await handleRegistro()
            if (!result.ok) {
              setFormError(result.message)
              return
            }
            setFormError('')
            setSignupForm({ name: '', email: '', rut: '', password: '' })
            setIsSignupOpen(false)
          }}
        >
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Nombre
            <input
              value={signupForm.name}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Email
            <input
              type="email"
              value={signupForm.email}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            RUT
            <input
              value={signupForm.rut}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, rut: formatRutInput(e.target.value) }))}
              placeholder="11.111.111-1"
              className="input-field"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Contraseña
            <input
              type="password"
              value={signupForm.password}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
              className="input-field"
            />
          </label>
          {formError && <div className="product-card" style={{ background: 'rgba(255,0,0,0.08)', color: '#ffcccc' }}>{formError}</div>}
          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Registrarse
          </button>
        </form>
      </Modal>
    </div>
  )
}
