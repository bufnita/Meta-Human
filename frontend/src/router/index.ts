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
  meta: { necesitaAutentificare: true },
},
{
  path: '/recomandari',
  name: 'recomandari',
  component: () => import('../views/RecomandariVizualizare.vue'),
  meta: { necesitaAutentificare: true },
},
	
    {
      path: '/pacienti',
      name: 'pacienti',
      component: () => import('../views/PacientiVizualizare.vue'),
      meta: { necesitaAutentificare: true },
    },
	
	{
  path: '/monitorizare',
  name: 'monitorizare',
  component: () => import('../views/MonitorizareVizualizare.vue'),
  meta: { necesitaAutentificare: true },
},

{
  path: '/recomandari',
  name: 'recomandari',
  component: () => import('../views/RecomandariVizualizare.vue'),
  meta: { necesitaAutentificare: true },
},
	
    {
      path: '/pacienti/:id',
      name: 'detalii-pacient',
      component: () => import('../views/PacientDetaliiVizualizare.vue'),
      meta: { necesitaAutentificare: true },
    },
    {
      path: '/medici',
      name: 'medici',
      component: () => import('../views/MediciVizualizare.vue'),
      meta: { necesitaAutentificare: true, necesitaAdmin: true },
    },
    {
      path: '/alarme',
      name: 'alarme',
      component: () => import('../views/AlarmeVizualizare.vue'),
      meta: { necesitaAutentificare: true },
    },
  ],
})

router.beforeEach((to) => {
  const utilizatorStore = useUtilizatorStore()
  utilizatorStore.incarcaDinStorage()

  if (to.meta.necesitaAutentificare && !utilizatorStore.esteAutentificat) {
    return { name: 'autentificare' }
  }

  if (to.meta.necesitaAdmin && !utilizatorStore.esteAdmin) {
    return { name: 'acasa' }
  }
})

export default router
