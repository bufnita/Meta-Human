import { createRouter, createWebHistory } from 'vue-router'
import { useUtilizatorStore } from '../stores/utilizator'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/autentificare',
      name: 'autentificare',
      component: () => import('../views/AutentificareVizualizare.vue'),
    },
    {
      path: '/',
      name: 'acasa',
      component: () => import('../views/AcasaVizualizare.vue'),
      meta: { necesitaAutentificare: true },
    },
    {
      path: '/monitorizare',
      name: 'monitorizare',
      component: () => import('../views/MonitorizareVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Pacient', 'Admin'] },
    },
    {
      path: '/recomandari',
      name: 'recomandari',
      component: () => import('../views/RecomandariVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Pacient', 'Admin'] },
    },
    {
      path: '/pacienti',
      name: 'pacienti',
      component: () => import('../views/PacientiVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Medic', 'Admin'] },
    },
    {
      path: '/pacienti/:id',
      name: 'detalii-pacient',
      component: () => import('../views/PacientDetaliiVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Medic', 'Admin'] },
    },
    {
      path: '/medici',
      name: 'medici',
      component: () => import('../views/MediciVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Admin'] },
    },
    {
      path: '/alarme',
      name: 'alarme',
      component: () => import('../views/AlarmeVizualizare.vue'),
      meta: { necesitaAutentificare: true, roluri: ['Pacient', 'Medic', 'Admin'] },
    },
  ],
})

router.beforeEach((to) => {
  const utilizatorStore = useUtilizatorStore()
  utilizatorStore.incarcaDinStorage()

  if (to.meta.necesitaAutentificare && !utilizatorStore.esteAutentificat) {
    return { name: 'autentificare' }
  }

  const roluri = to.meta.roluri as string[] | undefined
  if (roluri?.length && !roluri.includes(utilizatorStore.utilizator?.rol ?? '')) {
    return { name: 'acasa' }
  }
})

export default router
